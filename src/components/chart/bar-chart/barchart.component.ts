import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { lastValueFrom } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'bar-chart-component',
  standalone: true,
  template: `
    <div>
      <canvas [id]="chartId"></canvas>
    </div>
  `,
})
export class BarChartComponent implements OnInit{
  @Input() chartId!: string;
  @Input() api: string;
  @Input() chartTitle: string;
  @Input() indicator: string;

  response: any;
  labels: string[]=[];
  data: number[]=[];

  constructor(private service: HttpService){}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {

    const response = await lastValueFrom(
      this.service.get(this.api),
    );
    this.response = response;
    this.labels = this.response[this.indicator].map(item =>item.name)
    this.data = this.response[this.indicator].map(item => item.facilityCount)
    this.initChart();
  }

  private initChart(): void {
    const ctx = document.getElementById(this.chartId) as HTMLCanvasElement;
    if (ctx) {
      const barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: '',
              data: this.data,
              backgroundColor: 'rgba(54, 162, 235, 0.9)'
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: this.chartTitle,
              font: {
                size: 18
              },
              padding: {
                  bottom: 30
              }
            },
            legend: {
              display: false
          }
          }
        },
      });
    }
  }


  // private initChart(): void {
  //   const ctx = document.getElementById('barChart') as HTMLCanvasElement;
  //   const barChart = new Chart(ctx, {
  //     type: 'bar' as ChartType,
  //     data: {
  //       labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  //       datasets: [
  //         { label: 'Series A', data: [65, 59, 80, 81, 56, 55, 40], backgroundColor: 'rgba(63, 81, 181, 0.7)' }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       scales: {
  //         y: {
  //           beginAtZero: true
  //         }
  //       }
  //     }
  //   } as ChartConfiguration);
  // }
}
