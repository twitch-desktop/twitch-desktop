import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {SpinnerService} from '../../providers/spinner.service';
import {ToolbarService} from '../../providers/toolbar.service';
import {ILogin, TwitchAuthService} from '../../providers/twitch-auth-graphql.service';

// tslint:disable-next-line: no-var-requires
import {Router} from '@angular/router';
import {remote, WebviewTag} from 'electron';
const session = remote.session;

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('webview') webview: ElementRef;
  login: ILogin;
  login_url = 'https://passport.twitch.tv/sessions/new?client_id=settings_page';

  constructor(
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService,
    private spinnerService: SpinnerService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.login = this.twitchAuthService.getLogin();
  }

  ngOnInit() {
    this.toolbarService.setTitle('');
    this.toolbarService.setLogo('');

    this.twitchAuthService.loginChange$.subscribe((login: ILogin) => {
      this.login = login;
    });
  }

  logOut() {
    this.twitchAuthService.logOut();
  }
}
