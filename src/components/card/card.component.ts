import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from 'app/api/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="gap-4 p-4 border-gray-300 h-full w-full border rounded-md text-center"
    >
      <h1 class="!text-6xl !font-extrabold !text-gray-400">{{value}}</h1>
      <h1>{{label}}</h1>
    </div>
  `,
  providers: [HttpService],
})
export class CardComponent implements OnInit {
  @Input() api!: string;
  @Input() label: string = '';
  @Input() indicator: string;

  data: any
  value: any

  constructor(private service: HttpService) {}

  ngOnInit() {
    this.fetchData()
  }

  async fetchData() {

    try {
      const response = await lastValueFrom(
        this.service.get(this.api),
      );
      this.data = response;
      this.value = this.data[this.indicator][0].totalCount;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

}
