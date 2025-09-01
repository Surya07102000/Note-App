import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: {
    _id: string;
    name: string;
    description?: string;
    permissions?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get all users (admin only)
  getAllUsers(startDate?: string, endDate?: string): Observable<User[]> {
    let params: any = {};
    
    if (startDate) {
      params.startDate = startDate;
    }
    
    if (endDate) {
      params.endDate = endDate;
    }

    return this.http.get<User[]>(`${this.apiUrl}`, { 
      headers: this.getHeaders(),
      params: params
    });
  }

  // Get current user profile
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData, { headers: this.getHeaders() });
  }

  // Delete user (admin only)
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() });
  }

  // Update user role (admin only)
  updateUserRole(userId: string, roleId: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { roleId }, { headers: this.getHeaders() });
  }

  // Get all roles (admin only)
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/roles`, { headers: this.getHeaders() });
  }
} 