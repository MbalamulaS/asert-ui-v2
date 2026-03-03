import {Injectable} from '@angular/core';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {BehaviorSubject, Observable} from 'rxjs';
import { Reservation } from './reservation';

@Injectable({
  providedIn: 'root',
})
export class IncidentReportService {
  private readonly API = 'incident-reports';
  private dataSubject = new BehaviorSubject<any>(null)
  reportData$ = this.dataSubject.asObservable()

  setReportData(data:any){
    this.dataSubject.next(data)
  }

  constructor(private readonly httpService: HttpService) {}


  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(data: Reservation): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, data);
  }

  update(uuid: string, item: Reservation): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  getIncidentReport(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/visitor/${uuid}`);
  }
}
