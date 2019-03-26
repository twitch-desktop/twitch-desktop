import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

// Service that allows components to display the error component from any 
// component displayed in router-outlet
@Injectable()
export class ErrorService {

  // Observable used to spread the show and hide error request from 
  // any component to the errorhandler component
  private onError: Subject<string> = new Subject<string>();
  onError$ = this.onError.asObservable();

  showError(err: string) {
    this.onError.next(err);
  }

  hide() {
    this.onError.next(null);
  }
}