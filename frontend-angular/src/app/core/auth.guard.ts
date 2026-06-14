import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  
  if (token) {
    return true;
  }
  
  // Direct back to authentication page if no credentials found
  router.navigate(['/login']);
  return false;
};
