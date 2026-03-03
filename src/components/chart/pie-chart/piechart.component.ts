import { Component, Input } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { Chart, registerables } from 'chart.js';
import { lastValueFrom } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'pie-chart-component',
  standalone: true,
  template: `
    <div>
      <canvas [id]="chartId"></canvas>
    </div>
  `,
})
export class PieChartComponent {
  @Input() chartId!: string;
  @Input() api: string;
  @Input() chartTitle: string;
  @Input() indicator: string;

  response: any;
  labels: string[] = ['Operating', 'Not Operating'];
  operatingCount: number;
  notOperatingCount: number;
  total: number;
  data: number[] = [];

  constructor(private service: HttpService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    const response = await lastValueFrom(this.service.get(this.api));
    this.response = response;
    this.operatingCount = this.response[this.indicator][0].operatingCount;
    this.total = this.response[this.indicator][0].totalCount;
    this.notOperatingCount = this.total - this.operatingCount;
    this.data = [this.operatingCount, this.notOperatingCount];
    this.initChart();
  }

  private initChart(): void {
    const ctx = document.getElementById(this.chartId) as HTMLCanvasElement;
    if (ctx) {
      const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.labels,
          datasets: [
            {
              data: this.data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
              ],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: this.chartTitle,
              font: {
                size: 18,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = this.total;
                  const percentage = total
                    ? ((value / total) * 100).toFixed(2)
                    : '0.00';
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }
  }
}
