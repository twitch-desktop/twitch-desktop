import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import request from 'request-promise-native';
import { Subject } from 'rxjs';
import { SettingsService } from './settings.service';
import { GetUserInfoGQL, IUserInfoResponse } from './twitch-graphql.service';
import { TwitchService } from './twitch.service';

export interface ILogin {
  logued?: boolean;
  auth_token?: string;
  username?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TwitchAuthService {
  private login: ILogin = {
    username: '',
    auth_token: '',
    logued: false,
    error: ''
  };

  constructor(
    private getUserInfoGQL: GetUserInfoGQL,
    private twitchService: TwitchService,
    private settingsService: SettingsService
  ) {}

  private loginChange: Subject<ILogin> = new Subject<ILogin>();
  loginChange$ = this.loginChange.asObservable();

  setAuthToken(token: string) {
    this.login.auth_token = token;
    this.login.logued = true;
    localStorage.setItem('auth_token', token);

    this.getUserInfoGQL
      .fetch()
      .subscribe((result: ApolloQueryResult<IUserInfoResponse>) => {
        this.login.username = result.data.currentUser.displayName;
        this.loginChange.next(this.login);

        if (this.settingsService.getConfig().notifications) {
          this.twitchService.subscribeToFollowsOnline();
        }

        this.settingsService
          .getStore()
          .onDidChange('notifications', (newValue, oldValue) => {
            if (newValue === false) {
              this.twitchService.unsubscribeToFollowsOnline();
            } else {
              this.twitchService.subscribeToFollowsOnline();
            }
          });
      });
  }

  getLogin() {
    return this.login;
  }

  logIn(username, password) {
    return new Promise<ILogin>((resolve, reject) => {
      const j = request.jar();
      const url = 'https://passport.twitch.tv/login';
      let options = {
        method: 'POST',
        url,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0'
        },
        body: {
          username,
          password,
          client_id: 'kimne78kx3ncx6brgo4mv6wki5h1ko'
        },
        json: true,
        jar: j
      };

      request(options)
        .then(data => {
          if (data.access_token) {
            this.setAuthToken(data.access_token);
            resolve(this.login);
          } else {
            resolve({
              error: 'Wrong username or password'
            });
          }
        })
        .catch(err => {
          console.log(err);
          resolve({
            error: err.error.error_description
          });
        });
    });
  }

  logOut() {
    this.login = {
      username: '',
      auth_token: '',
      logued: false,
      error: ''
    };
    localStorage.removeItem('auth_token');
    this.loginChange.next(this.login);
  }
}
