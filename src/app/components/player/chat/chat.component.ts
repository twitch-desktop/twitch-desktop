import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {Router} from "@angular/router";
import * as path from 'path';

import {ToolbarService} from "../../../providers/toolbar.service";

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

  constructor (
    private element: ElementRef,
    private router: Router,
    private toolbarService: ToolbarService) {}


  ngOnInit() {
    // Set dark mode in chat
    let webview = this.element.nativeElement.lastElementChild;
    webview.addEventListener("load-commit", (event) => {
      webview.executeJavaScript(`localStorage.setItem('chatSettings','{"darkMode":true}');`);
      webview.executeJavaScript(`localStorage.setItem('bttv_darkenedMode',true);`);
    });

    webview.addEventListener("did-finish-load", (event) => {
      webview.executeJavaScript(betterttv,false,(result) => {
        webview.openDevTools();
        this.isLoading = false;
        console.log('did-finish-load');
      });
    });
  }

  ngOnDestroy() {

  }
}