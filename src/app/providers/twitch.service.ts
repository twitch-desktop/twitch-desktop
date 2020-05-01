import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApolloQueryResult } from 'apollo-client';
import { difference as _difference, map as _map } from 'lodash';
import querystring from 'querystring';
import request from 'request-promise-native';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Stream } from './channels.service';
import {
  GetCurrentUserOnlineFollowsGQL,
  FollowsResponse
} from './twitch-graphql.service';

@Injectable()
export class TwitchService {
  private followedOnlineStreams = [];
  private pullingSubscription = null;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private getOnlineFollowsGQL: GetCurrentUserOnlineFollowsGQL
  ) {}

  async getVideoUrl(stream: Stream): Promise<string> {
    // Get access_token required to read video data
    const username = stream.broadcaster.login;
    const tokenUrl = `https://api.twitch.tv/api/channels/${username}/access_token`;
    const body = await request({
      method: 'GET',
      url: tokenUrl,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
        'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6' // Token used by twitch web
      },
      body: {
        ['need_https']: true,
        ['oauthToken']: undefined, // FIXME: Optional
        ['platform']: 'web',
        ['player_backend']: 'mediaplayer',
        ['player_type']: 'site'
      },
      json: true
    });

    // Setup video source url with the channel access_token
    const baseUrl = `https://usher.ttvnw.net/api/channel/hls/${username}.m3u8?`;
    const qs = {
      ['allow_source']: true,
      ['baking_bread']: true,
      ['baking_brownies']: true,
      ['baking_brownies_timeout']: 1050,
      ['fast_bread']: true,
      ['p']: Math.round(Math.random() * 1e7),
      ['player_backend']: 'mediaplayer',
      ['playlist_include_framerate']: true,
      ['reassignments_supported']: true,
      ['rtqos']: 'control',
      ['preferred_codecs']: 'avc1',
      ['cdm']: 'wv',
      ['sig']: body.sig,
      ['token']: body.token
    };

    const videoUrl = baseUrl + querystring.stringify(qs);

    return videoUrl;
  }

  subscribeToFollowsOnline(): void {
    this.pullingSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getOnlineFollowsGQL.fetch())
      )
      .subscribe((result: ApolloQueryResult<FollowsResponse>) => {
        const oldOnlineStreams = this.followedOnlineStreams;
        this.followedOnlineStreams = _map(
          result.data.currentUser.followedLiveUsers.edges,
          (e) => e.node.stream.broadcaster.displayName
        );

        const newOnlineStrems = _difference(
          this.followedOnlineStreams,
          oldOnlineStreams
        );

        newOnlineStrems.forEach((displayName) => {
          const myNotification = new Notification(`${displayName}`, {
            body: `${displayName} stream just went online`
          });

          myNotification.onclick = (): void => {
            this.ngZone.run(() =>
              this.router.navigate(['/channels/following'])
            );
          };
        });
      });
  }

  unsubscribeToFollowsOnline(): void {
    this.pullingSubscription.unsubscribe();
  }
}
