import { Component, ElementRef, OnInit, OnDestroy, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ToolbarService } from "../../../providers/toolbar.service";
import { SettingsService } from "../../../providers/settings.service";
const { shell } = require("electron");

let betterttv = require("electron").remote.getGlobal("betterttv");

// Player component
@Component({
  templateUrl: "./chat.component.html",
  selector: "tw-chat",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() chat_url: string;
  isLoading = true;
  store = null;

  constructor(
    private element: ElementRef,
    private router: Router,
    private toolbarService: ToolbarService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    // Set dark mode in chat
    let webview = this.element.nativeElement.lastElementChild;
    webview.addEventListener("load-commit", event => {
      webview.executeJavaScript(
        `localStorage.setItem('bttv_darkenedMode',true);`
      );
    });

    webview.addEventListener("did-finish-load", event => {
      if (this.settings.getConfig().betterttv === true) {
        webview.executeJavaScript(betterttv, false, result => {
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
      }
    });

    if (this.settings.getConfig().openlinks) {
      webview.addEventListener("new-window", e => {
        shell.openExternal(e.url);
      });
    }
  }

  ngOnDestroy() { }
}
