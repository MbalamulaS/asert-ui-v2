import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment/environment';
import { UploadTypes, UploadedFile } from './types';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  baseUrl = environment.API_URL;
  API = 'uploads';

  constructor(
    private http: HttpClient,
    private httpService: HttpService,
  ) {}

  upload(file: File, uploadType: UploadTypes): Observable<any> {
    const formData = new FormData();

    formData.append('file', file, file.name);
    formData.append('uploadType', uploadType);

    return this.http.post(`${this.baseUrl}/${this.API}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  updateFileName(uuid: string, payload: UploadedFile): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${this.API}/${uuid}/update-name`,
      payload,
    );
  }
}
