import { Component, ElementRef, OnInit, OnDestroy } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";

import { ToolbarService } from "../../providers/toolbar.service";
import { ChannelService } from "../../providers/channels.service";
import { TwitchService } from "../../providers/twitch.service";

// Player component
@Component({
  template: require("./player.component.html"),
  selector: "tw-player",
  styles: [require("./player.component.scss")]
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
      console.log(this.channel);
    });

    // Set dark mode in chat
    let webview = this.element.nativeElement.lastElementChild.lastElementChild.firstElementChild;
    webview.addEventListener("did-start-loading", (event) => {
      webview.executeJavaScript(`localStorage.setItem('chatSettings','{"darkMode":true}');`, false);
    });

    this.chat_url = `https://www.twitch.tv/${this.channel_name}/chat`;

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

    // Start the player with the video source url
    this.player = new (<any>window).Clappr.Player({
      source: sourceUrl,
      plugins: {
        core: [
          (<any>window).LevelSelector,
          //            customPlugin,
        ]
      },
      parentId: "#player",
      width: "100%",
      height: "100%",
      autoPlay: true,
      maxBufferLength: 20

      /*chromecast: {
        appId: '9DFB77C0',
        media: {
          type: "application/x-mpegURL",
          title: 'ASDF',
        }
      }*/
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