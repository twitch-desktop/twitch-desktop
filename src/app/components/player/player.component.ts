import { Component, ElementRef, OnInit, OnDestroy } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";

import { ToolbarService } from "../../providers/toolbar.service";
import { ChannelService } from "../../providers/channels.service";
import { TwitchService } from "../../providers/twitch.service";

// Player component
@Component({
  templateUrl: "./player.component.html",
  selector: "tw-player",
  styleUrls: ["./player.component.scss"]
})

export class PlayerComponent implements OnInit, OnDestroy {

  channel: any;
  channel_name: string;
  chat_url: string;
  player: any;
  isLoading = true;

  constructor(
    private element: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private channelService: ChannelService,
    private twitchService: TwitchService) { }

  async ngOnInit() {

    this.route.params.subscribe(params => {
      this.channel = this.channelService.getChannel(params["channel"]);
      this.channel_name = this.channel.name;
    });

    let username = await this.twitchService.getUserLoginFromId(this.channel.user_id);
    this.chat_url = `https://www.twitch.tv/${username}/chat`;

    // Set toolbar title and logo
    this.toolbarService.setTitle(this.channel.title);
    this.toolbarService.setLogo("");

    // Set toolbar subheader info
    this.toolbarService.setSubheader({
      player_username: this.channel.user_name,
      player_game: this.channel.game_id,
      player_logo: this.channel.thumbnail_url
    });

    let sourceUrl = await this.twitchService.getVideoUrl(this.channel);
    console.log(sourceUrl);

    // Start the player with the video source url
    this.player = new (<any>window).Clappr.Player({
      source: sourceUrl,
      plugins: {
        core: [
          (<any>window).LevelSelector,
        ]
      },
      parentId: "#player",
      width: "100%",
      height: "100%",
      autoPlay: true,
      maxBufferLength: 20
    });

    this.player.on((<any>window).Clappr.Events.PLAYER_PLAY, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {

    // Hide the toolbar subheader on component destroy
    this.toolbarService.setSubheader({
      player_username: null,
      player_game: null,
      player_logo: null
    });

    // Clear the player
    this.player.stop();
    this.player.destroy();
  }
}