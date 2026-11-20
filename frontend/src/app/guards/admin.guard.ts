import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  // If logged in as standard user, block admin portal access and redirect to user dashboard
  if (authService.isAuthenticated() && !authService.isAdmin()) {
    toastService.show('Access denied. Administrator privileges required.', 'error');
    router.navigate(['/dashboard']);
    return false;
  }

  router.navigate(['/admin/login']);
  return false;
};
