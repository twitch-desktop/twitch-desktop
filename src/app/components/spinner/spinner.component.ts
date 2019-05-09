import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { SpinnerService } from "../../providers/spinner.service";

// Spinner Component
@Component({
  templateUrl: "./spinner.component.html",
  selector: "tw-spinner",
  styleUrls: ["./spinner.component.scss"]
})
export class SpinnerComponent implements OnInit {
  isLoading: boolean = false;

  constructor(private router: Router, private spinnerService: SpinnerService) {
    // Subscribe to loading change component to show or hide the spinner
    spinnerService.loadingChange$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  ngOnInit() {}
}
