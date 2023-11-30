import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType, ChartOptions } from 'chart.js';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment';

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
    indexAxis: "y"
  };

  lapdMainData:any[] = [];
  lapdMainArea:string = '';
  lapdMainAreaList:string[] = [];

  @ViewChild(BaseChartDirective) lapdMainChart: any;

  constructor(
    private spinnerService: SpinnerService,
    private api: ApiService
  ) { }

  ngOnInit() {
    // get hate crime data
    this.spinnerService.showSpinner();
    this.api.get(environment.getCrimeDataUrl).subscribe((res:any) => {
      this.lapdMainData = res.lapdMain;
      
      for(let crime of this.lapdMainData) {
        if (!this.lapdMainAreaList.includes(crime['Area'])) {
          this.lapdMainAreaList.push(crime['Area']);
        }
      }
      this.numOffensesTotal = this.lapdMainData.length;
      this.lapdMainAreaList.sort();
      this.lapdMainArea = this.lapdMainAreaList[0];

      
      this.setLAPDMainBarChartData();
      this.spinnerService.hideSpinner();

    });
  }

  updateChart() {
    this.lapdMainChart.chart.update()
  }

  setLAPDMainBarChartData():void {
    
    // Create an array to store unique "CrimeCodeDesc" values
    const uniqueOffences: string[] = [];

    // Create an array to store counts of each "CrimeCodeDesc"
    const offenceCounts: number[] = [];
    // Iterate through the crimeData array
    this.lapdMainData.forEach((crime) => {
      const offenceIndex = uniqueOffences.indexOf(crime["CrimeCodeDesc"]);
      const lapdMainAreaCondition = crime['Area'] == this.lapdMainArea;
      if (lapdMainAreaCondition) {
        if (offenceIndex === -1) {
          // If the offence is not in the uniqueOffences array, add it and set the count to 1
          uniqueOffences.push(crime["CrimeCodeDesc"]);
          offenceCounts.push(1);
        } else {
          // If the offence is already in the array, increment its count
          offenceCounts[offenceIndex]++;
        }
      }
      
    });
    this.lapdMainBarChartData.labels = uniqueOffences;
    this.lapdMainBarChartData.datasets = [{data: offenceCounts, label: 'Offence Count'}];
    this.updateChart();
  }


}
