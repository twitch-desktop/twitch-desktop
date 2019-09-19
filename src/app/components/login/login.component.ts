import { Component, OnInit } from "@angular/core";
import { ToolbarService } from "../../providers/toolbar.service";
import { TwitchAuthService, Login } from "../../providers/twitch-auth-graphql.service";
import { SpinnerService } from "../../providers/spinner.service";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  login: Login;
  error = "";

  login_form = {
    username: "",
    password: ""
  };

  constructor(
    private toolbarService: ToolbarService,
    private twitchAuthService: TwitchAuthService,
    private spinnerService: SpinnerService) {

    this.login = this.twitchAuthService.getLogin();
  }

  ngOnInit() {
    this.toolbarService.setTitle("");
    this.toolbarService.setLogo("");

    this.twitchAuthService.loginChange$.subscribe((login: Login) => {
      this.login = login;
    });
  }

  async logIn() {
    this.spinnerService.show();

    let result: Login = await this.twitchAuthService.logIn(this.login_form.username, this.login_form.password);
    if (result.error) {
      this.error = `Could not log in, ${result.error}`;
    } else {
      this.error = "";
    }

    this.spinnerService.hide();

  }

  logOut() {
    this.twitchAuthService.logOut();
  }
}
