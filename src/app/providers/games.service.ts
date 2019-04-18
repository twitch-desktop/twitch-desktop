import { Injectable } from "@angular/core";

import { TwitchService } from "./twitch.service";
let _ = require("lodash");

// Service that allows components to get game list information
@Injectable()
export class GameService {

  private games: Array<any> = [];

  constructor(private twitchService: TwitchService) {}

  async getTopGames() {
    let games = await this.twitchService.getTopGames();
    this.games = games;
    return games;
  }

  async fetchMoreTopGames() {
    let games = await this.twitchService.fetchMoreTopGames();
    this.games = _.concat(this.games, games);
    return this.games;
  }

  getGame(id: string) {
    return _.find(this.games, (game) => {
      return game.id === id;
    });
  }
}