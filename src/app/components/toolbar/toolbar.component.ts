import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

import { TwitchAuthService, Login } from "../../providers/twitch-auth-graphql.service";
import { ToolbarService } from "../../providers/toolbar.service";

export interface SubheaderValue {
  player_username: string;
  player_game: string;
  player_logo: string;
}

// Toolbar component
@Component({
  templateUrl: "./toolbar.component.html",
  selector: "tw-toolbar",
  styleUrls: ["./toolbar.component.scss"]
})
export class ToolbarComponent implements OnInit, SubheaderValue {
  // Toolbar button events
  @Output() close = new EventEmitter();
  @Output() maximize = new EventEmitter();
  @Output() minimize = new EventEmitter();
  @Output() collapse = new EventEmitter();
  @Output() fullscreen = new EventEmitter();

  title: string = null;
  logo: string = null;
  login: Login;
  isFullscreen = false;
  player_username: string = null;
  player_game: string = null;
  player_logo: string = null;
  sidebar_collapsed = false;

  constructor(
    public router: Router,
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService) {
    this.login = this.twitchAuthService.getLogin();
    if (this.login.username === "") {
      this.login.username = "Guest";
    }
  }

  ngOnInit() {
    this.twitchAuthService.loginChange$.subscribe((login: Login) => {
      this.login = login;
    });

    // Subscribe to title changes
    this.toolbarService.titleChange$.subscribe(title => {
      this.title = title;
    });

    // Subscribe to logo changes
    this.toolbarService.logoChange$.subscribe(logo => {
      this.logo = logo;
    });

    // Subscribe to subheader change
    this.toolbarService.subheaderChange$.subscribe(subHeader => {
      if (!subHeader) {
        this.player_username = null;
        this.player_game = null;
        this.player_logo = null;
      } else {
        this.player_username = subHeader.player_username;
        this.player_game = subHeader.player_game;
        this.player_logo = subHeader.player_logo;
      }
    });
  }

  closeWindow() {
    this.close.emit("event");
  }

  maximizeWindow() {
    this.maximize.emit("event");
  }

  minimizeWindow() {
    this.minimize.emit("event");
  }

  enterFullscreen() {
    this.fullscreen.emit("event");
    this.isFullscreen = !this.isFullscreen;
  }

  collapseSidebar() {
    this.sidebar_collapsed = !this.sidebar_collapsed;
    this.collapse.emit("event");
  }
}
