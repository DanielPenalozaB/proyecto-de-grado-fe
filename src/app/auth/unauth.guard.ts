import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const unauthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use silent check to avoid triggering logout/refresh
  if (authService.isAuthenticatedSilent()) {
    const currentUser = authService.currentUserValue;
    const userRole = currentUser?.role?.toLowerCase();

    // Redirect to appropriate page based on role
    switch (userRole) {
      case 'admin':
        router.navigate(['/admin/']);
        break;
      case 'citizen':
        router.navigate(['/']);
        break;
      default:
        router.navigate(['/']);
    }
    return false;
  }

  // Allow access to auth routes if not authenticated or token is expired
  return true;
};