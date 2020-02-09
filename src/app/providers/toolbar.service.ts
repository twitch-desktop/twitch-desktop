import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ISubheaderValue {
  player_username: string;
  player_game: string;
  player_logo: string;
}

// Toolbar Service
// Allows components to change Toolbar values
@Injectable()
export class ToolbarService implements ISubheaderValue {
  title: string;
  logo: string;
  player_username: string;
  player_game: string;
  player_logo: string;

  // Observables used by toolbar.component

  // Title change observable
  private titleChange = new Subject<string>();
  titleChange$ = this.titleChange.asObservable();

  // Logo change obsevable
  private logoChange = new Subject<string>();
  logoChange$ = this.logoChange.asObservable();

  // Close request observable
  private closeRequest = new Subject<any>();
  closeRequest$ = this.closeRequest.asObservable();

  // Subheader change observable
  private subheaderChange = new Subject<ISubheaderValue>();
  subheaderChange$ = this.subheaderChange.asObservable();

  setTitle(title: string) {
    this.title = title;
    this.titleChange.next(title);
  }

  setLogo(logo: string) {
    this.logo = logo;
    this.logoChange.next(logo);
  }

  setSubheader(subHeader: ISubheaderValue) {
    if (subHeader === null) {
      this.player_username = null;
      this.player_game = null;
      this.subheaderChange.next(null);
    } else {
      this.player_username = subHeader.player_username;
      this.player_game = subHeader.player_game;
      this.player_logo = subHeader.player_logo;
      this.subheaderChange.next(subHeader);
    }
  }
}
