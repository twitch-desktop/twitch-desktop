import {Component, ElementRef, OnInit, NgZone} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";


let request = require("request");
let querystring = require("querystring");

import {ToolbarService} from "../../providers/toolbar.service";
import {TwitchService} from "../../providers/twitch.service";
import {WebviewHelper} from "../../directives/webviewhelper.directive";

import config from "../../config";

@Component({
  template: require("./login.component.html"),
  styles: [require("./login.component.scss")],
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

    // Change login page to a dark theme
    let webview = this.element.nativeElement.lastElementChild.firstElementChild;
    webview.addEventListener("load-commit", (event) => {
      webview.insertCSS(`.authorize .app_permissions,.authorize .wrap{border-top:1px solid #201c2b!important}body#kraken_auth
      {background:#221F2A!important;color:#dad8de!important}.authorize .wrap{background:#17141f!important;
        border-bottom:1px solid #201c2b!important}#header_logo svg path{fill:#fff!important}.authorize .signed_in 
        .userinfo p{color:#fff!important}`);
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
    });

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