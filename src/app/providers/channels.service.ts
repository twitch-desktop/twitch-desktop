import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import { uniqBy } from 'lodash';
import { Game } from './games.service';
import {
  GetCurrentUserOnlineFollowsGQL,
  GetGameStreamsGQL,
  GetTopStreamsGQL,
  FollowsResponse,
  GameStreamsResponse,
  TopStreamsResponse
} from './twitch-graphql.service';
import { TwitchService } from './twitch.service';

export interface Stream {
  id: string;
  broadcaster: {
    id: string;
    displayName: string;
    login: string;
    broadcastSettings: {
      title: string;
      game: {
        id: string;
        name: string;
      };
    };
  };
  previewImageURL: string;
  viewersCount: number;
  createdAt: Date;
}
enum StreamListType {
  TopStreams,
  FollowingStreams,
  GameStreams
}

// Service that allows components to get channel list information
@Injectable()
export class ChannelService {
  private streams: Stream[] = [];
  private activeStream: Stream;
  private streamsListType: StreamListType;
  private cursor = '';
  private game: Game;

  constructor(
    private twitchService: TwitchService,
    private getGameStreamsGQL: GetGameStreamsGQL,
    private getTopStreamsGQL: GetTopStreamsGQL,
    private getOnlineFollowsGQL: GetCurrentUserOnlineFollowsGQL
  ) {}

  set currentStream(stream: Stream) {
    this.activeStream = stream;
  }

  get currentStream(): Stream {
    return this.activeStream;
  }

  getTopStreams(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getTopStreamsGQL
        .fetch({ cursor: '' })
        .subscribe((result: ApolloQueryResult<TopStreamsResponse>) => {
          if (result.data) {
            this.streamsListType = StreamListType.TopStreams;
            this.cursor = result.data.streams.edges.slice(-1)[0].cursor;
            this.streams = result.data.streams.edges.map((e) => e.node);
            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }

  getGameStreams(game: Game): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getGameStreamsGQL
        .fetch({ name: game.name, cursor: '' })
        .subscribe((result: ApolloQueryResult<GameStreamsResponse>) => {
          if (result.data) {
            this.game = game;
            this.streamsListType = StreamListType.GameStreams;
            this.cursor = result.data.game.streams.edges.slice(-1)[0].cursor;
            this.streams = result.data.game.streams.edges.map((e) => e.node);
            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }

  getFollowedStreams(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getOnlineFollowsGQL
        .fetch({ cursor: '' })
        .subscribe((result: ApolloQueryResult<FollowsResponse>) => {
          if (result.data) {
            this.streamsListType = StreamListType.FollowingStreams;
            this.cursor = result.data.currentUser.followedLiveUsers.edges.slice(
              -1
            )[0].cursor;
            this.streams = result.data.currentUser.followedLiveUsers.edges.map(
              (e) => e.node.stream
            );
            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }

  fetchMoreStreams(): Promise<unknown> {
    switch (this.streamsListType) {
      case StreamListType.TopStreams:
        return this.fetchMoreTopStreams();
        break;

      case StreamListType.GameStreams:
        return this.fetchMoreGameStreams(this.game);
        break;

      case StreamListType.FollowingStreams:
        return this.fetchMoreFollowedStreams();
        break;
    }
  }

  private fetchMoreTopStreams(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getTopStreamsGQL
        .fetch({ cursor: this.cursor })
        .subscribe((result: ApolloQueryResult<TopStreamsResponse>) => {
          if (result.data) {
            this.cursor = result.data.streams.edges.slice(-1)[0].cursor;
            this.streams = uniqBy(
              this.streams.concat(result.data.streams.edges.map((e) => e.node)),
              'id'
            );

            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }

  private fetchMoreGameStreams(game: Game): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getGameStreamsGQL
        .fetch({ name: game.name, cursor: this.cursor })
        .subscribe((result: ApolloQueryResult<GameStreamsResponse>) => {
          if (result.data) {
            this.cursor = result.data.game.streams.edges.slice(-1)[0].cursor;
            this.streams = uniqBy(
              this.streams.concat(
                result.data.game.streams.edges.map((e) => e.node)
              ),
              'id'
            );

            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }

  private fetchMoreFollowedStreams(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.getOnlineFollowsGQL
        .fetch({ cursor: this.cursor })
        .subscribe((result: ApolloQueryResult<FollowsResponse>) => {
          if (result.data) {
            this.cursor = result.data.currentUser.followedLiveUsers.edges.slice(
              -1
            )[0].cursor;
            this.streams = uniqBy(
              this.streams.concat(
                result.data.currentUser.followedLiveUsers.edges.map(
                  (e) => e.node.stream
                )
              ),
              'id'
            );

            resolve(this.streams);
          } else {
            reject();
          }
        });
    });
  }
}
