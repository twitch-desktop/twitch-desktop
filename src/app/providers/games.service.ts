import { Injectable } from "@angular/core";
import { map, uniqBy, concat, find } from "lodash";
import { GetTopGamesGQL, TopGamesResponse } from "./twitch-graphql.service";
import { ApolloQueryResult } from "apollo-client";

export interface Game {
  id: string;
  name: string;
  boxArtURL: string;
  viewersCount: number;
}

// Service that allows components to get game list information
@Injectable()
export class GameService {
  private games: Game[] = [];
  private cursor = "";

  constructor(private getTopGamesGQL: GetTopGamesGQL) { }

  async getTopGames() {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL.fetch().subscribe((result: ApolloQueryResult<TopGamesResponse>) => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = map(result.data.games.edges, (e) => e.node);
          resolve(this.games);
        } else {
          reject();
        }
      });
    });
  }

  async fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL.fetch({ cursor: this.cursor }).subscribe((result: ApolloQueryResult<TopGamesResponse>) => {
        if (result.data) {
          this.cursor = result.data.games.edges.slice(-1)[0].cursor;
          this.games = uniqBy(
            concat(
              this.games,
              map(result.data.games.edges, (e) => e.node)
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
    return find(this.games, game => game.id === id);
  }
}
