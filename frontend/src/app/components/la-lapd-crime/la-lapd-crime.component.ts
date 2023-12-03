import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType, ChartOptions } from 'chart.js';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment';
import { QueryService } from '../../services/query.service';

@Component({
  selector: 'app-la-lapd-crime',
  templateUrl: './la-lapd-crime.component.html',
  styleUrl: './la-lapd-crime.component.scss'
})
export class LaLapdCrimeComponent {
  public lapdMainBarChartLegend = true;
  public lapdMainBarChartPlugins = [];

  // random starting data
  public lapdMainBarChartData = {
    labels: [ '' ],
    datasets: [
      { data: [ 0 ], label: '' }
    ]
  };

  numOffensesTotal:number = 0;
  public lapdMainBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    indexAxis: "y",
    backgroundColor: 'rgba(63, 81, 181, 0.8)'
  };

  lapdMainData:any[] = [];
  lapdMainArea:string = '';
  lapdMainAreaList:string[] = [];

  @ViewChild(BaseChartDirective) lapdMainChart: any;

  constructor(
    private spinnerService: SpinnerService,
    private api: ApiService,
    private queryService: QueryService
  ) { }

  ngOnInit() {
    // get lapd main data
    const getAreaListQuery = this.queryService.getLAPDMainAreaList();
    
    const payload_get_area_list = {
      query: getAreaListQuery
    }

    this.spinnerService.showSpinner();
    this.api.post(environment.getDataUrl, payload_get_area_list).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      this.lapdMainAreaList = [];
      
      for (let area of res) {
        this.lapdMainAreaList.push(area.area);
      }

      this.lapdMainArea = this.lapdMainAreaList[0];
      this.setLAPDMainBarChartData();

    });
  }

  updateChart() {
    this.lapdMainChart.chart.update();
  }

  setLAPDMainBarChartData():void {
    
    const uniqueOffences: string[] = [];
    const offenceCounts: number[] = [];

    const getAreaDataQuery = this.queryService.getLAPDMainData(this.lapdMainArea);
    const payload_get_area_data = {
      query: getAreaDataQuery
    }

    this.spinnerService.showSpinner();
    this.api.post(environment.getDataUrl, payload_get_area_data).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      for (let data of res) {
        uniqueOffences.push(data.crimeDescription);
        offenceCounts.push(data.crimeCount);
      }
      this.lapdMainBarChartData.labels = uniqueOffences;
      this.lapdMainBarChartData.datasets = [{data: offenceCounts, label: 'Offence Count'}];
      this.updateChart();
    })
  }


}
