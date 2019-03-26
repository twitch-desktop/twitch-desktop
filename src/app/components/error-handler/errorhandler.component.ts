import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router, NavigationStart} from "@angular/router";

import {ErrorService} from "../../providers/errorhandler.service";

// Error display component
@Component({
  template: require("./errorhandler.component.html"),
  selector: "tw-error",
  styles: [require("./errorhandler.component.scss")]
})

export class ErrorComponent implements OnInit {

  displayError: boolean = false;
  error: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService) {

    // Subscribe to the onError event of the service to show or hide
    // the component bassed on its value
    errorService.onError$.subscribe((err) => {
      if (err) {
        this.error = err;
        this.displayError = true;
      }
      else {
        // `null` is used as the hide value
        this.displayError = false;
        this.error = "";
      }
    });

    // Hide error message on any route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.displayError = false;
        this.error = "";
      }
    });
  }

  ngOnInit() {

  }

  retry () {
    this.displayError = false;
    this.error = "";

    // TODO
    // Maybe reloading the current component?
  }
}