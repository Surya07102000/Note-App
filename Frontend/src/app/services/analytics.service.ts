import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ActiveUser {
  _id: string;
  name: string;
  email: string;
  noteCount: number;
}

export interface PopularTag {
  tag: string;
  count: number;
}

export interface NotesPerDay {
  date: string;
  count: number;
}

export interface AnalyticsSummary {
  totalNotes: number;
  totalUsers: number;
  uniqueTags: number;
  notesToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // Get most active users
  getMostActiveUsers(): Observable<ActiveUser[]> {
    return this.http.get<ActiveUser[]>(`${this.apiUrl}/active-users`)
      .pipe(catchError(this.handleError));
  }

  // Get most used tags
  getMostUsedTags(): Observable<PopularTag[]> {
    return this.http.get<PopularTag[]>(`${this.apiUrl}/popular-tags`)
      .pipe(catchError(this.handleError));
  }

  // Get notes created per day for last 7 days
  getNotesPerDay(): Observable<NotesPerDay[]> {
    return this.http.get<NotesPerDay[]>(`${this.apiUrl}/notes-per-day`)
      .pipe(catchError(this.handleError));
  }

  // Get analytics summary
  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/summary`)
      .pipe(catchError(this.handleError));
  }
} 