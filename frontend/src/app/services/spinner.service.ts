import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(private spinner: NgxSpinnerService) { }

  hideSpinner() {
    this.spinner.hide();
  }

  showSpinner() {
    this.spinner.show();
  }
}
