import { Component, OnInit, Pipe, PipeTransform, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { InfiniteScroll } from "../../directives/infinitescroll.directive";

let _ = require("lodash");

import { TwitchService } from "../../providers/twitch.service";
import { ToolbarService } from "../../providers/toolbar.service";
import { SpinnerService } from "../../providers/spinner.service";
import { ErrorService } from "../../providers/errorhandler.service";
import { GameService } from "../../providers/games.service";
import { ChannelService } from "../../providers/channels.service";

// List of streams component
@Component({
  templateUrl: "./channels.component.html",
  selector: "tw-channels",
  styleUrls: ["./channels.component.scss"],
})

export class ChannelsComponent implements OnInit {

  private game: any = null;
  channels: Array<Object> = [];
  fetchingMore: Boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private twitchService: TwitchService,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private gameService: GameService,
    private channelService: ChannelService,
    private zone: NgZone) { }

  ngOnInit() {

    this.route.params.subscribe(params => {

      this.spinnerService.show();

      if (params["game"] === "top") this.game = "top";
      else if (params["game"] === "following") this.game = "following";
      else {
        this.game = this.gameService.getGame(params["game"]);
      }

      // Set toolbar title
      if (this.game === "top") this.toolbarService.setTitle("Top Streams");
      else if (this.game === "following") this.toolbarService.setTitle("Followed Streams");
      else if (this.game) this.toolbarService.setTitle(this.game.name);

      // Set toolbar icon
      this.toolbarService.setLogo("videocam");

      // Load streams list and hide the spinner
      this.channelService.getStreams(this.game).then((streams: any) => {
        this.channels = streams;
        this.spinnerService.hide();
      }).catch((reason) => {
        this.spinnerService.hide();
        this.errorService.showError("Error fetching streams");
        console.log(reason);
      });

    });
  }

  // Triggered when stream list is scrolled to the bottom (infinite-scroll)
  onScrolled() {

    // Load more items only if we are not already doing that
    if (!this.fetchingMore) {

      this.fetchingMore = true;
      this.zone.run(() => { });

      this.channelService.fetchMoreStreams(this.game).then((streams: any) => {
        this.channels = streams;
        this.fetchingMore = false;
        this.zone.run(() => { });
      }).catch((reason) => {
        console.log("Failed fetching more games");
        console.log(reason);
        this.fetchingMore = false;
        this.zone.run(() => { });
      });
    }
  }
}