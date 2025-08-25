import { CityFormData } from '@/app/feature/admin/cities/city-form.component';
import { ApiResponse, DataResponse, MessageResponse } from '@/common/common.interface';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { City } from './cities.interface';

export interface CitySearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'rainfall' | 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  zoneId?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  private readonly apiUrl = `${environment.apiUrl}/cities`;

  constructor(private readonly http: HttpClient) { }

  getCities(params: CitySearchParams = {}): Observable<ApiResponse<City>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.zoneId) httpParams = httpParams.set('zoneId', params.zoneId);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<City>>(this.apiUrl, { params: httpParams });
  }

  getCity(id: number): Observable<City> {
    return this.http.get<{ data: City }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createCity(cityData: Omit<CityFormData, 'id'>): Observable<DataResponse<City>> {
    return this.http.post<DataResponse<City>>(this.apiUrl, cityData);
  }

  updateCity(id: number, cityData: Partial<CityFormData>): Observable<DataResponse<City>> {
    return this.http.put<DataResponse<City>>(`${this.apiUrl}/${id}`, cityData);
  }

  deleteCity(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }
}