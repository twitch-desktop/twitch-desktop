import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

import {TwitchService} from "../../providers/twitch.service";
import {ChannelService} from "../../providers/channels.service";

// Sidebar component
@Component({
  template: require("./sidebar.component.html"),
  selector: "tw-sidebar",
  styles: [require("./sidebar.component.scss")]
})

export class SidebarComponent implements OnInit {

  onlineStreams: Array<any>;
  logued: boolean = false;

  constructor (
    private router: Router,
    private twitchService: TwitchService,
    private channelService: ChannelService) {

    // Subscribe to login change event (login and logout)
    this.twitchService.loginChange$.subscribe((userInfo: any) => {
      // If login
      if (userInfo && userInfo.name) {
        // Fetch online followed streams
        this.logued = true;
        this.twitchService.getFollowedStreams().then((followedStreams: any) => {
          this.channelService.addFollowedChannels(followedStreams.streams);
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