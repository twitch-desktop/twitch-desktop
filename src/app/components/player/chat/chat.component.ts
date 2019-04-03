import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {Router} from "@angular/router";

import {ToolbarService} from "../../../providers/toolbar.service";

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
      webview.executeJavaScript(`localStorage.setItem('chatSettings','{"darkMode":true}');`, false);
    });

    webview.addEventListener("did-finish-load", (event) => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {

  }
}