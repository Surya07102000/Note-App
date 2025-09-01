import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AIGenerateRequest {
  prompt: string;
  options?: {
    tone?: 'professional' | 'casual' | 'academic' | 'creative';
    length?: 'short' | 'medium' | 'long';
    format?: 'structured' | 'bullet-points' | 'paragraph' | 'outline';
    includeExamples?: boolean;
  };
}

export interface AIEnhanceRequest {
  title: string;
  content: string;
  enhancementType?: 'improve' | 'summarize' | 'expand' | 'restructure' | 'simplify';
}

export interface AITagsRequest {
  title: string;
  content: string;
  maxTags?: number;
}

export interface AITemplateRequest {
  templateType: 'meeting' | 'project' | 'research' | 'daily' | 'study' | 'creative' | 'custom';
  customPrompt?: string;
}

export interface AISuggestionsRequest {
  title: string;
  content: string;
}

export interface AIResponse {
  success: boolean;
  title?: string;
  content?: string;
  suggestedTags?: string[];
  tags?: string[];
  wordCount?: number;
  generatedAt?: string;
  enhancedAt?: string;
  enhancementType?: string;
  originalWordCount?: number;
  enhancedWordCount?: number;
  templateType?: string;
  createdAt?: string;
  suggestions?: string;
  analyzedAt?: string;
  model?: string;
  tokensUsed?: number;
}

export interface AIServiceStatus {
  available: boolean;
  message?: string;
  model?: string;
  provider?: string;
  features?: string[];
  limits?: {
    freeQuota?: string;
    maxTokens?: number;
  };
  timestamp?: string;
  user?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  /**
   * Generate note content from a prompt using Gemini
   */
  generateNote(request: AIGenerateRequest): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.apiUrl}/generate`, request)
      .pipe(
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Enhance existing note content using Gemini
   */
  enhanceNote(request: AIEnhanceRequest): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.apiUrl}/enhance`, request)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Generate tags for content using Gemini
   */
  generateTags(request: AITagsRequest): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.apiUrl}/tags`, request)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Generate note templates using Gemini
   */
  generateTemplate(request: AITemplateRequest): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.apiUrl}/template`, request)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Get writing suggestions using Gemini
   */
  getWritingSuggestions(request: AISuggestionsRequest): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.apiUrl}/suggestions`, request)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Check Gemini AI service availability and status
   */
  checkStatus(): Observable<AIServiceStatus> {
    return this.http.get<AIServiceStatus>(`${this.apiUrl}/status`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get AI service usage statistics (admin only)
   */
  getUsageStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate prompt before sending to AI
   */
  validatePrompt(prompt: string): { valid: boolean; message?: string } {
    if (!prompt || prompt.trim() === '') {
      return { valid: false, message: 'Prompt cannot be empty' };
    }

    if (prompt.length < 10) {
      return { valid: false, message: 'Prompt is too short. Please provide more details.' };
    }

    if (prompt.length > 5000) {
      return { valid: false, message: 'Prompt is too long. Please keep it under 5000 characters.' };
    }

    return { valid: true };
  }

  /**
   * Validate content for enhancement
   */
  validateContent(title: string, content: string): { valid: boolean; message?: string } {
    if (!title || title.trim() === '') {
      return { valid: false, message: 'Title is required' };
    }

    if (!content || content.trim() === '') {
      return { valid: false, message: 'Content is required' };
    }

    if (content.length > 10000) {
      return { valid: false, message: 'Content is too long. Please keep it under 10000 characters.' };
    }

    return { valid: true };
  }

  /**
   * Get enhancement type descriptions
   */
  getEnhancementTypes(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'improve',
        label: 'Improve & Polish',
        description: 'Enhance clarity, fix grammar, and improve overall quality'
      },
      {
        value: 'summarize',
        label: 'Summarize',
        description: 'Create a concise summary of the main points'
      },
      {
        value: 'expand',
        label: 'Expand with Details',
        description: 'Add more details, examples, and explanations'
      },
      {
        value: 'restructure',
        label: 'Restructure',
        description: 'Reorganize content for better flow and readability'
      },
      {
        value: 'simplify',
        label: 'Simplify Language',
        description: 'Make the content easier to understand'
      }
    ];
  }

  /**
   * Get available template types
   */
  getTemplateTypes(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'meeting',
        label: 'Meeting Notes',
        description: 'Template for meeting agenda, discussions, and action items'
      },
      {
        value: 'project',
        label: 'Project Planning',
        description: 'Template for project objectives, timeline, and milestones'
      },
      {
        value: 'research',
        label: 'Research Notes',
        description: 'Template for research findings, sources, and analysis'
      },
      {
        value: 'daily',
        label: 'Daily Journal',
        description: 'Template for daily goals, accomplishments, and reflections'
      },
      {
        value: 'study',
        label: 'Study Notes',
        description: 'Template for learning objectives, concepts, and review'
      },
      {
        value: 'creative',
        label: 'Creative Writing',
        description: 'Template for creative projects, ideas, and inspiration'
      },
      {
        value: 'custom',
        label: 'Custom Template',
        description: 'Create a custom template based on your specific needs'
      }
    ];
  }

  /**
   * Get tone options for AI generation
   */
  getToneOptions(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'professional',
        label: 'Professional',
        description: 'Formal, business-appropriate tone'
      },
      {
        value: 'casual',
        label: 'Casual',
        description: 'Conversational, friendly tone'
      },
      {
        value: 'academic',
        label: 'Academic',
        description: 'Scholarly, research-oriented tone'
      },
      {
        value: 'creative',
        label: 'Creative',
        description: 'Imaginative, expressive tone'
      }
    ];
  }

  /**
   * Get length options for AI generation
   */
  getLengthOptions(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'short',
        label: 'Short',
        description: '150-250 words - Quick and concise'
      },
      {
        value: 'medium',
        label: 'Medium',
        description: '250-500 words - Balanced detail'
      },
      {
        value: 'long',
        label: 'Long',
        description: '500-800 words - Comprehensive and detailed'
      }
    ];
  }

  /**
   * Get format options for AI generation
   */
  getFormatOptions(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'structured',
        label: 'Structured',
        description: 'Well-organized with clear sections'
      },
      {
        value: 'bullet-points',
        label: 'Bullet Points',
        description: 'Easy-to-scan list format'
      },
      {
        value: 'paragraph',
        label: 'Paragraphs',
        description: 'Flowing narrative format'
      },
      {
        value: 'outline',
        label: 'Outline',
        description: 'Hierarchical structure with headings'
      }
    ];
  }

  /**
   * Format AI response for display
   */
  formatAIResponse(response: AIResponse): string {
    let formatted = '';
    
    if (response.model) {
      formatted += `Generated using ${response.model}`;
    }
    
    if (response.wordCount) {
      formatted += ` • ${response.wordCount} words`;
    }
    
    if (response.tokensUsed) {
      formatted += ` • ${response.tokensUsed} tokens`;
    }
    
    return formatted;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to AI service. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You may not have permission to use AI features.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.status >= 500) {
        errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('AI Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
