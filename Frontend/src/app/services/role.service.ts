import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description: string;
  userCount?: number; // Number of users with this role
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithUsers extends Role {
  users?: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get all roles with user counts
  getAllRoles(includeUserCount = true): Observable<Role[]> {
    let params = new HttpParams();
    if (includeUserCount) {
      params = params.set('includeUserCount', 'true');
    }
    
    return this.http.get<Role[]>(`${this.apiUrl}`, { 
      headers: this.getHeaders(),
      params: params
    });
  }

  // Get role by ID with optional user details
  getRoleById(roleId: string, includeUsers = false): Observable<RoleWithUsers> {
    let params = new HttpParams();
    if (includeUsers) {
      params = params.set('includeUsers', 'true');
    }
    
    return this.http.get<RoleWithUsers>(`${this.apiUrl}/${roleId}`, { 
      headers: this.getHeaders(),
      params: params
    });
  }

  // Get users by role type (admin/user)
  getUsersByRoleType(roleType: 'admin' | 'user'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${roleType}`, { 
      headers: this.getHeaders() 
    });
  }

  // Get role statistics
  getRoleStatistics(): Observable<{
    totalRoles: number;
    totalUsers: number;
    adminCount: number;
    userCount: number;
    rolesWithCounts: Role[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistics`, { 
      headers: this.getHeaders() 
    });
  }

  // Create role
  createRole(roleData: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}`, roleData, { 
      headers: this.getHeaders() 
    });
  }

  // Update role
  updateRole(roleId: string, roleData: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${roleId}`, roleData, { 
      headers: this.getHeaders() 
    });
  }

  // Delete role
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roleId}`, { 
      headers: this.getHeaders() 
    });
  }

  // Bulk update user roles
  bulkUpdateUserRoles(updates: { userId: string; roleId: string }[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/bulk-update`, { updates }, { 
      headers: this.getHeaders() 
    });
  }
}
