import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

let request = require("request");
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

  executeRequest(options, parameters, callback?) {
    if (!callback) {
      callback = parameters;
      parameters = undefined;
    }

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

    request(req, (err, response, body) => {
      if (!err && body && !body.error) {
        callback(null, body);
      }
      else {
        callback(err || body);
      }
    });
  }

  // Return Authenticated User Info
  // https://dev.twitch.tv/docs/api/reference/#get-users
  getAuthenticatedUser(access_token): Promise<any> {

    if (access_token) {
      if (this.authUserInfo !== null && this.access_token === access_token) {
        return Promise.resolve(this.authUserInfo);
      }
      else {
        return new Promise<any>((resolve, reject) => {
          this.executeRequest({
            method: "GET",
            path: "/users",
            accessToken: access_token
          }, (err, userInfo) => {
            if (err || !userInfo || !userInfo.data || !userInfo.data[0]) reject(err);
            else {
              this.access_token = access_token;
              console.log(userInfo);
              this.authUserInfo = userInfo.data[0];
              this.loginChange.next(userInfo.data[0]);
              resolve(userInfo);
            }
          });
        });
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
  getTopGames() {
    return new Promise((resolve, reject) => {
      this.executeRequest({
        method: "GET",
        path: "/games/top"
      },
        { first: 25 },
        (err, games) => {
          if (err || !games || !games.data) reject(err);
          else {
            this.games_pagination = games.pagination;
            resolve(games.data);
          }
        }
      );
    });
  }

  // Fetch next page of top games
  // https://dev.twitch.tv/docs/api/reference/#get-top-games
  fetchMoreTopGames() {
    return new Promise((resolve, reject) => {
      this.executeRequest({
        method: "GET",
        path: "/games/top"
      },
        {
          first: 25,
          after: this.games_pagination.cursor
        },
        (err, games) => {
          if (err || !games) reject(err);
          else {
            this.games_pagination = games.pagination;
            resolve(games.data);
          }
        }
      );
    });
  }

  // Returns a promise that resovles to a list of stream objects that are queried by a 
  // number of parameters sorted by number of viewers.
  // If game specified, filters by game
  // If game is null, get top streams of all games
  // https://dev.twitch.tv/docs/api/reference/#get-streams
  getStreams(game?) {
    return new Promise((resolve, reject) => {
      this.executeRequest({
        method: "GET",
        path: "/streams"
      }, {
          game_id: game ? game.id : null,
          first: 25
        }, (err, streams) => {
          if (err || !streams || !streams.data) reject(err);
          else {
            console.log(streams);
            this.streams_pagination = streams.pagination;
            resolve(streams.data);
          }
        });
    });
  }

  // Fetch next page of streams, using this.streams_offset as offset param
  // https://dev.twitch.tv/docs/api/reference/#get-streams
  fetchMoreStreams(game?) {
    return new Promise((resolve, reject) => {
      this.executeRequest({
        method: "GET",
        path: "/streams"
      },
        //Params
        {
          game_id: game ? game.id : null,
          after: this.streams_pagination.cursor,
          first: 25

        }, (err, streams) => {
          if (err || !streams) reject(err);
          else {
            console.log(streams);
            this.streams_pagination = streams.pagination;
            resolve(streams.data);
          }
        });
    });
  }

  getUserLoginFromId(id: string) {
    return new Promise((resolve, reject) => {
      let data: any = this.executeRequest({
        method: "GET",
        path: "/users",
      }, {
          id: id
        }, (err, data) => {
          if (err || !data) reject(err);
          console.log(data);
          let username = data.data[0].login;
          resolve(username);
        });
    });
  }

  getVideoUrl(channel) {
    return new Promise(async (resolve, reject) => {

      // Get access_token required to read video data
      let username = await this.getUserLoginFromId(channel.user_id)
      console.log(username);

      if (!username) reject();

      let token_url = `https://api.twitch.tv/api/channels/${username}/access_token`;
      request.get({ url: token_url, headers: { "Client-ID": config.client_id }, json: true }, (error, response, body) => {

        if (error) reject();

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
        resolve(video_url);
      });
    });
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