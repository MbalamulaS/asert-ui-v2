import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ContentChild,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { HttpService } from 'app/api/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-fetcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="loading; else dataContent">
      <span>{{ loadingLabel }}...</span>
    </ng-container>
    <ng-template #dataContent>
      <ng-container
        *ngTemplateOutlet="content; context: { $implicit: data }"
      ></ng-container>
    </ng-template>
  `,
  providers: [HttpService],
})
export class FetcherComponent implements OnInit, AfterContentInit {
  @Input() api!: string;
  @Input() defaultParams: { [key: string]: string | number } = {};
  @Input() loadingLabel: string = '';

  @ContentChild(TemplateRef) content!: TemplateRef<any>;

  data: any = null;
  loading: boolean = false;

  constructor(private fetcherService: HttpService) {}

  ngOnInit() {
    this.fetchData(this.defaultParams);
  }

  ngAfterContentInit() {
    if (!this.content) {
      throw new Error('Fetcher component requires content to be projected');
    }
  }

  async fetchData(params: { [key: string]: string | number }) {
    this.loading = true;

    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, params[key]);
    });

    try {
      const response = await lastValueFrom(
        this.fetcherService.get(this.api, httpParams),
      );
      this.data = response;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.loading = false;
    }
  }

  refetch(params: { [key: string]: string | number }) {
    this.fetchData(params);
  }
}
