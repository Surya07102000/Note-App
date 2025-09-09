import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      console.log('Auth state changed:', user);
      this.isAuthenticated = !!user;
      console.log('isAuthenticated:', this.isAuthenticated);
    });
  }
  ngOnInit() {
    // Check token validity on app start
    this.authService.validateToken();
  }
} 
