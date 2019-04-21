import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {Router} from "@angular/router";
import {ToolbarService} from "../../../providers/toolbar.service";

let betterttv = require("electron").remote.getGlobal("betterttv");
import * as Store from 'electron-store';

const schema: any = {
  betterttv: {
    type: 'boolean',
    default: true
  },
  autologin: {
    type: 'boolean',
    default: true
  }
};


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

  constructor (
    private element: ElementRef,
    private router: Router,
    private toolbarService: ToolbarService) {
      this.store = new Store({ schema });

    }


  ngOnInit() {
    // Set dark mode in chat
    let webview = this.element.nativeElement.lastElementChild;
    webview.addEventListener("load-commit", (event) => {
      webview.executeJavaScript(`localStorage.setItem('chatSettings','{"darkMode":true}');`);
      webview.executeJavaScript(`localStorage.setItem('bttv_darkenedMode',true);`);
      
    });

    webview.addEventListener("did-finish-load", (event) => {
      if(this.store.get('betterttv')===true) {
        webview.executeJavaScript(betterttv,false,(result) => {
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
      }
      
    });
  }

  ngOnDestroy() {

  }
}