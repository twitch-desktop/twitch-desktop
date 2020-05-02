import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService, Stream } from '../../providers/channels.service';
import { ErrorService } from '../../providers/errorhandler.service';
import { GameService, Game } from '../../providers/games.service';
import { SpinnerService } from '../../providers/spinner.service';
import { ToolbarService } from '../../providers/toolbar.service';

@Component({
  templateUrl: './channels.component.html',
  selector: 'tw-channels',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit {
  private game: Game = null;
  streams: Stream[] = [];
  fetchingMore = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private gameService: GameService,
    private channelService: ChannelService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.spinnerService.show();

      if (params['game'] !== 'top' && params['game'] !== 'following') {
        this.game = this.gameService.getGame(params['game']);
      }

      if (params['game'] === 'top') {
        this.toolbarService.setTitle('Top Streams');
        this.fetchingMore = true;
        this.channelService.getTopStreams().then((streams: Stream[]) => {
          this.streams = streams;
          this.fetchingMore = false;
          this.spinnerService.hide();
        });
      } else if (params['game'] === 'following') {
        this.toolbarService.setTitle('Followed Streams');
        this.fetchingMore = true;
        this.channelService.getFollowedStreams().then((streams: Stream[]) => {
          this.streams = streams;
          this.fetchingMore = false;
          this.spinnerService.hide();
        });
      } else if (this.game) {
        this.toolbarService.setTitle(this.game.name);
        this.fetchingMore = true;
        this.channelService
          .getGameStreams(this.game)
          .then((streams: Stream[]) => {
            this.streams = streams;
            this.fetchingMore = false;
            this.spinnerService.hide();
          });
      }

      // Set toolbar icon
      this.toolbarService.setLogo('videocam');
    });
  }

  itemClicked(stream: Stream): void {
    this.channelService.currentStream = stream;
    this.router.navigate(['/play/' + stream.id]);
  }

  // Triggered when stream list is scrolled to the bottom (infinite-scroll)
  onScrolled(): void {
    // Load more items only if we are not already doing that
    if (!this.fetchingMore) {
      this.fetchingMore = true;
      this.channelService
        .fetchMoreStreams()
        .then((streams: Stream[]) => {
          this.streams = streams;
          this.fetchingMore = false;
        })
        .catch((reason) => {
          console.log(reason);
          this.fetchingMore = false;
        });
    }
  }
}
