import {Component, OnInit, Pipe, PipeTransform, NgZone} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MD_INPUT_DIRECTIVES} from "@angular2-material/input";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";
import {InfiniteScroll} from "../infinite-scroll/infinitescroll.directive.ts";

let _ = require("lodash");
let moment = require("moment");

import {TwitchService} from "../twitch/twitch.service";
import {ToolbarService} from "../toolbar/toolbar.service";
import {SpinnerService} from "../spinner/spinner.service";
import {ErrorService} from "../error-handler/errorhandler.service";
import {GameService} from "../games/games.service";
import {ChannelService} from "./channels.service";

// Transforms a time string into a string representing time since that moment
@Pipe({
  name: "twTimeSince"
})

class TimeSincePipe implements PipeTransform {
  transform(startTime: string) {
    return moment(startTime).fromNow(true);
  }
}

// List of streams component
@Component({
  template: require("./channels.component.html"),
  selector: "tw-channels",
  styles: [require("./channels.component.scss")],
  directives: [
    MATERIAL_DIRECTIVES,
    MdProgressCircle,
    MdSpinner,
    InfiniteScroll],
  pipes: [TimeSincePipe]
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
      console.log(params);
      this.game_obj = this.gameService.getGame(params["game"]);

      console.log(this.game_obj);

      if (this.game_obj === "top")  this.game = null;
      else this.game = this.game_obj.game.name;

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