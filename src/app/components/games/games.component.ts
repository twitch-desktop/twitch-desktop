import {Component, OnInit, NgZone} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

let _ = require("lodash");

import {TwitchService} from "../../providers/twitch.service";
import {ToolbarService} from "../../providers/toolbar.service";
import {SpinnerService} from "../../providers/spinner.service";
import {ErrorService} from "../../providers/errorhandler.service";
import {GameService} from "../../providers/games.service";

@Component({
  templateUrl: "./games.component.html",
  selector: "tw-games",
  styleUrls: ["./games.component.scss"]
})

export class GamesComponent implements OnInit {
  games: Array<Object> = [];
  fetchingMore: Boolean = false;

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private twitchService: TwitchService,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private gameService: GameService,
    private zone: NgZone) {}

  ngOnInit() {

    this.spinnerService.show();

    // Set toolbar tile and logo
    this.toolbarService.setTitle("Top Games");
    this.toolbarService.setLogo("games");

    // Load the list of top games and hide the spinner
    this.gameService.getTopGames().then((games: any) => {
      this.games = _.concat(this.games, games);
      this.spinnerService.hide();
    }).catch((reason) => {
      this.spinnerService.hide();
      this.errorService.showError("Failed fetching games",reason);
      console.log(reason);
    });
  }

  // Triggered when list is scrolled to bottom (ininite-scroll)
  onScrolled() {
    console.log('Scrolled!!');
    // Only fetch more if we are not already doing that
    if (!this.fetchingMore) {
      this.fetchingMore = true;
      this.zone.run(() => {});

      this.gameService.fetchMoreTopGames().then((games: any) => {
        this.games = games;
        this.fetchingMore = false;
        this.zone.run(() => {});
      }).catch((reason) => {
        console.log(reason);
        this.fetchingMore = false;
        this.zone.run(() => {});
      });
    }
  }
}