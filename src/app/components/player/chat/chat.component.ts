import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { remote, shell } from 'electron';
import { SettingsService } from '../../../providers/settings.service';

const betterttv = remote.getGlobal('betterttv');
const frankerfacez = remote.getGlobal('frankerfacez');

// Player component
@Component({
  templateUrl: './chat.component.html',
  selector: 'tw-chat',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() chatUrl: string;
  isLoading = true;
  store = null;

  constructor(private element: ElementRef, private settings: SettingsService) {}

  ngOnInit(): void {
    // Set dark mode in chat
    const webview = this.element.nativeElement.lastElementChild;
    webview.addEventListener('load-commit', () => {
      webview.executeJavaScript(
        "localStorage.setItem('bttv_darkenedMode',true);"
      );
    });

    webview.addEventListener('did-finish-load', () => {
      const pluginsPromises = [];

      if (this.settings.getConfig().betterttv === true) {
        pluginsPromises.push(webview.executeJavaScript(betterttv, false));
      }

      if (this.settings.getConfig().frankerfacez === true) {
        pluginsPromises.push(webview.executeJavaScript(frankerfacez, false));
      }

      Promise.allSettled(pluginsPromises).then(() => (this.isLoading = false));
    });

    if (this.settings.getConfig().openlinks) {
      webview.addEventListener('new-window', (e) => {
        shell.openExternal(e.url);
      });
    }
  }
}
