import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth for auth endpoints and public endpoints
  if (req.url.includes('/auth/') || isPublicEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.accessToken;

  if (!token) {
    // No token available - just proceed without auth header
    // Don't call logout here as it might be a legitimate public request
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService, router);
      }

      // Handle other auth-related errors
      if (error.status === 403) {
        router.navigate(['/']);
        return throwError(() => new Error('Access denied'));
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      authService.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return authService.refreshToken().pipe(
      switchMap(() => {
        isRefreshing = false;
        const newToken = authService.accessToken;
        refreshTokenSubject.next(newToken);

        // Retry original request with new token
        const newAuthReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next(newAuthReq);
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/auth/sign-in']);
        return throwError(() => refreshError);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    // Wait for the refresh to complete
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => {
        const newAuthReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${authService.accessToken}`
          }
        });
        return next(newAuthReq);
      })
    );
  }
}

function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/auth/',
    '/public/',
    '/cities', // Add cities endpoint as public
    // Add other public endpoints as needed
  ];

  return publicEndpoints.some(endpoint => url.includes(endpoint));
}