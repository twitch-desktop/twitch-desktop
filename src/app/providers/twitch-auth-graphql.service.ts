import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import request from 'request-promise-native';
import { Subject } from 'rxjs';
import { SettingsService } from './settings.service';
import { GetUserInfoGQL, UserInfoResponse } from './twitch-graphql.service';
import { TwitchService } from './twitch.service';

export interface Login {
  logued?: boolean;
  authToken?: string;
  username?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TwitchAuthService {
  private login: Login = {
    username: '',
    authToken: '',
    logued: false,
    error: ''
  };

  constructor(
    private getUserInfoGQL: GetUserInfoGQL,
    private twitchService: TwitchService,
    private settingsService: SettingsService
  ) {}

  private loginChange: Subject<Login> = new Subject<Login>();
  loginChange$ = this.loginChange.asObservable();

  setAuthToken(token: string): void {
    this.login.authToken = token;
    this.login.logued = true;
    localStorage.setItem('authToken', token);

    this.getUserInfoGQL
      .fetch()
      .subscribe((result: ApolloQueryResult<UserInfoResponse>) => {
        this.login.username = result.data.currentUser.displayName;
        this.loginChange.next(this.login);

        if (this.settingsService.getConfig().notifications) {
          this.twitchService.subscribeToFollowsOnline();
        }

        this.settingsService
          .getStore()
          .onDidChange('notifications', (newValue) => {
            if (newValue === false) {
              this.twitchService.unsubscribeToFollowsOnline();
            } else {
              this.twitchService.subscribeToFollowsOnline();
            }
          });
      });
  }

  getLogin(): Login {
    return this.login;
  }

  logIn(username, password): Promise<Login> {
    return new Promise((resolve) => {
      const j = request.jar();
      const url = 'https://passport.twitch.tv/login';
      const options = {
        method: 'POST',
        url,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0'
        },
        body: {
          username,
          password,
          clientId: 'kimne78kx3ncx6brgo4mv6wki5h1ko'
        },
        json: true,
        jar: j
      };

      request(options)
        .then((data) => {
          if (data.access_token) {
            this.setAuthToken(data.access_token);
            resolve(this.login);
          } else {
            resolve({
              error: 'Wrong username or password'
            });
          }
        })
        .catch((err) => {
          console.log(err);
          resolve({
            error: err.error.error_description
          });
        });
    });
  }

  logOut(): void {
    this.login = {
      username: '',
      authToken: '',
      logued: false,
      error: ''
    };
    localStorage.removeItem('authToken');
    this.loginChange.next(this.login);
  }
}
