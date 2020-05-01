import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { ToolbarService } from '../../providers/toolbar.service';
import {
  Login,
  TwitchAuthService
} from '../../providers/twitch-auth-graphql.service';

export interface SubheaderValue {
  playerUsername: string;
  playerGame: string;
  playerLogo: string;
}

// Toolbar component
@Component({
  templateUrl: './toolbar.component.html',
  selector: 'tw-toolbar',
  styleUrls: ['./toolbar.component.scss']
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
  playerUsername: string = null;
  playerGame: string = null;
  playerLogo: string = null;
  sidebarCollapsed = false;

  constructor(
    public router: Router,
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService
  ) {
    this.login = this.twitchAuthService.getLogin();
    if (this.login.username === '') {
      this.login.username = 'Guest';
    }
  }

  ngOnInit(): void {
    this.twitchAuthService.loginChange$.subscribe((login: Login) => {
      this.login = login;
    });

    // Subscribe to title changes
    this.toolbarService.titleChange$.subscribe((title) => {
      this.title = title;
    });

    // Subscribe to logo changes
    this.toolbarService.logoChange$.subscribe((logo) => {
      this.logo = logo;
    });

    // Subscribe to subheader change
    this.toolbarService.subheaderChange$.subscribe((subHeader) => {
      if (!subHeader) {
        this.playerUsername = null;
        this.playerGame = null;
        this.playerLogo = null;
      } else {
        this.playerUsername = subHeader.playerUsername;
        this.playerGame = subHeader.playerGame;
        this.playerLogo = subHeader.playerLogo;
      }
    });
  }

  closeWindow(): void {
    this.close.emit('event');
  }

  maximizeWindow(): void {
    this.maximize.emit('event');
  }

  minimizeWindow(): void {
    this.minimize.emit('event');
  }

  enterFullscreen(): void {
    this.fullscreen.emit('event');
    this.isFullscreen = !this.isFullscreen;
  }

  collapseSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.collapse.emit('event');
  }
}
