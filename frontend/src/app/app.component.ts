import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ApiService } from './services/api.service';
import { ChartConfiguration } from 'chart.js';
import { SpinnerService } from './services/spinner.service';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor (
    private api: ApiService,
    private spinnerService: SpinnerService
  ) 
  {}
  
  hateCrimeData:any[] = [];
  crimeStatData:any[] = [];
  lapdMainData:any[] = [];

  raceChosen = 'All';
  // cityChosen = 'All';
  locationType = 'All';
  biasMotivation = 'All';

  raceChoices:string[] = [];
  // cityChoices:string[] = [];
  locationChoices:string[] = ['Public','Private'];
  biasMotivationChoices:string[] = [];
  // showGraph = false;

  lapdMainArea:string = '';
  lapdMainAreaList:string[] = [];
  

  ngOnInit(): void {
    this.spinnerService.showSpinner();
      this.api.get(environment.getCrimeDataUrl).subscribe((res:any) => {
        this.hateCrimeData = res.hateCrime;
        this.crimeStatData = res.cityStats;
        this.lapdMainData = res.lapdMain;
        
        for(let crime of this.hateCrimeData) {
          if (!this.raceChoices.includes(crime['Criminal Race'])) {
            this.raceChoices.push(crime['Criminal Race']);
          }
          if (!this.biasMotivationChoices.includes(crime['Bias Motivation'])) {
            this.biasMotivationChoices.push(crime['Bias Motivation']);
          }
        }

        for(let crime of this.lapdMainData) {
          if (!this.lapdMainAreaList.includes(crime['Area'])) {
            this.lapdMainAreaList.push(crime['Area']);
          }
        }
        this.lapdMainAreaList.sort();
        this.lapdMainArea = this.lapdMainAreaList[0];
        this.raceChoices.sort();
        this.biasMotivationChoices.sort();

        
        this.setHateCrimeBarChartData();
        this.setLAPDMainBarChartData();
        this.spinnerService.hideSpinner();

      });
  }

  @ViewChildren(BaseChartDirective) charts: any;

  updateCharts() {
    this.charts.forEach((child:any) => {
      child.chart.update()
  });
  }

  setHateCrimeBarChartData():void {
    
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
    this.updateCharts();
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
    this.updateCharts();
  }

  public hateCrimeBarChartLegend = true;
  public hateCrimeBarChartPlugins = [];

  // random starting data
  public hateCrimeBarChartData = {
    labels: [ '2006', '2007', '2008', '2009', '2010', '2011', '2012' ],
    datasets: [
      { data: [ 65, 59, 80, 81, 56, 55, 40 ], label: 'Series A' }
    ]
  };

  public hateCrimeBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };


  public lapdMainBarChartLegend = true;
  public lapdMainBarChartPlugins = [];

  // random starting data
  public lapdMainBarChartData = {
    labels: [ '2006', '2007', '2008', '2009', '2010', '2011', '2012' ],
    datasets: [
      { data: [ 65, 59, 80, 81, 56, 55, 40 ], label: 'Series A' }
    ]
  };

  public lapdMainBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

}
