import {Component, OnInit, Pipe, PipeTransform, NgZone} from "@angular/core";
import {OnActivate, Router, RouteSegment} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MD_INPUT_DIRECTIVES} from "@angular2-material/input";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";
import {InfiniteScroll} from "../infinite-scroll/infinitescroll.directive.ts";

let request = require("request");
let _ = require("lodash");
let moment = require("moment");

import {TwitchService} from "../twitch/twitch.service";
import {ToolbarService} from "../toolbar/toolbar.service";
import {SpinnerService} from "../spinner/spinner.service";
import {ErrorService} from "../error-handler/errorhandler.service";

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

export class ChannelsComponent implements OnActivate, OnInit {

  private game: string = null;
  private game_obj: any;
  channels: Array<Object> = [];
  fetchingMore: Boolean = false;

  constructor(
    private router: Router,
    private twitchService: TwitchService,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private zone: NgZone) {}

  routerOnActivate(curr: RouteSegment): void {

    this.game_obj = curr.getParam("game");

    // Setting game as null twitchService returns streams from all games
    if (this.game_obj === "top")  this.game = null;
    else this.game = this.game_obj.game.name;

    this.spinnerService.show();
  }

  ngOnInit() {

    // Set toolbar title
    if (this.game) this.toolbarService.setTitle(this.game);
    else this.toolbarService.setTitle("All Games");

    // Set toolbar icon
    this.toolbarService.setLogo("videocam");

    // Load streams list and hide the spinner
    this.twitchService.getStreams(this.game).then((streams: any) => {
      this.channels = _.concat(this.channels, streams.streams);
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

      this.twitchService.fetchMoreStreams(this.game).then((streams: any) => {
        this.channels = _.concat(this.channels, streams.streams);
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