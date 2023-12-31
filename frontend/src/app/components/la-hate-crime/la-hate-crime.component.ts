import { Component, ViewChild } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { QueryService } from '../../services/query.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-la-hate-crime',
  templateUrl: './la-hate-crime.component.html',
  styleUrl: './la-hate-crime.component.scss'
})
export class LaHateCrimeComponent {
  hateCrimeData:any[] = [];
  raceChosen = 'All';
  locationType = 'All';
  biasMotivation = 'All';

  raceChoices:string[] = [];
  locationChoices:string[] = ['Public','Private'];
  biasMotivationChoices:string[] = [];

  @ViewChild(BaseChartDirective) hateCrimeChart: any;

  // hate crime bar chart component settings
  public hateCrimeBarChartLegend = true;
  public hateCrimeBarChartPlugins = [];

  public hateCrimeBarChartData = {
    labels: [ '' ],
    datasets: [
      { data: [ 0 ], label: '' }
    ]
  };

  public hateCrimeBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    backgroundColor: 'rgba(63, 81, 181, 0.8)'
  };

  constructor(
    private spinnerService: SpinnerService,
    private api: ApiService,
    private queryService: QueryService
  ) {

  }

  // load the filter options -> bias motivation and race list
  // load the initial hate crime data (no filters)
  ngOnInit() {
    
    this.raceChoices = [];
    this.biasMotivationChoices = [];

    // get race and bias motivation lists
    const getCriminalRaceQuery = this.queryService.getHateCrimeCriminalRaceList();
    const getBiasMotivationListQuery = this.queryService.getHateCrimeBiasMotivationList();

    const payload_race_list = {
      query: getCriminalRaceQuery
    }

    const payload_bias_motivation_list = {
      query: getBiasMotivationListQuery
    }

    
    this.spinnerService.showSpinner();
    forkJoin([this.api.post(environment.getDataUrl, payload_race_list), this.api.post(environment.getDataUrl, payload_bias_motivation_list)]).subscribe((res:any[]) => {
      this.spinnerService.hideSpinner();
      for (let race of res[0]) {
        this.raceChoices.push(race.criminalRace);
      }

      for (let biasMotivation of res[1]) {
        this.biasMotivationChoices.push(biasMotivation.biasMotivation);
      }

      this.setHateCrimeBarChartData();
    })
  }

  updateChart() {
    this.hateCrimeChart.chart.update()
  }

  // set hate crime data whenever filters are updated
  setHateCrimeBarChartData(): void {

    const uniqueOffences: string[] = [];
    const offenceCounts: number[] = [];

    const getHateCrimeDataQuery = this.queryService.getHateCrimeDataQuery(this.raceChosen, this.locationType, this.biasMotivation);
    const payload_hate_crime = {
      query: getHateCrimeDataQuery
    }

    this.spinnerService.showSpinner();
    this.api.post(environment.getDataUrl, payload_hate_crime).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      for (let crime of res) {
        uniqueOffences.push(crime.offenceType);
        offenceCounts.push(crime.offenceCount);
      }
      
      this.hateCrimeBarChartData.labels = uniqueOffences;
      this.hateCrimeBarChartData.datasets = [{data: offenceCounts, label: 'Offence Count'}];
      this.updateChart();
    })

    
  }

  
  
}
