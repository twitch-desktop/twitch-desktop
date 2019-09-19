import { Component, OnInit } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";

import { ErrorService, ErrorValue } from "../../providers/errorhandler.service";

// Error display component
@Component({
  templateUrl: "./errorhandler.component.html",
  selector: "tw-error",
  styleUrls: ["./errorhandler.component.scss"]
})
export class ErrorComponent implements OnInit {
  displayError = false;
  error: string;
  reason = null;

  constructor(
    private router: Router,
    private errorService: ErrorService
  ) {
    // Subscribe to the onError event of the service to show or hide
    // the component bassed on its value
    this.errorService.onError$.subscribe((error_value: ErrorValue) => {
      if (error_value.error) {
        this.error = error_value.error;
        this.reason = error_value.reason;
        this.displayError = true;
      } else {
        // `null` is used as the hide value
        this.displayError = false;
        this.error = "";
        this.reason = null;
      }
    });

    // Hide error message on any route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.displayError = false;
        this.error = "";
        this.reason = null;
      }
    });
  }

  ngOnInit() { }

  retry() {
    this.displayError = false;
    this.error = "";

    // TODO
    // Maybe reloading the current component?
  }
}
