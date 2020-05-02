import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ErrorValue {
  error: string;
  reason: string;
}

// Service that allows components to display the error component from any
// component displayed in router-outlet
@Injectable()
export class ErrorService {
  // Observable used to spread the show and hide error request from
  // any component to the errorhandler component
  private onError: Subject<ErrorValue> = new Subject<ErrorValue>();
  onError$ = this.onError.asObservable();

  showError(err: string, reason?): void {
    const errorValue: ErrorValue = {
      error: err,
      reason
    };

    this.onError.next(errorValue);
  }

  hide(): void {
    this.onError.next(null);
  }
}
