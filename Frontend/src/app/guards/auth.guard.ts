import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if token is expired
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= tokenData.exp * 1000;
      
      if (isExpired) {
        // Token expired, clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
        return false;
      }
      
      // Token is valid, allow access
      return true;
    } catch (error) {
      // Invalid token format, clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
