import {
  Directive,
  ElementRef,
  EventEmitter,
  NgZone,
  Output
} from '@angular/core';
import SimpleBar from 'simplebar';

// Infinite Scroll directive
// Emits (scrolled) when a div is scrolled to the bottom
@Directive({
  selector: '[twInfiniteScroll]'
})
export class InfiniteScrollDirective {
  @Output() scrolled = new EventEmitter();
  private scrollbar;

  constructor(private element: ElementRef, private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.scrollbar = new SimpleBar(this.element.nativeElement);
        this.scrollbar.getScrollElement().addEventListener('scroll', () => {
          this.onScroll();
        });
      });
    });
  }

  onScroll(): void {
    const scrollElement = this.scrollbar.getScrollElement();
    if (
      scrollElement.scrollTop ===
      scrollElement.scrollHeight - scrollElement.offsetHeight
    ) {
      this.scrolled.next('event');
    }
  }
}
