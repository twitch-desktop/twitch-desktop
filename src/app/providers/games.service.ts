import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import {
  concat as _concat,
  find as _find,
  map as _map,
  uniqBy as _uniqBy
} from 'lodash';
import { GetTopGamesGQL, ITopGamesResponse } from './twitch-graphql.service';

export interface IGame {
  id: string;
  name: string;
  boxArtURL: string;
  viewersCount: number;
}

// Service that allows components to get game list information
@Injectable()
export class GameService {
  private games: IGame[] = [];
  private cursor = '';

  constructor(private getTopGamesGQL: GetTopGamesGQL) {}

  async getTopGames() {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL
        .fetch()
        .subscribe((result: ApolloQueryResult<ITopGamesResponse>) => {
          if (result.data) {
            this.cursor = result.data.games.edges.slice(-1)[0].cursor;
            this.games = _map(result.data.games.edges, e => e.node);
            resolve(this.games);
          } else {
            reject();
          }
        });
    });
  }

  async fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.getTopGamesGQL
        .fetch({ cursor: this.cursor })
        .subscribe((result: ApolloQueryResult<ITopGamesResponse>) => {
          if (result.data) {
            this.cursor = result.data.games.edges.slice(-1)[0].cursor;
            this.games = _uniqBy(
              _concat(
                this.games,
                _map(result.data.games.edges, e => e.node)
              ),
              'id'
            );

            resolve(this.games);
          } else {
            reject();
          }
        });
    });
  }

  getGame(id: string) {
    return _find(this.games, game => game.id === id);
  }
}
