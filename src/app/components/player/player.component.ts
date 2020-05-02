import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import Clappr from 'clappr';
import LevelSelector from 'level-selector';
import { ChannelService, Stream } from '../../providers/channels.service';
import { ErrorService } from '../../providers/errorhandler.service';
import { SettingsService } from '../../providers/settings.service';
import { ToolbarService } from '../../providers/toolbar.service';
import { TwitchService } from '../../providers/twitch.service';

// Player component
@Component({
  templateUrl: './player.component.html',
  selector: 'tw-player',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  stream: Stream;
  chatUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(() => {
      this.stream = this.channelService.currentStream;
    });

    if (this.stream.broadcaster && this.stream.broadcaster.login) {
      this.chatUrl = `https://www.twitch.tv/embed/${this.stream.broadcaster.login}/chat?darkpopout`;
    }

    // Set toolbar title and logo
    this.toolbarService.setTitle(
      this.stream.broadcaster && this.stream.broadcaster.broadcastSettings.title
    );
    this.toolbarService.setLogo('');

    // Set toolbar subheader info
    this.toolbarService.setSubheader({
      playerUsername:
        this.stream.broadcaster && this.stream.broadcaster.displayName,
      playerGame:
        this.stream.broadcaster &&
        this.stream.broadcaster.broadcastSettings &&
        this.stream.broadcaster.broadcastSettings.game.name,
      playerLogo: '' // FIXME
    });

    let sourceUrl;
    try {
      sourceUrl = await this.twitchService.getVideoUrl(this.stream);
    } catch (e) {
      return this.errorService.showError('Error getting video source', e);
    }

    // Start the player with the video source url
    this.player = new Clappr.Player({
      source: sourceUrl,
      plugins: {
        core: [LevelSelector]
      },
      levelSelectorConfig: {
        title: 'Quality',
        labelCallback: (playbackLevel): string => {
          return (
            playbackLevel.level.height +
            'p' +
            ` (${(playbackLevel.level.bitrate / 1024).toFixed(0)}kbps)`
          );
        }
      },
      parentId: '#player',
      width: '100%',
      height: '100%',
      autoPlay: true,

      playback: {
        hlsjsConfig: {
          maxMaxBufferLength: this.settingsService.getConfig().bufferLength,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 3
        }
      }
    });

    this.player.listenToOnce(
      this.player.core.activePlayback,
      Clappr.Events.PLAYBACK_LEVELS_AVAILABLE,
      (levels) => {
        if (this.settingsService.getConfig().preferredQuality !== 'auto') {
          let targetQualityId = -1;

          if (this.settingsService.getConfig().preferredQuality === 'source') {
            targetQualityId = levels[levels.length - 1].id;
          } else {
            levels.forEach((level) => {
              if (
                level.label.includes(
                  this.settingsService.getConfig().preferredQuality
                )
              ) {
                targetQualityId = level.id;
              }
            });
          }

          this.player.getPlugin('hls').currentLevel = targetQualityId;
          this.player.getPlugin(
            'level_selector'
          ).selectedLevelId = targetQualityId;
        }
      }
    );

    this.player.on(Clappr.Events.PLAYER_PLAY, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    // Hide the toolbar subheader on component destroy
    this.toolbarService.setSubheader({
      playerUsername: null,
      playerGame: null,
      playerLogo: null
    });

    // Clear the player
    if (this.player) {
      this.player.stop();
      this.player.destroy();
    }
  }
}
