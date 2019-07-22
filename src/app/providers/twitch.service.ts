import { Injectable, NgZone } from "@angular/core";
import request from "request-promise-native";
import querystring from "querystring";
import { Stream } from "./channels.service";
import { interval, pipe } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";
import { ApolloQueryResult } from "apollo-client";
import { GetCurrentUserOnlineFollowsGQL, FollowsResponse } from "./twitch-graphql.service";
import { difference, map } from "lodash";
import { Router } from "@angular/router";


@Injectable()
export class TwitchService {

  private followedOnlineStreams = [];
  private pullingSubscription = null;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private getOnlineFollowsGQL: GetCurrentUserOnlineFollowsGQL) { }

  async getVideoUrl(stream: Stream) {
    // Get access_token required to read video data
    let username = stream.broadcaster.login;
    let token_url = `https://api.twitch.tv/api/channels/${username}/access_token`;
    let body = await request({
      method: "GET",
      url: token_url,
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0",
        "Client-ID": "jzkbprff40iqj646a697cyrvl0zt2m6" // Token used by twitch web
      },
      body: {
        "need_https": true,
        "oauth_token": undefined, // FIXME: Optional
        "platform": "web",
        "player_backend": "mediaplayer",
        "player_type": "site"
      },
      json: true
    });

    // Setup video source url with the channel access_token
    let base_url = `https://usher.ttvnw.net/api/channel/hls/${username}.m3u8?`;
    let qs = {
      allow_source: true,
      baking_bread: true,
      baking_brownies: true,
      baking_brownies_timeout: 1050,
      fast_bread: true,
      p: Math.round(Math.random() * 1e7),
      player_backend: "mediaplayer",
      playlist_include_framerate: true,
      reassignments_supported: true,
      rtqos: "control",
      preferred_codecs: "avc1",
      cdm: "wv",
      sig: body.sig,
      token: body.token
    };

    let video_url = base_url + querystring.stringify(qs);

    return video_url;
  }

  subscribeToFollowsOnline() {
    this.pullingSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getOnlineFollowsGQL.fetch())
      )
      .subscribe((result: ApolloQueryResult<FollowsResponse>) => {
        let oldOnlineStreams = this.followedOnlineStreams;
        this.followedOnlineStreams = map(result.data.currentUser.followedLiveUsers.edges, e => e.node.stream.broadcaster.displayName);

        let newOnlineStrems = difference(this.followedOnlineStreams, oldOnlineStreams);

        newOnlineStrems.forEach((displayName) => {
          let myNotification = new Notification(`${displayName}`, {
            body: `${displayName} stream just went online`
          });

          myNotification.onclick = () => {
            this.ngZone.run(() => this.router.navigate(["/channels/following"]));
          };
        });
      });
  }

  unsubscribeToFollowsOnline() {
    this.pullingSubscription.unsubscribe();
  }

}
