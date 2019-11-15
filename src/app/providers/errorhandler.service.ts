import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IErrorValue {
  error: string;
  reason: any;
}

// Service that allows components to display the error component from any
// component displayed in router-outlet
@Injectable()
export class ErrorService {
  // Observable used to spread the show and hide error request from
  // any component to the errorhandler component
  private onError: Subject<IErrorValue> = new Subject<IErrorValue>();
  onError$ = this.onError.asObservable();

  showError(err: string, reason?) {
    let errorValue: IErrorValue = {
      error: err,
      reason
    };

    this.onError.next(errorValue);
  }

  hide() {
    this.onError.next(null);
  }
}
