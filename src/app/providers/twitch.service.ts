import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

import * as request from "request-promise-native";
let querystring = require("querystring");

import config from "../config";

// Twitch API v3 Service
// https://github.com/justintv/Twitch-API/blob/master/README.md
@Injectable()
export class TwitchService {

  access_token = null;
  twitch = null;
  games_pagination = { cursor: "" };
  streams_pagination = { cursor: "" };
  followed_streams_offset = 0;
  authUrl: string;
  logued: boolean = false;
  authUserInfo: any = null;

  baseUrl = "https://api.twitch.tv/helix";

  // Observable that tell login status changes
  // loginChange.next(null) for logout
  private loginChange: Subject<Object> = new Subject<Object>();
  loginChange$ = this.loginChange.asObservable();

  constructor() { }

  async executeRequest(options, parameters?) {
    let req = {
      method: options.method,
      url: this.baseUrl + options.path,
      qs: parameters,
      headers: {
        "Authorization": options.accessToken ? "Bearer " + options.accessToken : undefined,
        "Client-ID": config.client_id
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

    this.games_pagination=data.pagination;
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

    this.games_pagination=data.pagination;
    return data.data;
  }

  // Returns a promise that resovles to a list of stream objects that are queried by a 
  // number of parameters sorted by number of viewers.
  // If game specified, filters by game
  // If game is null, get top streams of all games
  // https://dev.twitch.tv/docs/api/reference/#get-streams
  async getStreams(game?) {
    if(game) console.log(game);
    let data = await this.executeRequest({
      method: "GET",
      path: "/streams"
    }, {
        game_id: game ? game.id : undefined,
        first: 25
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
        first: 25
      });

    this.streams_pagination=data.pagination;
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

  // Returns a promise that resolves to a list of stream objects that the authenticated user is following.
  // https://github.com/justintv/Twitch-API/blob/master/v3_resources/users.md#get-streamsfollowed
  getFollowedStreams() {
    return new Promise((resolve, reject) => {
      resolve([]);
      /* TODO
      this.executeRequest({
        method: "GET",
        path: "/streams/followed",
        accessToken: this.access_token
      },
        //params
        {
          limit: 25
        }, (err, followedStreams) => {
          if (err || !followedStreams) reject(err);
          else {
            this.followed_streams_offset = 1;
            resolve(followedStreams);
          }
        });
        */
    });
  }
}