import { Injectable } from "@angular/core";
import { ApolloQueryResult } from "apollo-client";
import { TwitchService } from "./twitch.service";
import { GetGameStreamsGQL, GetTopStreamsGQL, TopStreamsResponse, GameStreamsResponse } from "./twitch-graphql.service";
import { Game } from "./games.service";
import { map, find, union, concat, uniqBy } from "lodash";

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
      }
    }

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

  private streams_list_type: StreamListType;
  private cursor = "";
  private game: Game ;

  constructor(private twitchService: TwitchService,
    private getGameStreamsGQL: GetGameStreamsGQL,
    private getTopStreamsGQL: GetTopStreamsGQL) { }

  async getTopStreams() {
    return new Promise((resolve, reject) => {
      this.getTopStreamsGQL.fetch().subscribe((result: ApolloQueryResult<TopStreamsResponse>) => {
        if (result.data) {
          this.streams_list_type = StreamListType.TopStreams;
          this.cursor = result.data.streams.edges.slice(-1)[0].cursor;
          this.streams = map(result.data.streams.edges, (e) => {
            return e.node;
          });

          resolve(this.streams);
        } else {
          reject();
        }
      });
    });
  }

  async getGameStreams(game: Game) {
    return new Promise((resolve, reject) => {
      this.getGameStreamsGQL.fetch({ name: game.name }).subscribe((result: ApolloQueryResult<GameStreamsResponse>) => {
        if (result.data) {
          this.game = game;
          this.streams_list_type = StreamListType.GameStreams;
          this.cursor = result.data.game.streams.edges.slice(-1)[0].cursor;
          this.streams = map(result.data.game.streams.edges, (e) => {
            return e.node;
          });

          resolve(this.streams);
        } else {
          reject();
        }
      });
    });
  }

  async fetchMoreStreams() {
    switch (this.streams_list_type) {
      case StreamListType.TopStreams:
        return this.fetchMoreTopStreams();
        break;

      case StreamListType.GameStreams:
        return this.fetchMoreGameStreams(this.game);
        break;

      case StreamListType.FollowingStreams:
        break;
    }
  }

  private async fetchMoreTopStreams() {
    return new Promise((resolve, reject) => {
      this.getTopStreamsGQL.fetch({ cursor: this.cursor }).subscribe((result: ApolloQueryResult<TopStreamsResponse>) => {
        if (result.data) {
          this.cursor = result.data.streams.edges.slice(-1)[0].cursor;
          this.streams = uniqBy(
            concat(
              this.streams,
              map(result.data.streams.edges, (e) => e.node)
            ),
            "id"
          );

          resolve(this.streams);
        } else {
          reject();
        }
      });
    });
  }

  private async fetchMoreGameStreams(game: Game) {
    return new Promise((resolve, reject) => {
      this.getGameStreamsGQL.fetch({ name: game.name, cursor: this.cursor }).subscribe((result: ApolloQueryResult<GameStreamsResponse>) => {
        if (result.data) {
          this.cursor = result.data.game.streams.edges.slice(-1)[0].cursor;
          this.streams = uniqBy(
            concat(
              this.streams,
              map(result.data.game.streams.edges, (e) => e.node)
            ),
            "id"
          );

          resolve(this.streams);
        } else {
          reject();
        }
      });
    });
  }

  getChannel(id: string) {
    return find(this.streams, channel => channel.id === id);
  }

  addFollowedChannels(channels) {
    this.streams = union(this.streams, channels);
  }
}
