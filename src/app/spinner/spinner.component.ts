import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {MATERIAL_DIRECTIVES} from "ng2-material";
import {MdProgressCircle, MdSpinner} from "@angular2-material/progress-circle/progress-circle";

import {SpinnerService} from "./spinner.service";

// Spinner Component
@Component({
  template: require("./spinner.component.html"),
  selector: "tw-spinner",
  styles: [require("./spinner.component.scss")],
  directives: [
    MATERIAL_DIRECTIVES,
    MdProgressCircle,
    MdSpinner]
})

export class SpinnerComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private spinnerService: SpinnerService) {

    // Subscribe to loading change component to show or hide the spinner
    spinnerService.loadingChange$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  ngOnInit() {

  }

}