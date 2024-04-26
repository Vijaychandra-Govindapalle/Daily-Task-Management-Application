import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Define protected routes
    const protectedRoutes: string[] = ['/lists'];

    // Check if the current route is a protected route and the user is not authenticated
    if (protectedRoutes.includes(state.url) && !this.authService.isAuthenticated()) {
      // Redirect the user to the login page
      this.router.navigate(['/Login']);
      return false; // Deny access
    }

    return true; // Allow access
  }
}
