import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SubHeaderValue {
  playerUsername: string;
  playerGame: string;
  playerLogo: string;
}

// Toolbar Service
// Allows components to change Toolbar values
@Injectable()
export class ToolbarService implements SubHeaderValue {
  title: string;
  logo: string;
  playerUsername: string;
  playerGame: string;
  playerLogo: string;

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
  private subheaderChange = new Subject<SubHeaderValue>();
  subheaderChange$ = this.subheaderChange.asObservable();

  setTitle(title: string): void {
    this.title = title;
    this.titleChange.next(title);
  }

  setLogo(logo: string): void {
    this.logo = logo;
    this.logoChange.next(logo);
  }

  setSubheader(subHeader: SubHeaderValue): void {
    if (subHeader === null) {
      this.playerUsername = null;
      this.playerGame = null;
      this.subheaderChange.next(null);
    } else {
      this.playerUsername = subHeader.playerUsername;
      this.playerGame = subHeader.playerGame;
      this.playerLogo = subHeader.playerLogo;
      this.subheaderChange.next(subHeader);
    }
  }
}
