import { Injectable } from "@angular/core";
import { map, uniqBy, concat, find } from "lodash";
import { getTopGamesGQL, GQLGame } from "./twitch-graphql.service";

export interface Game {
  id: string;
  name: string;
  cover: string;
  viewersCount: number;
}

// Service that allows components to get game list information
@Injectable()
export class GameService {
  private games: Game[] = [];
  private cursor = "";

  constructor(private gamesGQL: getTopGamesGQL) {}

  async getTopGames() {
    return new Promise((resolve, reject) => {
      this.gamesGQL.fetch().subscribe(result => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = map(result.data.games.edges, (e: GQLGame) => {
            return {
              id: e.node.id,
              name: e.node.name,
              cover: e.node.boxArtURL,
              viewers: e.node.viewersCount
            };
          });

          resolve(this.games);
        } else {
          reject();
        }
      });
    });
  }

  async fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.gamesGQL.fetch({ cursor: this.cursor }).subscribe(result => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = uniqBy(
            concat(
              this.games,
              map(result.data.games.edges, (e: GQLGame) => {
                return {
                  id: e.node.id,
                  name: e.node.name,
                  cover: e.node.boxArtURL,
                  viewers: e.node.viewersCount
                };
              })
            ),
            "id"
          );

          resolve(this.games);
        } else {
          reject();
        }
      });
    });
  }

  getGame(id: string) {
    return find(this.games, game => {
      return game.id === id;
    });
  }
}
