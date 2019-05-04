import { Injectable } from "@angular/core";

import { TwitchService } from "./twitch.service";
import * as  _ from "lodash";
import { getTopGamesGQL, Response, GQLGame } from "./twitch-graphql.service";

export interface Game {
  id: string,
  name: string,
  cover: string,
  viewersCount: number
}

// Service that allows components to get game list information
@Injectable()
export class GameService {

  private games: Game[] = [];
  private cursor: string = '';

  constructor(
    private twitchService: TwitchService,
    private gamesGQL: getTopGamesGQL
  ) { }

  async getTopGames() {
    return new Promise((resolve, reject) => {
      this.gamesGQL.fetch().subscribe(result => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = _.map(result.data.games.edges, (e: GQLGame) => {
            return {
              id: e.node.id,
              name: e.node.name,
              cover: e.node.boxArtURL,
              viewers: e.node.viewersCount
            };
          });

          resolve(this.games)
        } else reject();
      });
    });
  }

  async fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.gamesGQL.fetch({ cursor: this.cursor }).subscribe(result => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = _.uniqBy(_.concat(this.games, _.map(result.data.games.edges, (e: GQLGame) => {
            return {
              id: e.node.id,
              name: e.node.name,
              cover: e.node.boxArtURL,
              viewers: e.node.viewersCount
            };
          })), 'id');

          resolve(this.games)
        } else reject();
      });
    });
  }

  getGame(id: string) {
    return _.find(this.games, (game) => {
      return game.id === id;
    });
  }
}