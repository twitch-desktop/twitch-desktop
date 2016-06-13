import {Component, ElementRef, OnInit, NgZone} from "@angular/core";
import {OnActivate, Router, RouteSegment} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";

let request = require("request");
let querystring = require("querystring");

import {ToolbarService} from "../toolbar/toolbar.service";
import {TwitchService} from "../twitch/twitch.service";
import {WebviewHelper} from "./webviewhelper.directive";

import config from "../config";

@Component({
  template: require("./login.component.html"),
  styles: [require("./login.component.scss")],
  directives: [MATERIAL_DIRECTIVES, WebviewHelper]
})

export class LoginComponent implements OnActivate, OnInit {

  authUrl: string;
  logued: Boolean = false;
  username: string;
  userInfo = {
    display_name: "",
    email: "",
    logo: "",
  };

  constructor(
    private router: Router,
    private element: ElementRef,
    private toolbarService: ToolbarService,
    private twitchService: TwitchService,
    private zone: NgZone) {
  }

  routerOnActivate(curr: RouteSegment): void {
  }

  ngOnInit() {
    // Clears toolbar title and logo
    this.toolbarService.setTitle("");
    this.toolbarService.setLogo("");

    let base_url = "https://api.twitch.tv/kraken/oauth2/authorize?";

    let params = {
      response_type: "token",
      client_id: config.client_id,
      redirect_uri: "http://localhost",
      scope: ["user_read", "channel_read"].join(" "),
      force_verify: true
    };


    this.authUrl = base_url + querystring.stringify(params);
  }

  // Emited from webview when loging process completed
  onLogued() {
    this.userInfo = this.twitchService.authUserInfo;
    this.username = this.userInfo.display_name;
    this.logued = true;
  }

  logout() {
    this.twitchService.logout();
    this.username = null;
    this.logued = false;
    this.userInfo = null;

    // Reload the auth url on the webview
    // Maybe there is a better way to do this
    this.element.nativeElement.firstElementChild.firstElementChild.src = this.authUrl;
  }
}