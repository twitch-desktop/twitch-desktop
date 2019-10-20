import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../providers/settings.service";
import { ToolbarService } from "../../providers/toolbar.service";

@Component({
  templateUrl: "./settings.component.html",
  selector: "tw-settings",
  styleUrls: ["./settings.component.scss"]
})
export class SettingsComponent implements OnInit {
  config: any = {};

  constructor(
    private settings: SettingsService,
    private toolbarService: ToolbarService) {
    this.config = this.settings.getConfig();
  }

  ngOnInit() {
    this.toolbarService.setTitle("Settings");
    this.toolbarService.setLogo("settings");
  }

  configChanged() {
    this.settings.setConfig(this.config);
  }
}
