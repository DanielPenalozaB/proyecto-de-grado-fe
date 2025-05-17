import { ApiResponse, DataResponse, MessageResponse } from '@/common/common.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModulesService } from '../modules/modules.service';
import { BlockType, DynamicType, Question, QuestionType } from './questions.interface';

export interface QuestionSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
  blockType?: BlockType;
  dynamicType?: DynamicType;
  questionType?: QuestionType;
  moduleId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private apiUrl = 'http://localhost:4000/questions';

  constructor(
    private http: HttpClient,
    private modulesService: ModulesService
  ) { }

  getQuestions(params: QuestionSearchParams = {}): Observable<ApiResponse<Question>> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.blockType) httpParams = httpParams.set('blockType', params.blockType);
    if (params.dynamicType) httpParams = httpParams.set('dynamicType', params.dynamicType);
    if (params.questionType) httpParams = httpParams.set('questionType', params.questionType);
    if (params.moduleId) httpParams = httpParams.set('moduleId', params.moduleId.toString());

    return this.http.get<ApiResponse<Question>>(this.apiUrl, { params: httpParams });
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<{ data: Question }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createQuestion(questionData: Omit<Question, 'id'>): Observable<DataResponse<Question>> {
    return this.http.post<DataResponse<Question>>(this.apiUrl, questionData);
  }

  updateQuestion(id: number, questionData: Partial<Question>): Observable<DataResponse<Question>> {
    return this.http.put<DataResponse<Question>>(`${this.apiUrl}/${id}`, questionData);
  }

  deleteQuestion(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  getModules() {
    return this.modulesService.getModules({ limit: 100 });
  }
}