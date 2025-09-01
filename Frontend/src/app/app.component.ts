import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated = false;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      console.log('Auth state changed:', user);
      this.isAuthenticated = !!user;
      console.log('isAuthenticated:', this.isAuthenticated);
    });
  }
} 