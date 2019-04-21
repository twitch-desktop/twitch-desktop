import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as Store from 'electron-store';

const schema: any = {
  beterttv: {
    type: 'boolean',
    default: true
  },
  autologin: {
    type: 'boolean',
    default: true
  }
};

// Error display component
@Component({
  templateUrl: "./settings.component.html",
  selector: "tw-settings",
  styleUrls: ["./settings.component.scss"]
})

export class SettingsComponent implements OnInit {

  config = {}

  store = null

  constructor(
    private router: Router,
    private route: ActivatedRoute) {

    this.store = new Store({ schema });
    this.config = this.store.store;
  }

  ngOnInit() { }

  configChanged() {
    this.store.store = this.config;
  }
}