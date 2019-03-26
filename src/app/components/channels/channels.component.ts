import {Component, OnInit, Pipe, PipeTransform, NgZone} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

import {InfiniteScroll} from "../../directives/infinitescroll.directive";

let _ = require("lodash");

import {TwitchService} from "../../providers/twitch.service";
import {ToolbarService} from "../../providers/toolbar.service";
import {SpinnerService} from "../../providers/spinner.service";
import {ErrorService} from "../../providers/errorhandler.service";
import {GameService} from "../../providers/games.service";
import {ChannelService} from "../../providers/channels.service";

// List of streams component
@Component({
  template: require("./channels.component.html"),
  selector: "tw-channels",
  styles: [require("./channels.component.scss")],
})

export class ChannelsComponent implements OnInit {

  private game: string = null;
  private game_obj: any;
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
    private zone: NgZone) {}

  ngOnInit() {

    this.route.params.subscribe(params => {

      if (params["game"] === "top")  this.game = null;
      else {
        this.game_obj = this.gameService.getGame(params["game"]);
        this.game = this.game_obj.game.name;
      }

      this.spinnerService.show();
    });

    // Set toolbar title
    if (this.game) this.toolbarService.setTitle(this.game);
    else this.toolbarService.setTitle("All Games");

    // Set toolbar icon
    this.toolbarService.setLogo("videocam");

    // Load streams list and hide the spinner
    this.channelService.getStreams(this.game).then((streams: any) => {
      this.channels = streams;
      this.spinnerService.hide();
      console.log(this.channels);
    }).catch((reason) => {
      this.spinnerService.hide();
      this.errorService.showError("Error fetching streams");
      console.log(reason);
    });
  }

  // Triggered when stream list is scrolled to the bottom (infinite-scroll)
  onScrolled() {

    // Load more items only if we are not already doing that
    if (!this.fetchingMore) {

      this.fetchingMore = true;
      this.zone.run(() => {});

      this.channelService.fetchMoreStreams(this.game).then((streams: any) => {
        this.channels = streams;
        this.fetchingMore = false;
        this.zone.run(() => {});
      }).catch((reason) => {
        console.log("Failed fetching more games");
        console.log(reason);
        this.fetchingMore = false;
        this.zone.run(() => {});
      });
    }
  }
}