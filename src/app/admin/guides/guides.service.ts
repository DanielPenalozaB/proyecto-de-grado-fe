import { ApiResponse, DataResponse, Languages, MessageResponse } from '@/common/common.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Guide, GuideDifficulty, GuideStatus } from './guides.interface';

export interface GuideSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'difficulty' | 'estimatedDuration' | 'points' | 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  difficulty?: GuideDifficulty;
  status?: GuideStatus;
  language?: Languages;
  minDuration?: number;
  maxDuration?: number;
  minPoints?: number;
  maxPoints?: number;
}

export interface CreateGuideDto {
  name: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  status?: string;
  language: string;
  totalPoints: number;
}

export interface UpdateGuideDto {
  name: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  status?: string;
  language: string;
  totalPoints: number;
}

@Injectable({
  providedIn: 'root'
})
export class GuidesService {
  private readonly apiUrl = 'http://localhost:4000/guides';

  constructor(private readonly http: HttpClient) { }

  getGuides(params: GuideSearchParams = {}): Observable<ApiResponse<Guide>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.difficulty) httpParams = httpParams.set('difficulty', params.difficulty);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.minDuration) httpParams = httpParams.set('minDuration', params.minDuration.toString());
    if (params.maxDuration) httpParams = httpParams.set('maxDuration', params.maxDuration.toString());
    if (params.minPoints) httpParams = httpParams.set('minPoints', params.minPoints.toString());
    if (params.maxPoints) httpParams = httpParams.set('maxPoints', params.maxPoints.toString());

    return this.http.get<ApiResponse<Guide>>(this.apiUrl, { params: httpParams });
  }

  getGuideById(id: number): Observable<DataResponse<Guide>> {
    return this.http.get<DataResponse<Guide>>(`${this.apiUrl}/${id}`);
  }

  createGuide(guideData: CreateGuideDto): Observable<DataResponse<Guide>> {
    return this.http.post<DataResponse<Guide>>(this.apiUrl, guideData);
  }

  updateGuide(id: number, guideData: UpdateGuideDto): Observable<DataResponse<Guide>> {
    return this.http.put<DataResponse<Guide>>(`${this.apiUrl}/${id}`, guideData);
  }

  deleteGuide(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }
}