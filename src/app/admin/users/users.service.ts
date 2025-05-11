import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/ui/table/table.interfaces';
import { User } from './users.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:4000/users';

  constructor(private http: HttpClient) { }

  /**
   * Get all users with pagination
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Observable of ApiResponse<User>
   */
  getUsers(page = 1, pageSize = 10): Observable<ApiResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<User>>(this.apiUrl, { params });
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Observable of User
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new user
   * @param user User data without ID
   * @returns Observable of the created User
   */
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param user Partial user data
   * @returns Observable of the updated User
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Observable of void
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search users by query
   * @param query Search term
   * @param page Page number
   * @param pageSize Items per page
   * @returns Observable of ApiResponse<User>
   */
  searchUsers(query: string, page = 1, pageSize = 10): Observable<ApiResponse<User>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/search`, { params });
  }
}
