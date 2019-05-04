import { Component, ElementRef, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import Clappr from "clappr";
import LevelSelector from "level-selector";

import { ToolbarService } from "../../providers/toolbar.service";
import { ChannelService } from "../../providers/channels.service";
import { TwitchService } from "../../providers/twitch.service";
import { SettingsService } from "../../providers/settings.service";

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
  player_source_resolution = 0;

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private channelService: ChannelService,
    private twitchService: TwitchService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.channel = this.channelService.getChannel(params["channel"]);
      this.channel_name = this.channel.name;
    });

    let user = await this.twitchService.getUserFromId(this.channel.user_id);
    let game = await this.twitchService.getGameFromId(this.channel.game_id);
    if (!game) console.log(this.channel.game_id);
    this.chat_url = `https://www.twitch.tv/embed/${user.login}/chat?darkpopout`;

    // Set toolbar title and logo
    this.toolbarService.setTitle(this.channel.title);
    this.toolbarService.setLogo("");

    // Set toolbar subheader info
    this.toolbarService.setSubheader({
      player_username: user.display_name,
      player_game: game.name,
      player_logo: user.profile_image_url
    });

    let sourceUrl = await this.twitchService.getVideoUrl(this.channel);

    // Start the player with the video source url
    this.player = new Clappr.Player({
      source: sourceUrl,
      plugins: {
        core: [LevelSelector]
      },
      levelSelectorConfig: {
        title: "Quality",
        labelCallback: function(playbackLevel, customLabel) {
          return (
            playbackLevel.level.height +
            "p" +
            ` (${(playbackLevel.level.bitrate / 1024).toFixed(0)}kbps)`
          );
        }
      },
      parentId: "#player",
      width: "100%",
      height: "100%",
      autoPlay: true,

      playback: {
        hlsjsConfig: {
          maxMaxBufferLength: this.settingsService.getConfig().buffer_length,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 3
        }
      }
    });

    this.player.on(Clappr.Events.PLAYER_PLAY, () => {
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
    if (this.player) {
      this.player.stop();
      this.player.destroy();
    }
  }
}
