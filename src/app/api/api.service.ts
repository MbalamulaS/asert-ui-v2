import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment/environment';

// The @Injectable decorator marks this class as one that participates in the
// dependency injection system. The 'providedIn: root' specifies that this service
// should be created by the root application injector, making it a singleton service.
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  // Define the base URL for API requests using an environment variable.
  // This allows easy configuration for different environments (development, production, etc.).
  private baseUrl = environment.API_URL;

  // Create an HttpHeaders object to set default headers for HTTP requests.
  // The 'Accept' header indicates that the client expects JSON responses from the server.
  private headers = new HttpHeaders({
    Accept: 'application/json',
  });

  // The constructor injects an instance of HttpClient, which is an Angular service
  // for making HTTP requests. This instance is used in the methods below to perform
  // various types of HTTP operations.
  constructor(private http: HttpClient) {}

  // Method to make an HTTP GET request.
  // The endpoint parameter specifies the API endpoint to call.
  // The optional params parameter allows passing query parameters to the request.
  // The method returns an Observable of the generic type T, which represents the response type.
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.headers,
      params,
    });
  }

  async getAsync<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.headers,
        params,
      })
      .toPromise()
      .catch((er) => {
        console.log(er);
        return null;
      });
  }

  // Method to make an HTTP POST request.
  // The endpoint parameter specifies the API endpoint to call.
  // The body parameter contains the data to be sent in the body of the request.
  // The method returns an Observable of the generic type T, which represents the response type.
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.headers,
    });
  }

  // Method to make an HTTP POST request with URL-encoded form data.
  // The endpoint parameter specifies the API endpoint to call.
  // The body parameter contains the data to be sent in the body of the request.
  // The newHeaders parameter allows specifying additional headers for this request.
  // The method returns an Observable of the generic type T, which represents the response type.
  postUrlEncoded<T>(
    endpoint: string,
    body: any,
    newHeaders: HttpHeaders,
  ): Observable<T> {
    // Start with the default headers and add/overwrite with new headers.
    let headers = this.headers;
    newHeaders.keys().forEach((key) => {
      headers = headers.set(key, newHeaders.get(key) || '');
    });

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  // Method to make an HTTP POST request that reports progress.
  // The endpoint parameter specifies the API endpoint to call.
  // The body parameter contains the data to be sent in the body of the request.
  // The config parameter allows additional configuration options.
  // The method returns an Observable of HttpEvent<T>, allowing the caller to track the progress of the request.
  postFileWithProgress<T>(
    endpoint: string,
    body: any,
    config: any,
  ): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // Method to make an HTTP POST request that reports progress.
  // The endpoint parameter specifies the API endpoint to call.
  // The body parameter contains the data to be sent in the body of the request.
  // This is similar to the previous method but without the additional config parameter.
  postWithProgress<T>(endpoint: string, body: any): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // Method to make an HTTP PUT request.
  // The endpoint parameter specifies the API endpoint to call.
  // The body parameter contains the data to be sent in the body of the request.
  // The method returns an Observable of the generic type T, which represents the response type.
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.headers,
    });
  }

  // Method to make an HTTP DELETE request.
  // The endpoint parameter specifies the API endpoint to call.
  // The method returns an Observable of the generic type T, which represents the response type.
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.headers,
    });
  }

  getBlob(endpoint: string, params?: Record<string, any>): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: this.headers,
      params,
      responseType: 'blob',
    });
  }

  postBlob(endpoint: string, body: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.headers,
      responseType: 'blob',
    });
  }
}
