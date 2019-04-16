import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

import * as request from "request-promise-native";
import * as _ from "lodash";
let querystring = require("querystring");

import config from "../../../config";

// Twitch API v3 Service
// https://dev.twitch.tv/docs/api/reference
@Injectable()
export class TwitchService {

  access_token = null;
  twitch = null;
  games_pagination = { cursor: "" };
  streams_pagination = { cursor: "" };
  followed_streams_offset = 0;
  authUrl: string;
  logued: boolean = false;
  authUserInfo: {
    id, string,
    login: string,
    display_name: string,
    type: string,
    broadcaster_type: string,
    description: string,
    profile_image_url: string,
    offline_image_url: string,
    view_count: number,
    email: string
  };

  baseUrl = "https://api.twitch.tv/helix";

  // Observable that tell login status changes
  // loginChange.next(null) for logout
  private loginChange: Subject<Object> = new Subject<Object>();
  loginChange$ = this.loginChange.asObservable();

  constructor() { }

  async executeRequest(options, parameters?) {

    let authorization = options.accessToken ? "Bearer " + options.accessToken : undefined;
    if (!authorization && this.access_token) authorization = "Bearer " + this.access_token;

    let req = {
      method: options.method,
      url: this.baseUrl + options.path,
      qs: parameters,
      headers: {
        "Authorization": authorization,
        "Client-ID": authorization ? undefined : config.client_id
      },
      body: options.body,
      json: true
    };

    let body = await request(req);
    return body;
  }

  // Return Authenticated User Info
  // https://dev.twitch.tv/docs/api/reference/#get-users
  async getAuthenticatedUser(access_token: string) {

    if (access_token) {
      if (this.authUserInfo !== null && this.access_token === access_token) {
        return Promise.resolve(this.authUserInfo);
      }
      else {
        let data = await this.executeRequest({
          method: "GET",
          path: "/users",
          accessToken: access_token
        });

        this.access_token = access_token;
        this.authUserInfo = data.data[0];
        this.loginChange.next(this.authUserInfo);
        return data;
      }
    }
  }

  // Clears all login information and emit logout event
  logout() {
    this.authUserInfo = null;
    this.access_token = null;
    this.logued = false;
    this.loginChange.next(null);
  }

  // Returns a promise that resolves to a list of games objects sorted by number 
  // of current viewers on Twitch, most popular first.
  // https://dev.twitch.tv/docs/api/reference/#get-top-games
  async getTopGames() {
    let data = await this.executeRequest({
      method: "GET",
      path: "/games/top"
    }, {
        first: 25
      });

    this.games_pagination = data.pagination;
    return data.data;
  }

  // Fetch next page of top games
  // https://dev.twitch.tv/docs/api/reference/#get-top-games
  async fetchMoreTopGames() {
    let data = await this.executeRequest({
      method: "GET",
      path: "/games/top"
    }, {
        first: 25,
        after: this.games_pagination.cursor
      });

    this.games_pagination = data.pagination;
    return data.data;
  }

  // Returns a promise that resovles to a list of stream objects that are queried by a 
  // number of parameters sorted by number of viewers.
  // If game specified, filters by game
  // If game is null, get top streams of all games
  // https://dev.twitch.tv/docs/api/reference/#get-streams
  async getStreams(game?) {
    if (game) console.log(game);
    let data = await this.executeRequest({
      method: "GET",
      path: "/streams"
    }, {
        game_id: game ? game.id : undefined,
        first: 24
      });

    this.streams_pagination = data.pagination;
    return data.data;

  }

  // Fetch next page of streams, using this.streams_offset as offset param
  // https://dev.twitch.tv/docs/api/reference/#get-streams
  async fetchMoreStreams(game?) {
    let data = await this.executeRequest({
      method: "GET",
      path: "/streams"
    },
      {
        game_id: game ? game.id : undefined,
        after: this.streams_pagination.cursor,
        first: 24
      });

    this.streams_pagination = data.pagination;
    return data.data;
  }

  async getUserFromId(id: string) {
    let data = await this.executeRequest({
      method: "GET",
      path: "/users",
    }, {
        id: id
      });

    return data.data[0];
  }
  async getGameFromId(id: string) {
    let data = await this.executeRequest({
      method: "GET",
      path: "/games",
    }, {
        id: id
      });

    return data.data[0];
  }


  async getVideoUrl(channel) {
    // Get access_token required to read video data
    let username = (await this.getUserFromId(channel.user_id)).login;

    let token_url = `https://api.twitch.tv/api/channels/${username}/access_token`;
    let body = await request.get({ url: token_url, headers: { "Client-ID": config.client_id }, json: true });

    // Setup video source url with the channel access_token
    let base_url = `https://usher.ttvnw.net/api/channel/hls/${username}.m3u8?`;
    // Params order matter for some reason
    let qs = {
      player: "twitchweb",
      p: Math.round(Math.random() * 1e7),
      type: "any",
      allow_source: true,
      allow_audio_only: true,
      allow_spectre: false,
      sig: body.sig,
      token: body.token
    };
    let video_url = base_url + querystring.stringify(qs);
    return video_url
  }

  // Returns a list of stream objects the authenticated user is following.
  // https://dev.twitch.tv/docs/api/reference/#get-users-follows
  async getFollowedStreams() {
    let user_id = this.authUserInfo.id;

    let data = await this.executeRequest({
      method: "GET",
      path: "/users/follows",
    }, {
        first: 100,
        from_id: user_id
      });

    let ids = _.map(data.data,'to_id');

    data = await this.executeRequest({
      method: "GET",
      path: "/streams"
    }, {
      user_id: ids,
      first: 100
      });
    
    console.log(data);

    return data.data;
  }
}