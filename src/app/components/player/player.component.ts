import { Component, ElementRef, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import Clappr from "clappr";
import LevelSelector from "level-selector";
import { ErrorService } from "../../providers/errorhandler.service";
import { ToolbarService } from "../../providers/toolbar.service";
import { ChannelService, Stream } from "../../providers/channels.service";
import { TwitchService } from "../../providers/twitch.service";
import { SettingsService } from "../../providers/settings.service";

// Player component
@Component({
  templateUrl: "./player.component.html",
  selector: "tw-player",
  styleUrls: ["./player.component.scss"]
})
export class PlayerComponent implements OnInit, OnDestroy {
  stream: Stream;
  chat_url: string;
  player: any;
  isLoading = true;
  player_source_resolution = 0;

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private channelService: ChannelService,
    private twitchService: TwitchService,
    private settingsService: SettingsService,
    private errorService: ErrorService
  ) { }

  async ngOnInit() {

    this.route.params.subscribe(params => {
      this.stream = this.channelService.currentStream;
    });

    this.chat_url = `https://www.twitch.tv/embed/${this.stream.broadcaster.login}/chat?darkpopout`;

    // Set toolbar title and logo
    this.toolbarService.setTitle(this.stream.broadcaster.broadcastSettings.title);
    this.toolbarService.setLogo("");

    // Set toolbar subheader info
    this.toolbarService.setSubheader({
      player_username: this.stream.broadcaster.displayName,
      player_game: this.stream.broadcaster.broadcastSettings.game.name,
      player_logo: "" // FIXME
    });

    let sourceUrl;
    try {
      sourceUrl = await this.twitchService.getVideoUrl(this.stream);
    } catch (e) {
      return this.errorService.showError("Error getting video source", e);
    }

    // Start the player with the video source url
    this.player = new Clappr.Player({
      source: sourceUrl,
      plugins: {
        core: [LevelSelector]
      },
      levelSelectorConfig: {
        title: "Quality",
        labelCallback: function (playbackLevel, customLabel) {
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
