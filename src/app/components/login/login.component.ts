import { Component, ElementRef, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";
const { BrowserWindow } = require("electron").remote;
import * as request from "request-promise-native";
import { ToolbarService } from "../../providers/toolbar.service";
import { TwitchAuthService, Login } from "../../providers/twitch-auth-graphql.service";

let loginhtml = require("electron").remote.getGlobal("loginhtml");


@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  authUrl: string;
  logued: Boolean = false;
  username: string;
  login: Login;
  login_form = {
    username: '',
    password: ''
  }

  constructor(
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService) {

    this.login = this.twitchAuthService.getLogin();
  }

  ngOnInit() {
    // Clears toolbar title and logo
    this.toolbarService.setTitle("");
    this.toolbarService.setLogo("");

    this.twitchAuthService.loginChange$.subscribe((login: Login) => {
      this.login = login;
    });
  }

  logIn() {
    const j = request.jar()
    const url = 'https://passport.twitch.tv/login';
    var options = {
      method: 'POST',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
      },
      body: {
        username: this.login_form.username,
        password: this.login_form.password,
        client_id: 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      json: true,
      jar: j
    };

    request(options).then((data) => {
      if (data.access_token) {
        //console.log(j.getCookieString(url));
        this.twitchAuthService.setAuthToken(data.access_token);
      }
      else {
        console.log('Auth error');
        console.log(data);
      }
    })
      .catch((err) => {
        console.log(err);
      });
  }

  logOut() {
    //
  }
}
