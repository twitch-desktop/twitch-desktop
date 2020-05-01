import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import { uniqBy } from 'lodash';
import { GetTopGamesGQL, TopGamesResponse } from './twitch-graphql.service';

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
  private cursor = '';

  constructor(private getTopGamesGQL: GetTopGamesGQL) {}

  async getTopGames(): Promise<Game[]> {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL
        .fetch()
        .subscribe((result: ApolloQueryResult<TopGamesResponse>) => {
          if (result.data) {
            this.cursor = result.data.games.edges.slice(-1)[0].cursor;
            this.games = result.data.games.edges.map((e) => e.node);
            resolve(this.games);
          } else {
            reject();
          }
        });
    });
  }

  async fetchMoreTopGames(): Promise<Game[]> {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL
        .fetch({ cursor: this.cursor })
        .subscribe((result: ApolloQueryResult<TopGamesResponse>) => {
          if (result.data) {
            this.cursor = result.data.games.edges.slice(-1)[0].cursor;
            this.games = uniqBy(
              this.games.concat(result.data.games.edges.map((e) => e.node)),
              'id'
            );

            resolve(this.games);
          } else {
            reject();
          }
        });
    });
  }

  getGame(id: string): Game {
    return this.games.find((game) => game.id === id);
  }
}
