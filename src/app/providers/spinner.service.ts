import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Spinner service
// Allows router-outlet components to show or hide the spinner while they init
@Injectable()
export class SpinnerService {
  isLoading = false;

  // Loading observable to allow spinner component show/hide
  private loadingChange: Subject<boolean> = new Subject<boolean>();
  loadingChange$ = this.loadingChange.asObservable();

  hide(): void {
    this.isLoading = false;
    this.loadingChange.next(false);
  }

  show(): void {
    this.isLoading = true;
    this.loadingChange.next(true);
  }
}
