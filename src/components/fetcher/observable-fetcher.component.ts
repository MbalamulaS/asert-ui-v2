import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ContentChild,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { HttpService } from 'app/api/api.service';

interface ApiResponse<T> {
  data: T;
  errors?: any;
  message?: string;
  page?: number;
  size?: number;
  status?: number;
  total?: number;
}

@Component({
  selector: 'app-fetcher-observable',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="loading; else dataContent">
      <span>{{ loadingLabel }}</span>
    </ng-container>
    <ng-template #dataContent>
      <ng-container
        *ngTemplateOutlet="content; context: { $implicit: data }"
      ></ng-container>
    </ng-template>
  `,
  providers: [HttpService],
})
export class ObservableFetcherComponent
  implements OnInit, AfterContentInit, OnChanges, OnDestroy
{
  @Input() api!: string;
  @Input() defaultParams: { [key: string]: string | number } = {};
  @Input() loadingLabel: string = 'Loading...';
  @ContentChild(TemplateRef) content!: TemplateRef<any>;

  loading = false;
  data: ApiResponse<any> = { data: null };
  private currentParams: { [key: string]: string | number } = {};
  private destroy$ = new Subject<void>();

  /**
   * Constructor for the FetcherComponent
   * @param httpService The HTTP service to use for API requests
   */
  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.currentParams = { ...this.defaultParams };
    this.fetchDataFromApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    // If defaultParams change and it's not the first change
    if (changes['defaultParams'] && !changes['defaultParams'].firstChange) {
      this.currentParams = { ...changes['defaultParams'].currentValue };
      this.fetchDataFromApi();
    }

    // If the API endpoint changes
    if (changes['api'] && !changes['api'].firstChange) {
      this.fetchDataFromApi();
    }
  }

  ngAfterContentInit() {
    if (!this.content) {
      throw new Error('Fetcher component requires content to be projected');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchDataFromApi() {
    if (!this.api) {
      console.error('No API endpoint specified');
      return;
    }

    this.loading = true;
    let httpParams = new HttpParams();

    Object.keys(this.currentParams).forEach((key) => {
      httpParams = httpParams.set(key, this.currentParams[key].toString());
    });

    console.log('API Request:', {
      endpoint: this.api,
      url: this.httpService.get(this.api),
      params: httpParams.toString(),
    });

    this.httpService
      .get<any>(this.api, httpParams)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error fetching data:', error.message, error);
          return of({ data: [] } as ApiResponse<any>);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((response) => {
        this.data = response;
      });
  }

  /**
   * Updates the parameters and triggers a new fetch
   * @param params New parameters to use for the API request
   */
  updateParams(params: { [key: string]: string | number }) {
    // Only update and fetch if the params are different
    const paramsString = JSON.stringify(params);
    const currentParamsString = JSON.stringify(this.currentParams);

    if (paramsString !== currentParamsString) {
      this.currentParams = { ...params };
      this.fetchDataFromApi();
    }
  }

  /**
   * Builds the full URL for an API endpoint
   * @param endpoint The API endpoint
   * @returns The complete URL
   */
  private buildUrl(endpoint: string): string {
    // Handle endpoints that might already contain the full URL
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Ensure endpoint starts with a slash
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    return this.api;
  }
}
