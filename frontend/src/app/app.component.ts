import { Component, OnInit, ViewChildren } from '@angular/core';
import { ApiService } from './services/api.service';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { SpinnerService } from './services/spinner.service';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../environments/environment.development';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor () {}
  
  ngOnInit(): void {
    
  }


}
