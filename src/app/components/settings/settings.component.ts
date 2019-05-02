import { Component, OnInit } from "@angular/core";
import {SettingsService} from "../../providers/settings.service";

@Component({
  templateUrl: "./settings.component.html",
  selector: "tw-settings",
  styleUrls: ["./settings.component.scss"]
})

export class SettingsComponent implements OnInit {

  config:any= {}

  constructor(
    private settings: SettingsService) {

    this.config = this.settings.getConfig();
  }

  ngOnInit() { }

  configChanged() {
    this.settings.setConfig(this.config);
  }
}