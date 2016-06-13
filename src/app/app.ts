///<reference path="../../typings/browser.d.ts"/>

import {bootstrap} from "@angular/platform-browser-dynamic";
import {Component, ViewEncapsulation, Pipe, PipeTransform} from "@angular/core";
import {NgFor} from "@angular/common";
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material";
import {HTTP_PROVIDERS} from "@angular/http";
import {Routes, Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MD_SIDENAV_DIRECTIVES} from "@angular2-material/sidenav";
import * as _ from "lodash";
import * as request from "request";
let m3u8 = require("m3u8");
let Stream = require("stream");
let querystring = require("querystring");

// Electron mainWindow
let mainWindow = require("electron").remote.getGlobal("mainWindow");

// Components
import {PlayerComponent} from "./player/player.component";
import {GamesComponent} from "./games/games.component";
import {ChannelsComponent} from "./channels/channels.component";
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {LoginComponent} from "./login/login.component";
import {SpinnerComponent} from "./spinner/spinner.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {ErrorComponent} from "./error-handler/errorhandler.component";

// Services
import {ErrorService} from "./error-handler/errorhandler.service";
import {SpinnerService} from "./spinner/spinner.service";
import {TwitchService} from "./twitch/twitch.service";
import {ToolbarService} from "./toolbar/toolbar.service";


@Component({
  selector: "ee-app",
  template: require("./app.component.html"),
  styles: [require("./app.scss")],
  encapsulation: ViewEncapsulation.None,
  directives: [
    MATERIAL_DIRECTIVES,
    MD_SIDENAV_DIRECTIVES,
    ROUTER_DIRECTIVES,
    ToolbarComponent,
    SpinnerComponent,
    SidebarComponent,
    ErrorComponent
  ],
  providers: [
    TwitchService,
    ToolbarService,
    SpinnerService,
    ErrorService
  ]
})

@Routes([
  {path: "/play",  component: PlayerComponent},
  {path: "/games", component: GamesComponent},
  {path: "/channels", component: ChannelsComponent},
  {path: "/login", component: LoginComponent}
])

export default class App {
  sidebar_collapsed = false;

  constructor(private router: Router, private twitchService: TwitchService) {}

  ngOnInit() {
    // Browse games as start page
    this.router.navigate(["/games"]);
  }

  closeWindow() {
    mainWindow.close();
  }

  maximizeWindow() {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    }
    else {
      mainWindow.maximize();
    }
  }

  minimizeWindow() {
    mainWindow.minimize();
  }

  enterFullscreen() {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }

  collapseSidebar() {
    this.sidebar_collapsed = !this.sidebar_collapsed;
  }
}

bootstrap(App, [MATERIAL_BROWSER_PROVIDERS, ROUTER_PROVIDERS]);