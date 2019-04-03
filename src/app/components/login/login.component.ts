import { Component, ElementRef, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute, Router, UrlSegmentGroup } from "@angular/router";
const { BrowserWindow } = require('electron').remote

let request = require("request");
let querystring = require("querystring");

import { ToolbarService } from "../../providers/toolbar.service";
import { TwitchService } from "../../providers/twitch.service";
import { WebviewHelper } from "../../directives/webviewhelper.directive";

import config from "../../config";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})

export class LoginComponent implements OnInit {

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

  ngOnInit() {
    /*
      body#kraken_auth{
        background: #221F2A !important;
        color: #dad8de !important;
      }
      .authorize .wrap {
        background: #17141f !important;
        border-bottom: 1px solid #201c2b !important;
        border-top: 1px solid #201c2b !important;
      }

      #header_logo svg path {
        fill: white !important;
      }

      .authorize .signed_in .userinfo p {
        color: white !important;
      }

      .authorize .app_permissions {
        border-top: 1px solid #201c2b !important;
      }
    */

    // Clears toolbar title and logo
    this.toolbarService.setTitle("");
    this.toolbarService.setLogo("");

    let base_url = "https://id.twitch.tv/oauth2/authorize?";

    let params = {
      response_type: "token",
      client_id: config.client_id,
      redirect_uri: "http://localhost",
      scope: ["user_read", "channel_read"].join(" "),
      force_verify: true
    };


    this.authUrl = base_url + querystring.stringify(params);


    let authWindow = new BrowserWindow({
      show: false, webPreferences: {
        nodeIntegration: false
      }
    });

    authWindow.webContents.on('will-redirect', (event, newUrl) => {
      this.getAuthToken(authWindow,newUrl);
    });

    authWindow.loadURL(this.authUrl);
    authWindow.show();


  }

  // Emited from webview when loging process completed
  onLogued() {
    this.userInfo = this.twitchService.authUserInfo;
    this.username = this.userInfo.display_name;
    this.logued = true;
  }

  getAuthToken(authWindow : Electron.BrowserWindow, authUrl: string) {
    if (authUrl.includes('access_token')) {
      // Get access_token from the redirect url
      let token_regex = /localhost\/#access_token=([a-z0-9]{30})/.exec(authUrl);
      let auth_token: string;
      // If we found the token on the redirect url
      if (token_regex && token_regex.length > 1 && token_regex[1]) {

        // Show the spinner and get the token
        auth_token = token_regex[1];

        // Set user as authenticated and fetch user information
        this.twitchService.getAuthenticatedUser(auth_token).then((userInfo) => {
          console.log(userInfo);
          // Trigger (logued) event to login.component
          this.onLogued();
          authWindow.close();
        }).catch((reason) => {
          console.log(reason);
        });
      }
    }
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