import {Directive, ElementRef, OnInit, OnDestroy, Output, EventEmitter} from "@angular/core";
import {MATERIAL_DIRECTIVES} from "ng2-material";

// Infinite Scroll directive
// Emits (scrolled) when a div is scrolled to the bottom
@Directive({
  selector: "[infinite-scroll]"
})

export class InfiniteScroll {
  @Output() scrolled = new EventEmitter();

  constructor(private element: ElementRef) {
    // We do this instead of setting the class method to preserve `this`
    element.nativeElement.onscroll = () => this.onScroll();
  }

  onScroll() {
    let nativeElement = this.element.nativeElement;
    if (nativeElement.scrollTop === nativeElement.scrollHeight - nativeElement.offsetHeight) {
      this.scrolled.next("event");
    }
  }
}