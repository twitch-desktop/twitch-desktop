import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { TwitchService } from "../../providers/twitch.service";
import { ChannelService } from "../../providers/channels.service";

// Sidebar component
@Component({
  templateUrl: "./sidebar.component.html",
  selector: "tw-sidebar",
  styleUrls: ["./sidebar.component.scss"]
})

export class SidebarComponent implements OnInit {

  onlineStreams: Array<any>;
  logued: boolean = false;
  items = [
    { name: 'Games', route: '/games', icon: 'games', visible: true, active: true },
    { name: 'Channels', route: '/channels/top', icon: 'videocam', visible: true, active: false },
    { name: 'Following', route: '/channels/following', icon: 'star', visible: false, active: false },
    { name: 'Settings', route: '/settings', icon: 'settings', visible: false, active: false }
  ];

  active_item = this.items[0];

  constructor(
    public router: Router,
    private twitchService: TwitchService,
    private channelService: ChannelService) {

    // Subscribe to login change event (login and logout)
    this.twitchService.loginChange$.subscribe((userInfo: any) => {
      this.onLoginChange(userInfo);
    });
  }

  onLoginChange(userInfo) {
    // If login
    if (userInfo && userInfo.login) {
      // Fetch online followed streams
      this.logued = true;
      // Show Following button on user login
      this.items[2].visible = true;
    }
    // Logout
    else {
      this.logued = false;
    }
  }

  navigate(item) {
    this.active_item.active = false;
    item.active = true;
    this.active_item = item;
    this.router.navigate([item.route]);
  }

  ngOnInit() {}
}