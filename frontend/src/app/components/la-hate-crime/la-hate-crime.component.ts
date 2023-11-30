import { Component, ViewChild } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

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
    private api: ApiService
  ) {

  }

  ngOnInit() {

    // get hate crime data
    this.spinnerService.showSpinner();
    this.api.get(environment.getCrimeDataUrl).subscribe((res:any) => {
      this.hateCrimeData = res.hateCrime;
      
      for(let crime of this.hateCrimeData) {
        if (!this.raceChoices.includes(crime['Criminal Race'])) {
          this.raceChoices.push(crime['Criminal Race']);
        }
        if (!this.biasMotivationChoices.includes(crime['Bias Motivation'])) {
          this.biasMotivationChoices.push(crime['Bias Motivation']);
        }
      }
      this.raceChoices.sort();
      this.biasMotivationChoices.sort();

      
      this.setHateCrimeBarChartData();
      this.spinnerService.hideSpinner();

    });
  }

  updateChart() {
    this.hateCrimeChart.chart.update()
  }

  setHateCrimeBarChartData(): void {
    
    console.log('set data');
    // Create an array to store unique "Type of Offence" values
    const uniqueOffences: string[] = [];

    // Create an array to store counts of each "Type of Offence"
    const offenceCounts: number[] = [];
    // Iterate through the crimeData array
    this.hateCrimeData.forEach((crime) => {
      const offenceIndex = uniqueOffences.indexOf(crime["Type of Offence"]);
      const raceCondition = crime['Criminal Race'] == this.raceChosen || this.raceChosen == 'All';
      const locationCondition = crime['Type of Location'] == this.locationType || this.locationType == 'All';
      const biasCondition = crime['Bias Motivation'] == this.biasMotivation || this.biasMotivation == 'All';
      const cityCondition = crime['City'] == "Los Angeles";
      if (raceCondition && cityCondition && locationCondition && biasCondition) {
        if (offenceIndex === -1) {
          // If the offence is not in the uniqueOffences array, add it and set the count to 1
          uniqueOffences.push(crime["Type of Offence"]);
          offenceCounts.push(1);
        } else {
          // If the offence is already in the array, increment its count
          offenceCounts[offenceIndex]++;
        }
      }
      
    });

    this.hateCrimeBarChartData.labels = uniqueOffences;
    this.hateCrimeBarChartData.datasets = [{data: offenceCounts, label: 'Offence Count'}];
    this.updateChart();
  }

  
  
}
