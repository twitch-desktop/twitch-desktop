import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {Router} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";

import {ToolbarService} from "../../toolbar/toolbar.service";

// Player component
@Component({
  template: require("./chat.component.html"),
  selector: "tw-chat",
  styles: [require("./chat.component.scss")],
  directives: [MATERIAL_DIRECTIVES, MdProgressCircle, MdSpinner]
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