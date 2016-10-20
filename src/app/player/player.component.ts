import {Component, ElementRef, OnInit, OnDestroy} from "@angular/core";
import {DecimalPipe} from "@angular/common";
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
      player_logo: this.channel.channel.logo
    });

    // Get access_token required to read video data
    let token_url = `http://api.twitch.tv/api/channels/${this.channel_name}/access_token`;
    request.get({url: token_url, headers: {"Client-ID": "jzkbprff40iqj646a697cyrvl0zt2m6"}, json: true}, (error, response, body) => {

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

      console.log(base_url + querystring.stringify(qs));
      // Start the player with the video source url

      let CustomMediaControl = (<any>window).Clappr.MediaControl.extend({
        get template() {
          return (<any>window).Clappr.template(require("./clappr.template.html"));
        },
        get stylesheet () {
          return (<any>window).Clappr.Styler.getStyleFor(require("./clappr.template.scss"));
        }
      });

      let customPlugin = (<any>window).Clappr.UICorePlugin.extend({

        get name() { return "twitch_plugin"; },
        get template() { return (<any>window).Clappr.template("<div class='twitch-viewers'><%= twitch_viewers %></div>"); },
        get attributes() {
          return {
            "class": this.name,
          };
        },

        bindEvents: function() {
          this.listenTo(this.core.mediaControl, (<any>window).Clappr.Events.MEDIACONTROL_SHOW, this.show);
          this.listenTo(this.core.mediaControl, (<any>window).Clappr.Events.MEDIACONTROL_HIDE, this.hide);
          this.listenTo(this.core.mediaControl, (<any>window).Clappr.Events.MEDIACONTROL_RENDERED, this.render);
        },

        hide: function() {

        },

        show: function() {

        },

        getViewers() {
          return this.core.options.twitchConfig.viewers;
        },

        render: function() {
          this.$el.html(this.template({"twitch_viewers": this.getViewers()}));
          this.$el.append((<any>window).Clappr.Styler.getStyleFor(`
            .twitch_plugin {
              float: right;
              position: relative;
              min-height: 32px;
              background: transparent;
              margin-top: 5px !important;
            }
            .twitch-viewers {
              background: transparent;
              height: 100%;
              color: white;
              font-size: 14px !important;
            }
            .twitch-viewers::before {
              content: "";
              display: inline-block;
              position: relative;
              width: 10px;
              height: 10px;
              border-radius: 5px;
              margin-right: 5px;
              background-color: red;
            }
            `));

          this.core.mediaControl.$(".media-control-left-panel").append(this.el);
          return this;
        }
      });

      this.player = new (<any>window).Clappr.Player({
        source: base_url + querystring.stringify(qs),
        plugins: {
          core: [
            (<any>window).LevelSelector,
            customPlugin,
/*          (<any>window).ChromecastPlugin*/
          ]
        },
        parentId: "#player",
        width: "100%",
        height: "100%",
        autoPlay: true,
        maxBufferLength: 20,
        mediacontrol: { external: CustomMediaControl },
        levelSelectorConfig: {
          title: "Quality",
          labels: {
            4: "Source",
            3: "High",
            2: "Medium",
            1: "Low",
            0: "Mobile",
          }
        },
        twitchConfig: {
          viewers: new DecimalPipe().transform(this.channel.viewers)
        }

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