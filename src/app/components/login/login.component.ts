import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';
import { SpinnerService } from '../../providers/spinner.service';
import { ToolbarService } from '../../providers/toolbar.service';
import {
  Login,
  TwitchAuthService
} from '../../providers/twitch-auth-graphql.service';

import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('webview') webview: ElementRef;
  login: Login;
  login_url = 'https://passport.twitch.tv/sessions/new?clientId=settings_page';

  constructor(
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService,
    private spinnerService: SpinnerService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.login = this.twitchAuthService.getLogin();
  }

  ngOnInit(): void {
    this.toolbarService.setTitle('');
    this.toolbarService.setLogo('');

    this.twitchAuthService.loginChange$.subscribe((login: Login) => {
      this.login = login;
    });
  }

  logOut(): void {
    this.twitchAuthService.logOut();
  }
}
