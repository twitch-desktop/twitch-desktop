import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface SubheaderValue {
  player_username: string;
  player_game: string;
  player_logo: string;
}

// Toolbar Service
// Allows components to change Toolbar values
@Injectable()
export class ToolbarService implements SubheaderValue {
  title: string;
  logo: string;
  player_username: string;
  player_game: string;
  player_logo: string;

  // Observables used by toolbar.component

  // Title change observable
  private titleChange: Subject<string> = new Subject<string>();
  titleChange$ = this.titleChange.asObservable();

  // Logo change obsevable
  private logoChange: Subject<string> = new Subject<string>();
  logoChange$ = this.logoChange.asObservable();

  // Close request observable
  private closeRequest: Subject<any> = new Subject<any>();
  closeRequest$ = this.closeRequest.asObservable();

  // Subheader change observable
  private subheaderChange: Subject<SubheaderValue> = new Subject<
    SubheaderValue
  >();
  subheaderChange$ = this.subheaderChange.asObservable();

  setTitle(title: string) {
    this.title = title;
    this.titleChange.next(title);
  }

  setLogo(logo: string) {
    this.logo = logo;
    this.logoChange.next(logo);
  }

  setSubheader(subHeader: SubheaderValue) {
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
