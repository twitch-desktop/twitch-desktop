import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { remote } from 'electron';
import { AppConfig } from '../environments/environment';
import { ElectronService } from './providers/electron.service';
import { SettingsService } from './providers/settings.service';
import { TwitchAuthService } from './providers/twitch-auth-graphql.service';
import { TwitchService } from './providers/twitch.service';

const mainWindow = remote.getGlobal('mainWindow');
const authToken = localStorage.getItem('authToken');

@Component({
  selector: 'tw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  sidebarState = 'visible';

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private router: Router,
    private twitchAuthService: TwitchAuthService,
    private twitchService: TwitchService,
    private settingsService: SettingsService
  ) {
    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit(): void {
    if (authToken && this.settingsService.getConfig().autologin) {
      this.twitchAuthService.setAuthToken(authToken);
    } else {
      localStorage.removeItem('authToken');
    }

    // Browse games as start page
    this.router.navigate(['/games']);
  }

  closeWindow(): void {
    mainWindow.close();
  }

  maximizeWindow(): void {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }

  minimizeWindow(): void {
    mainWindow.minimize();
  }

  enterFullscreen(): void {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }

  toggleSidebar(): void {
    if (this.sidebarState === 'visible') {
      this.sidebarState = 'hidden';
    } else if (this.sidebarState === 'hidden') {
      this.sidebarState = 'visible';
    }
  }
}
