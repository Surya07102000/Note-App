import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  isMenuOpen = false;
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/notes', icon: 'note', label: 'Notes' },
    { path: '/users', icon: 'people', label: 'Users' },
    { path: '/roles', icon: 'security', label: 'Roles' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (user && user.name) {
      const names = user.name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      } else if (names.length === 1) {
        return names[0][0].toUpperCase();
      }
    }
    return 'U';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 