import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../../providers/spinner.service';
import { ToolbarService } from '../../providers/toolbar.service';
import {
  ILogin,
  TwitchAuthService
} from '../../providers/twitch-auth-graphql.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  login: ILogin;
  error = '';

  login_form = {
    username: '',
    password: ''
  };

  constructor(
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService,
    private spinnerService: SpinnerService
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

  async logIn() {
    this.spinnerService.show();

    let result: ILogin = await this.twitchAuthService.logIn(
      this.login_form.username,
      this.login_form.password
    );

    this.error = result.error ? `Could not log in, ${result.error}` : '';
    this.spinnerService.hide();
  }

  logOut() {
    this.twitchAuthService.logOut();
  }
}
