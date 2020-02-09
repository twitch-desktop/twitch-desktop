import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {SpinnerService} from '../../../providers/spinner.service';
import {ILogin, TwitchAuthService} from '../../../providers/twitch-auth-graphql.service';

// tslint:disable-next-line: no-var-requires
import {Router} from '@angular/router';
import {remote, WebviewTag, Filter} from 'electron';
const session = remote.session;

type Listener = (
  details: Electron.OnBeforeSendHeadersListenerDetails,
  callback: (beforeSendResponse: Electron.BeforeSendResponse) => void
) => void;

@Component({
  selector: 'tw-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webview') webview: ElementRef;
  login: ILogin;
  login_url = 'https://passport.twitch.tv/sessions/new?client_id=settings_page';
  ready: boolean;
  listener: Listener;
  filter: Filter;

  constructor(
    private twitchAuthService: TwitchAuthService,
    private spinnerService: SpinnerService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.login = this.twitchAuthService.getLogin();
    this.ready = false;
    this.filter = {
      urls: ['https://www.twitch.tv/', 'https://gql.twitch.tv/*']
    };
  }

  ngAfterViewInit() {
    let webviewNative: WebviewTag = this.webview.nativeElement;
    webviewNative.addEventListener('dom-ready', () => {
      webviewNative.insertCSS(`
      body.kraken-page {
        background: transparent !important;
        overflow: hidden;
      }
      .tabs {
        display: none !important;
      }
      label {
        color: #dad8de !important;
        font-size: 18px  !important;
        font-weight: 400px  !important;
      }
      input.string, input.text, textarea {
        background: black !important;
        border: 1px solid #212126 !important;
        color: #dad8de !important;
        line-height: 38px !important;
        height: 40px !important;
        font-size: 16px !important;
      }
      .kraken-embed .card .item .sub, .kraken-page .card .item .sub, .twitch_subwindow_container .card .item .sub {
        display: none !important;
      }
      .authorize .wrap {
        background: rgb(24, 24, 27) !important;
        border: 1px solid #212126 !important;
      }
      .authorize .header {
        display: none !important;
      }
      .content-header {
        display: none !important;
      }
      .kraken-embed .card .buttons, .kraken-page .card .buttons, .twitch_subwindow_container .card .buttons {
        border:none !important;
      }
      .kraken-embed .card, .kraken-page .card, .twitch_subwindow_container .card {
        background: transparent !important;
      }
    `);

      if (!this.ready) {
        console.log(this.ready);
        console.log('hide!');
        this.spinnerService.hide();
        this.ready = true;
      }
    });

    this.spinnerService.show();
    this.twitchAuthService.loginChange$.subscribe((login: ILogin) => {
      this.login = login;
    });

    const ses = session.fromPartition('persist:twitch');

    this.listener = (details, callback) => {
      if (details.url === 'https://www.twitch.tv/') {
        this.ngZone.run(() => {
          this.spinnerService.show();
          this.ready = true;
        });
      } else {
        if (!this.login.logued) {
          const authHeader = details.requestHeaders['Authorization'];
          if (authHeader) {
            const regex = /OAuth ([^;]+)/;
            const token = authHeader.match(regex)[1];
            if (token) {
              this.twitchAuthService.setAuthToken(token);
              this.ngZone.run(() => {
                this.router.navigate(['/games']);
              });
            }
          }
        }
      }
      callback({requestHeaders: details.requestHeaders});
    };

    ses.webRequest.onBeforeSendHeaders(this.filter, this.listener);
  }

  logOut() {
    this.twitchAuthService.logOut();
  }

  ngOnDestroy() {
    const ses = session.fromPartition('persist:twitch');
    ses.webRequest.onBeforeSendHeaders(this.filter, null);
  }
}
