import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Note {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: string | User;
  sharedWith?: SharedUser[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface SharedUser {
  user: User;
  permission: 'read' | 'write';
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface ShareNoteRequest {
  userId: string;
  permission: 'read' | 'write';
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = `${environment.apiUrl}/notes`;
  private usersUrl = `${environment.apiUrl}/users`;

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

  // Get all notes
  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Get note by ID
  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new note
  createNote(note: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note)
      .pipe(catchError(this.handleError));
  }

  // Update note
  updateNote(id: string, note: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note)
      .pipe(catchError(this.handleError));
  }

  // Delete note
  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Archive/Unarchive note
  toggleArchive(id: string, isArchived: boolean): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, { isArchived })
      .pipe(catchError(this.handleError));
  }

  // Share note with user
  shareNote(noteId: string, shareData: ShareNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/${noteId}/share`, shareData)
      .pipe(catchError(this.handleError));
  }

  // Update sharing permission
  updateSharing(noteId: string, userId: string, permission: 'read' | 'write'): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${noteId}/share/${userId}`, { permission })
      .pipe(catchError(this.handleError));
  }

  // Remove sharing
  removeSharing(noteId: string, userId: string): Observable<Note> {
    return this.http.delete<Note>(`${this.apiUrl}/${noteId}/share/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Get all users for sharing
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/sharing`)
      .pipe(catchError(this.handleError));
  }

  // Search notes by tags
  searchByTags(tags: string[]): Observable<Note[]> {
    const params = { tags: tags.join(',') };
    return this.http.get<Note[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }
} 