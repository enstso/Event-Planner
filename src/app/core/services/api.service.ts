import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Base URL for all API calls (coming from environment.ts)
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // Generic GET request
  // path: API endpoint (e.g., "events", "users/1", ...)
  // T: Expected response type
  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`);
  }

  // Generic POST request
  // B: Body type sent to the server
  // T: Response type returned by the server
  post<T, B>(path: string, body: B): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  // Generic PUT request (used to update resources)
  put<T, B>(path: string, body: B): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }

  // Generic DELETE request
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}
