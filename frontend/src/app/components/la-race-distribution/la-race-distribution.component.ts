import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { SpinnerService } from '../../services/spinner.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-la-race-distribution',
  templateUrl: './la-race-distribution.component.html',
  styleUrl: './la-race-distribution.component.scss'
})
export class LaRaceDistributionComponent {

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    },
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
  public pieChartPlugins = [DatalabelsPlugin];

  constructor(
    private spinnerService: SpinnerService,
    private api: ApiService
  ) { }



}
