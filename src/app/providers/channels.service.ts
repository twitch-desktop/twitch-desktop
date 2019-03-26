import { Injectable } from "@angular/core";

import {TwitchService} from "./twitch.service";
let _ = require("lodash");

// Service that allows components to get channel list information
@Injectable()
export class ChannelService {

  private channels: Array<any> = [];
  private channels_offset: Number = 0;

  constructor(
    private twitchService: TwitchService) {

  }

  getStreams(game?) {
    return new Promise((resolve, reject) => {
      this.twitchService.getStreams(game).then((streams: any) => {
        this.channels = streams.streams;
        console.log(this.channels);
        resolve(this.channels);
      }).catch((reason) => {
        reject(reason);
      });
    });
  }

  fetchMoreStreams(game?) {
    return new Promise((resolve, reject) => {
      this.twitchService.fetchMoreStreams(game).then((streams: any) => {
          this.channels = _.concat(this.channels, streams.streams);
          resolve(this.channels);
        }).catch((reason) => {
          reject(reason);
        });
    });
  }

  getChannel(id: string) {
    return _.find(this.channels, (channel) => {
      return channel.channel._id === +id;
    });
  }

  addFollowedChannels(channels) {
    this.channels = _.union(this.channels, channels);
  }
}