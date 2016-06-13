import {Component, OnInit, NgZone} from "@angular/core";
import {OnActivate, Router, RouteSegment} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MD_INPUT_DIRECTIVES} from "@angular2-material/input";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";
import {InfiniteScroll} from "../infinite-scroll/infinitescroll.directive.ts";

let _ = require("lodash");

import {TwitchService} from "../twitch/twitch.service";
import {ToolbarService} from "../toolbar/toolbar.service";
import {SpinnerService} from "../spinner/spinner.service";
import {ErrorService} from "../error-handler/errorhandler.service";

// Game list component
@Component({
  template: require("./games.component.html"),
  selector: "tw-games",
  styles: [require("./games.component.scss")],
  directives: [
    MATERIAL_DIRECTIVES,
    MdProgressCircle,
    MdSpinner,
    InfiniteScroll]
})

export class GamesComponent implements OnActivate, OnInit {
  games: Array<Object> = [];
  fetchingMore: Boolean = false;

  constructor (
    private router: Router,
    private twitchService: TwitchService,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private zone: NgZone) {}

  // Show spinner while loading game list data
  routerOnActivate(curr: RouteSegment): void {
    this.spinnerService.show();
  }

  ngOnInit() {
    // Set toolbar tile and logo
    this.toolbarService.setTitle("Games");
    this.toolbarService.setLogo("games");

    // Load the list of top games and hide the spinner
    this.twitchService.getTopGames().then((games: any) => {
      this.games = _.concat(this.games, games.top);
      this.spinnerService.hide();
      console.log(this.games);
    }).catch((reason) => {
      this.spinnerService.hide();
      this.errorService.showError("Failed fetching games");
      console.log("Failed fetching games");
      console.log(reason);
    });
  }

  // Triggered when list is scrolled to bottom (ininite-scroll)
  onScrolled() {

    // Only fetch more if we are not already doing that
    if (!this.fetchingMore) {
      this.fetchingMore = true;
      this.zone.run(() => {});

      this.twitchService.fetchMoreTopGames().then((games: any) => {
        this.games = _.concat(this.games, games.top);
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