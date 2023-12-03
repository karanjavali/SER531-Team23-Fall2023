import { Component, ViewChildren } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { QueryService } from '../../services/query.service';
import { forkJoin } from 'rxjs';

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
    private api: ApiService,
    private queryService: QueryService
  ) { }

  chosenCityStats:any = {};
  chosenState:string = '';
  stateOptions:string[] = [];
  losAngelesCityStats:any = {};

  @ViewChildren(BaseChartDirective) charts: any;

  cityOptions:string[] = [];
  getQueryDataUrl = environment.getDataUrl;

  ngOnInit() {
    const stateListQuery = this.queryService.getStateListQuery();
    const payload_state_list = {
      query: stateListQuery
    }
    this.spinnerService.showSpinner();
    this.api.post(this.getQueryDataUrl, payload_state_list).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      for(let state of res) {
        this.stateOptions.push(state.state);
      } 
      this.chosenState = this.stateOptions[0];
      this.cityOptions = [];
      const cityListQuery = this.queryService.getCityListQuery(this.chosenState);
      const payload_city_list = {
        query: cityListQuery
      }
      
      this.spinnerService.showSpinner();
      this.api.post(this.getQueryDataUrl, payload_city_list).subscribe((res:any) => {
        this.spinnerService.hideSpinner();
        for(let city of res) {
          this.cityOptions.push(city.city);
        }
        this.chosenCity = this.cityOptions[0];
        this.onSelectCity();


        const laStatsQuery = this.queryService.getCityStatsQuery("CA", "LosAngelesCity");
        const payload_la_stats = {
          query: laStatsQuery
        }
        this.spinnerService.showSpinner();
        this.api.post(this.getQueryDataUrl, payload_la_stats).subscribe((res:any) => {
          this.spinnerService.hideSpinner();
          
          //update la chart
          const laData = res[0];
          this.losAngelesPieChartData.datasets[0].data = [laData['percentWhite'], laData['percentBlack'], laData['percentNative'], laData['percentAsian'], laData['percentHispanic']];
          this.percentageHighSchoolAbove25[0] = laData['percentEducation'];
          this.percentageBelowPoverty[0] = laData['percentPoverty'];
          this.medianIncome[0] = laData['medianIncome'];
          this.cities[0] = this.chosenCity
        });
      });

    });




  }

  onSelectState() {
    this.cityOptions = [];
    const cityListQuery = this.queryService.getCityListQuery(this.chosenState);
    const payload = {
      query: cityListQuery
    }
    this.spinnerService.showSpinner();
    this.api.post(this.getQueryDataUrl, payload).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      for(let city of res) {
        this.cityOptions.push(city.city);
      }
    });
  }

  onSelectCity() {
    const cityStatsQuery = this.queryService.getCityStatsQuery(this.chosenState, this.chosenCity);
    const payload = {
      query: cityStatsQuery
    }
    this.spinnerService.showSpinner();
    this.api.post(this.getQueryDataUrl, payload).subscribe((res:any) => {
      this.spinnerService.hideSpinner();
      const cityData = res[0];
      this.chosenCityPieChartData.datasets[0].data = [cityData['percentWhite'], cityData['percentBlack'], cityData['percentNative'], cityData['percentAsian'], cityData['percentHispanic']];
      this.percentageHighSchoolAbove25[1] = cityData['percentEducation'];
      this.percentageBelowPoverty[1] = cityData['percentPoverty'];
      this.medianIncome[1] = cityData['medianIncome'];
      this.cities[1] = this.chosenCity;
      this.updateCharts();
      
    });
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
