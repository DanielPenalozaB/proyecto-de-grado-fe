import { ApiResponse, DataResponse, MessageResponse } from '@/common/common.interface';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GuidesService } from '../guides/guides.service';
import { Module, ModuleStatus } from './modules.interface';

export interface ModuleSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'order' | 'points' | 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  status?: ModuleStatus;
  guideId?: number;
  minPoints?: number;
  maxPoints?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModulesService {
  private readonly apiUrl = `${environment.apiUrl}modules`;

  constructor(
    private readonly http: HttpClient,
    private readonly guidesService: GuidesService
  ) { }

  getModules(params: ModuleSearchParams = {}): Observable<ApiResponse<Module>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.guideId) httpParams = httpParams.set('guideId', params.guideId.toString());
    if (params.minPoints) httpParams = httpParams.set('minPoints', params.minPoints.toString());
    if (params.maxPoints) httpParams = httpParams.set('maxPoints', params.maxPoints.toString());

    return this.http.get<ApiResponse<Module>>(this.apiUrl, { params: httpParams });
  }

  getModule(id: number): Observable<Module> {
    return this.http.get<{ data: Module }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createModule(moduleData: Omit<Module, 'id'>): Observable<DataResponse<Module>> {
    return this.http.post<DataResponse<Module>>(this.apiUrl, moduleData);
  }

  updateModule(id: number, moduleData: Partial<Module>): Observable<DataResponse<Module>> {
    return this.http.put<DataResponse<Module>>(`${this.apiUrl}/${id}`, moduleData);
  }

  deleteModule(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  getGuides() {
    return this.guidesService.getGuides({ limit: 100 });
  }
}