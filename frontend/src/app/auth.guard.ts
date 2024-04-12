import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService) // Create an instance of AuthService
  const router: Router = new Router(); // Create an instance of Router (not recommended)

  // Define protected routes
  const protectedRoutes: string[] = ['/lists'];

  // Check if the current route is a protected route and the user is not authenticated
  if (protectedRoutes.includes(state.url) && !authService.isAuthenticated()) {
    // Redirect the user to the login page
    router.navigate(['/Login']);
    return false; // Deny access
  }

  return true; // Allow access
};
