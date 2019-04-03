import { Injectable } from "@angular/core";

import { TwitchService } from "./twitch.service";
let _ = require("lodash");

// Service that allows components to get channel list information
@Injectable()
export class ChannelService {

  private channels: Array<any> = [];
  private channels_offset: Number = 0;

  constructor(
    private twitchService: TwitchService) {

  }

  async getStreams(game?) {
    let streams = await this.twitchService.getStreams(game);
    this.channels = streams;
    return this.channels;
  }

  async fetchMoreStreams(game?) {
    let streams = await this.twitchService.fetchMoreStreams(game);
    this.channels = _.concat(this.channels, streams);
    return this.channels;
  }

  getChannel(id: string) {
    return _.find(this.channels, (channel) => {
      return channel.id === id;
    });
  }

  addFollowedChannels(channels) {
    this.channels = _.union(this.channels, channels);
  }
}