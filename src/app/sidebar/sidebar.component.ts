import {Component, OnInit} from "@angular/core";
import {OnActivate, Router, RouteSegment} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";

import {TwitchService} from "../twitch/twitch.service";

// Sidebar component
@Component({
  template: require("./sidebar.component.html"),
  selector: "tw-sidebar",
  styles: [require("./sidebar.component.scss")],
  directives: [
    MATERIAL_DIRECTIVES]
})

export class SidebarComponent implements OnInit {

  onlineStreams: Array<any>;
  logued: boolean = false;

  constructor (
    private router: Router,
    private twitchService: TwitchService) {

    // Subscribe to login change event (login and logout)
    this.twitchService.loginChange$.subscribe((userInfo: any) => {
      // If login
      if (userInfo && userInfo.name) {
        // Fetch online followed streams
        this.logued = true;
        this.twitchService.getFollowedStreams().then((followedStreams: any) => {
          this.onlineStreams = followedStreams.streams;
          console.log(this.onlineStreams);
        }).catch((reason) => {
          // FIXME
        });
      }
      // Logout
      else {
        this.logued = false;
        this.onlineStreams = [];
      }
    });
  }

  ngOnInit() {

  }

}