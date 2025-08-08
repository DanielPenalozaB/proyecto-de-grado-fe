import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and token is valid
  if (!authService.isAuthenticated()) {
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    router.navigate(['/auth/sign-in'], {
      queryParams: { returnUrl }
    });
    return false;
  }

  // Additional token validity check
  if (!authService.checkTokenValidity()) {
    router.navigate(['/auth/sign-in'], {
      queryParams: { returnUrl: state.url, reason: 'expired' }
    });
    return false;
  }

  // Check role-based permissions
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to appropriate page
      const userRole = authService.currentUserValue?.role?.toLowerCase();

      switch (userRole) {
        case 'admin':
          router.navigate(['/admin/users']);
          break;
        case 'citizen':
          router.navigate(['/']);
          break;
        default:
          router.navigate(['/sign-up']);
      }
      return false;
    }
  }

  return true;
};