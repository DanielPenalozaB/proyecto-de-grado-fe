import { UserFormData } from '@/app/feature/admin/users/user-form/user-form.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/ui/table/table.interfaces';
import { User } from './users.interface';

/**
 * Interface for user search/filter parameters
 */
export interface UserSearchParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: 'id' | 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt';
  /** Sort direction */
  sortDirection?: 'ASC' | 'DESC';
  /** Filter by email (partial match) */
  email?: string;
  /** Filter by name (partial match) */
  name?: string;
  /** Filter by role (exact match) */
  role?: string;
  /** Search term for name and email fields */
  search?: string;
}

/**
 * Interface for password setup request
 */
export interface SetPasswordRequest {
  password: string;
}

/**
 * Response for basic message responses
 */
export interface MessageResponse {
  message: string;
}

/**
 * Response with data and message
 */
export interface DataResponse<T> {
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:4000/users';

  constructor(private http: HttpClient) { }

  /**
   * Get users with pagination, filtering, and sorting
   * @param params User search parameters
   * @returns Observable of ApiResponse<User>
   */
  getUsers(params: UserSearchParams = {}): Observable<ApiResponse<User>> {
    let httpParams = new HttpParams();

    // Add params that are provided
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.email) httpParams = httpParams.set('email', params.email);
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<User>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Observable of User
   */
  getUser(id: number): Observable<User> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Observable of the created User with response message
   */
  createUser(userData: Omit<UserFormData, 'id' | 'createdAt' | 'updatedAt'>): Observable<DataResponse<User>> {
    return this.http.post<DataResponse<User>>(this.apiUrl, userData);
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData Partial user data to update
   * @returns Observable of the updated User with response message
   */
  updateUser(id: number, userData: Partial<UserFormData>): Observable<DataResponse<User>> {
    return this.http.put<DataResponse<User>>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Observable of message response
   */
  deleteUser(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Set user password using token
   * @param token Password reset token
   * @param password New password
   * @returns Observable of message response
   */
  setupPassword(token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/setup-password/${token}`,
      { password }
    );
  }

  /**
   * Search users (shorthand for getUsers with search parameter)
   * @param searchTerm Text to search for
   * @param page Page number
   * @param limit Items per page
   * @returns Observable of ApiResponse<User>
   */
  searchUsers(searchTerm: string, page = 1, limit = 10): Observable<ApiResponse<User>> {
    return this.getUsers({
      search: searchTerm,
      page,
      limit
    });
  }
}