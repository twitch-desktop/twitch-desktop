import { Injectable } from "@angular/core";

import {TwitchService} from "./twitch.service";
let _ = require("lodash");

// Service that allows components to get game list information
@Injectable()
export class GameService {

  private games: Array<any> = [];
  private games_offset: Number = 0;

  constructor(
    private twitchService: TwitchService) {

  }

  getTopGames() {
    return new Promise((resolve, reject) => {
      this.twitchService.getTopGames().then((games: any) => {
        this.games = games;
        resolve(this.games);
      }).catch((reason) => {
        reject(reason);
      });
    });
  }

  fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.twitchService.fetchMoreTopGames().then((games: any) => {
          this.games = _.concat(this.games, games);
          resolve(this.games);
        }).catch((reason) => {
          reject(reason);
        });
    });
  }

  getGame(id: string) {
    return _.find(this.games, (game) => {
      return game.id === id;
    });
  }
}