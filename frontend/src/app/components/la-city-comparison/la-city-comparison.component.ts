import { Component, ViewChildren } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-la-city-comparison',
  templateUrl: './la-city-comparison.component.html',
  styleUrl: './la-city-comparison.component.scss'
})
export class LaCityComparisonComponent {
  cityStatData:any[] = [];
  chosenCity:string = '';

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: false
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Download', 'Sales', 'Mail Sales'],
    datasets: [
      {
        data: [300, 500, 100],
      },
    ],
  };

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [];

  public losAngelesPieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['White', 'Black', 'Native American', 'Asian', 'Hispanic'],
    datasets: [
      {
        data: [0, 0, 0, 0 , 0],
      },
    ],
  };

  public chosenCityPieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['White', 'Black', 'Native American', 'Asian', 'Hispanic'],
    datasets: [
      {
        data: [0, 0, 0, 0 , 0],
      },
    ],
  };

  constructor(
    private spinnerService: SpinnerService,
    private api: ApiService
  ) { }

  chosenCityStats:any = {};
  chosenState:string = '';
  stateOptions:string[] = [];
  losAngelesCityStats:any = {};

  @ViewChildren(BaseChartDirective) charts: any;

  cityOptions:string[] = [];

  ngOnInit() {
    // get city stats data
    this.spinnerService.showSpinner();
    this.api.get(environment.getCrimeDataUrl).subscribe((res:any) => {
      this.cityStatData = res.cityStats;
      
      this.stateOptions = Array.from(new Set(this.cityStatData.map(city => city.State)));
      
      // choose first state
      this.chosenState = this.cityStatData[0].State;
      this.chosenCity = this.cityStatData[0].City;
      this.selectState();
      this.selectCity();
      this.cities[1] = this.chosenCity;
      this.losAngelesCityStats = this.cityStatData.filter(city => city.City == "Los Angeles city")[0];
      this.losAngelesPieChartData.datasets[0].data = [this.losAngelesCityStats['%White'], this.losAngelesCityStats['%Black'], this.losAngelesCityStats['%NativeAmerican'], this.losAngelesCityStats['%Asian'], this.losAngelesCityStats['%Hispanic']]
      this.percentageHighSchoolAbove25[0] = this.losAngelesCityStats['%highSchoolAbove25'];
      this.percentageBelowPoverty[0] = this.losAngelesCityStats['%belowPoverty'];
      this.medianIncome[0] = this.losAngelesCityStats['%medianIncome'];
      this.updateCharts();
      this.spinnerService.hideSpinner();

    });
  }

  selectState() {
    const citiesInState = this.cityStatData.filter(city => city.State == this.chosenState);
    this.cityOptions = [];
    for (let city of citiesInState) {
      this.cityOptions.push(city.City);
    }
  }

  selectCity() {
    const chosenCityData = this.cityStatData.filter(city => city.City == this.chosenCity)[0];
    this.chosenCityPieChartData.datasets[0].data = [chosenCityData['%White'], chosenCityData['%Black'], chosenCityData['%NativeAmerican'], chosenCityData['%Asian'], chosenCityData['%Hispanic']];
    this.percentageHighSchoolAbove25[1] = chosenCityData['%highSchoolAbove25'];
    this.percentageBelowPoverty[1] = chosenCityData['%belowPoverty'];
    this.medianIncome[1] = chosenCityData['%medianIncome'];
    this.cities[1] = chosenCityData['City'];
    this.updateCharts();
  }


  updateCharts() {
    this.charts.forEach((child:any) => {
      child.chart.update()
    });
  }

  cities: string[] = ['Los Angeles', ''];
  medianIncome: number[] = [0, 0];
  percentageHighSchoolAbove25: number[] = [0, 0];
  percentageBelowPoverty: number[] = [0, 0];

  // Chart configuration
  public barChartOptions: any = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{ id: 'y-axis-0', position: 'left' }, { id: 'y-axis-1', position: 'right' }] },
    backgroundColor: 'rgba(63, 81, 181, 0.4)'
  };
  public barChartLabels: string[] = this.cities;
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: any[] = [
    { data: this.medianIncome, label: 'Median Income In USD', yAxisID: 'y-axis-0' },
    { data: this.percentageHighSchoolAbove25, label: 'Percentage Above High School Educated', yAxisID: 'y-axis-1', type: 'line' },
    { data: this.percentageBelowPoverty, label: 'Percentage Below Poverty', yAxisID: 'y-axis-1', type: 'line' }
  ];
}
