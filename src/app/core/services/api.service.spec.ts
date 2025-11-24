import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unexpected HTTP calls are left open
    httpMock.verify();
  });

  it('should perform GET request', () => {
    const mockResponse = { id: 1, name: 'Test' };

    service.get<typeof mockResponse>('test/1').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should perform POST request', () => {
    const body = { name: 'New item' };
    const mockResponse = { id: 1, name: 'New item' };

    service.post<typeof mockResponse, typeof body>('test', body).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush(mockResponse);
  });

  it('should perform PUT request', () => {
    const body = { name: 'Updated item' };
    const mockResponse = { id: 1, name: 'Updated item' };

    service.put<typeof mockResponse, typeof body>('test/1', body).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);

    req.flush(mockResponse);
  });

  it('should perform DELETE request', () => {
    const mockResponse = { success: true };

    service.delete<typeof mockResponse>('test/1').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });
});
