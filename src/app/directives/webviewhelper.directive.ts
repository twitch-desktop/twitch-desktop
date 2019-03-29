import {Directive, ElementRef, OnInit, OnDestroy, Output, Input, EventEmitter, SimpleChange} from "@angular/core";

import {TwitchService} from "../providers/twitch.service";
import {SpinnerService} from "../providers/spinner.service";
import {ErrorService} from "../providers/errorhandler.service";

@Directive({
  selector: "[webview-helper]"
})

export class WebviewHelper implements OnInit {
  @Output() logued = new EventEmitter();
  @Input() authUrl: string;

  constructor(
    private element: ElementRef,
    private twitchService: TwitchService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService) {
      this.spinnerService.show();

      console.log("Webview-helper init!");
    }

  ngOnInit() {

    // Set the webview source
    this.element.nativeElement.src = this.authUrl;

    let finishLoad = (event) => {
      this.spinnerService.hide();
    };

    // Hide the spinner when webview finish load
    this.element.nativeElement.addEventListener("did-finish-load", finishLoad);

    // Show the spinner when webview start loading
    this.element.nativeElement.addEventListener("did-start-loading", (event) => {
      this.spinnerService.show();
    });

    // On webview redirect
    this.element.nativeElement.addEventListener("did-get-redirect-request", (event) => {

      console.log('On-redirect-request');
      console.log(event);

      // Remove finish-load callback while we do this
      this.element.nativeElement.removeEventListener("did-finish-load", finishLoad);

      // Get access_token from the redirect url
      let token_regex = /localhost\/#access_token=([a-z0-9]{30})/.exec(event.newURL);
      let auth_token: string;
      // If we found the token on the redirect url
      if (token_regex && token_regex.length > 1 && token_regex[1]) {

        // Show the spinner and get the token
        this.spinnerService.show();
        auth_token = token_regex[1];

        // Set user as authenticated and fetch user information
        this.twitchService.getAuthenticatedUser(auth_token).then((userInfo) => {
          console.log(userInfo);
          // Trigger (logued) event to login.component
          this.logued.next("event");
          this.spinnerService.hide();
        }).catch((reason) => {
          console.log(reason);
          this.spinnerService.hide();
          this.errorService.showError("Error during authentication, try again later");
        });
      }
      // If there is not a redirect with the access token, hide the spinner when load finishes
      else {
        this.element.nativeElement.addEventListener("did-finish-load", finishLoad);
      }

    });
  }
}