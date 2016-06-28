import {Component, ElementRef, OnInit, OnDestroy} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";

let request = require("request");
let querystring = require("querystring");

import {ChatComponent} from "./chat/chat.component";

import {ToolbarService} from "../toolbar/toolbar.service";
import {ChannelService} from "../channels/channels.service";

// Player component
@Component({
  template: require("./player.component.html"),
  selector: "tw-player",
  styles: [require("./player.component.scss")],
  directives: [MATERIAL_DIRECTIVES, ChatComponent, MdProgressCircle, MdSpinner]
})

export class PlayerComponent implements OnInit, OnDestroy {

  channel: any;
  channel_name: string;
  chat_url: string;
  player: any;
  isLoading = true;

  constructor (
    private element: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private channelService: ChannelService) {}

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.channel = this.channelService.getChannel(params["channel"]);
      this.channel_name = this.channel.channel.name;
      console.log(this.channel);
    });

    // Set dark mode in chat
    let webview = this.element.nativeElement.lastElementChild.lastElementChild.firstElementChild;
    webview.addEventListener("load-commit", (event) => {
      webview.executeJavaScript(`localStorage.setItem('chatSettings','{"darkMode":true}');`, false);
    });

    this.chat_url = `https://www.twitch.tv/${this.channel_name}/chat`;

    // Set toolbar title and logo
    this.toolbarService.setTitle(this.channel.channel.status);
    this.toolbarService.setLogo("");

    // Set toolbar subheader info
    this.toolbarService.setSubheader({
      player_username: this.channel.channel.display_name,
      player_game: this.channel.channel.game,
      player_viewers: this.channel.viewers,
      player_logo: this.channel.channel.logo
    });

    // Get access_token required to read video data
    let token_url = `http://api.twitch.tv/api/channels/${this.channel_name}/access_token`;
    request.get({url: token_url, json: true}, (error, response, body) => {

      // Setup video source url with the channel access_token
      let base_url = `http://usher.twitch.tv/api/channel/hls/${this.channel_name}.m3u8?`;
      let qs = {
        player: "twitchweb",
        token: body.token,
        sig: body.sig,
        allow_audio_only: true,
        allow_source: true,
        type: "any",
        p: Math.round(Math.random() * 1e7)
      };

      // Start the player with the video source url
      this.player = new (<any>window).Clappr.Player({
        source: base_url + querystring.stringify(qs),
        plugins: {
          "core": [(<any>window).LevelSelector]
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

    });
  }

  ngOnDestroy() {

    // Hide the toolbar subheader on component destroy
    this.toolbarService.setSubheader({
      player_username: null,
      player_game: null,
      player_viewers: null,
      player_logo: null
    });

    // Clear the player
    this.player.stop();
    this.player.destroy();
  }
}