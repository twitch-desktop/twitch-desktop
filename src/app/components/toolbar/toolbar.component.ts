import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

import { TwitchService } from "../../providers/twitch.service";
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
  logued: boolean = false;
  username: string = "Guest";
  isFullscreen: boolean = false;
  player_username: string = null;
  player_game: string = null;
  player_logo: string = null;
  sidebar_collapsed = false;

  constructor(
    public router: Router,
    private toolbarService: ToolbarService,
    private twitchService: TwitchService
  ) {
    // Subscribe to login changes
    twitchService.loginChange$.subscribe((userInfo: any) => {
      if (userInfo) {
        this.username = userInfo.display_name;
        this.logued = true;
      } else {
        this.username = "Guest";
        this.logued = false;
      }
    });

    // Subscribe to title changes
    toolbarService.titleChange$.subscribe(title => {
      this.title = title;
    });

    // Subscribe to logo changes
    toolbarService.logoChange$.subscribe(logo => {
      this.logo = logo;
    });

    // Subscribe to subheader change
    toolbarService.subheaderChange$.subscribe(subHeader => {
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

  ngOnInit() {}

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
