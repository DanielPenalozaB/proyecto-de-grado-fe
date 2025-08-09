import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { BehaviorSubject, Observable, Subject, takeUntil, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number; // Add this to get token expiration time
  }
}

interface RegisterResponse {
  message: string;
  success: boolean;
  id: number;
  email: string;
  name: string;
  language: string;
  role: string;
  status: string;
  city: City;
  createdAt: Date;
  updatedAt: Date;
  emailConfirmed: boolean;
  passwordSet: boolean;
  password: string;
  passwordResetToken: null;
  passwordResetExpires: null;
  emailConfirmationToken: string;
}

export interface City {
  id: number;
  name: string;
  description: string;
  rainfall: number;
  language: string;
  regionId: null;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  cityId?: number;
}

interface TokenInfo {
  token: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly destroy$ = new Subject<void>();
  private tokenExpirationTimer?: any;

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const user = localStorage.getItem('currentUser');
    const tokenInfo = this.getTokenInfo();

    if (user && tokenInfo && this.isTokenValid(tokenInfo)) {
      this.currentUserSubject.next(JSON.parse(user));
      this.scheduleTokenRefresh(tokenInfo.expiresAt);
    } else if (user && tokenInfo) {
      // Token exists but is expired, try to refresh
      this.attemptTokenRefresh();
    } else {
      // No valid auth state
      this.clearAuthState();
    }
  }

  private getTokenInfo(): TokenInfo | null {
    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('tokenExpiresAt');

    if (token && expiresAt) {
      return {
        token,
        expiresAt: parseInt(expiresAt, 10)
      };
    }
    return null;
  }

  private isTokenValid(tokenInfo: TokenInfo): boolean {
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return tokenInfo.expiresAt > (now + bufferTime);
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    this.clearTokenRefreshTimer();

    const now = Date.now();
    const refreshTime = expiresAt - (10 * 60 * 1000); // Refresh 10 minutes before expiry
    const delay = Math.max(0, refreshTime - now);

    this.tokenExpirationTimer = timer(delay).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.attemptTokenRefresh();
    });
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
      this.tokenExpirationTimer = undefined;
    }
  }

  private attemptTokenRefresh(): void {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout();
      return;
    }

    this.refreshToken().subscribe({
      next: () => {
        // Token refreshed successfully
      },
      error: () => {
        // Refresh failed, logout user
        this.logout();
        toast.error('Session expired. Please sign in again.');
      }
    });
  }

  private clearAuthState(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    this.currentUserSubject.next(null);
    this.clearTokenRefreshTimer();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap({
        next: (response) => this.handleAuthentication(response),
        error: (error) => toast.error(error.error?.message || 'Login failed')
      })
    );
  }

  private handleAuthentication(response: LoginResponse): void {
    const expiresIn = response.data.expiresIn || (24 * 60 * 60); // Default 24 hours in seconds
    const expiresAt = Date.now() + (expiresIn * 1000);

    console.log('Login successful:', response.data.user);

    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    this.currentUserSubject.next(response.data.user);
    this.scheduleTokenRefresh(expiresAt);

    toast.success('Login successful');
    this.router.navigate([this.getDefaultRouteForRole(response.data.user.role)]);
  }

  private getDefaultRouteForRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return '/admin/users';
      case 'citizen':
        return '/';
      default:
        return '/';
    }
  }

  register(
    name: string,
    email: string,
    password: string,
    cityId: number,
    language: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/register`,
      { name, email, password, cityId, language }
    ).pipe(
      tap({
        next: (response) => {
          toast.success('Registration successful! Please check your email.');
          this.router.navigate(['/auth/confirm-email-instruction'], {
            state: { email: response.email }
          });
        },
        error: (error) => {
          toast.error(error.error?.message || 'Registration failed');
        }
      })
    );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/sign-in']);
    toast.success('Logged out successfully');
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get accessToken(): string | null {
    const tokenInfo = this.getTokenInfo();
    return (tokenInfo && this.isTokenValid(tokenInfo)) ? tokenInfo.token : null;
  }

  isAuthenticated(): boolean {
    const tokenInfo = this.getTokenInfo();
    const user = this.currentUserValue;

    if (!tokenInfo || !user) {
      return false;
    }

    if (!this.isTokenValid(tokenInfo)) {
      // Token is expired, attempt refresh if possible
      this.attemptTokenRefresh();
      return false;
    }

    return true;
  }

  isAuthenticatedSilent(): boolean {
    const tokenInfo = this.getTokenInfo();
    const user = this.currentUserValue;

    if (!tokenInfo || !user) {
      return false;
    }

    // Only check if token is valid, don't attempt refresh
    return this.isTokenValid(tokenInfo);
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role.toLowerCase() === role.toLowerCase();
  }

  // Method to manually check token validity (useful for components)
  checkTokenValidity(): boolean {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo ? this.isTokenValid(tokenInfo) : false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTokenRefreshTimer();
  }
}