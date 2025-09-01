import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService, ActiveUser, PopularTag, NotesPerDay, AnalyticsSummary } from '../../services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  activeUsers: ActiveUser[] = [];
  popularTags: PopularTag[] = [];
  notesPerDay: NotesPerDay[] = [];
  summary: AnalyticsSummary | null = null;
  loading = true;
  error = '';
  user: any;

  private subscriptions: Subscription[] = [];
  private completedRequests = 0;
  private totalRequests = 4;

  constructor(private authService: AuthService, private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    console.log('Analytics component - Current user:', this.user);
    console.log('Analytics component - User role:', this.user?.role?.name);
    
    // Only load analytics if user is admin
    if (this.user?.role?.name === 'admin') {
      this.loadAnalyticsData();
    } else {
      this.loading = false;
      this.error = 'Access denied. Admin privileges required to view analytics.';
      console.log('User is not admin, blocking analytics API calls');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAnalyticsData(): void {
    this.loading = true;
    this.error = '';
    this.completedRequests = 0;

    // Load all analytics data in parallel
    const activeUsersSub = this.analyticsService.getMostActiveUsers()
      .subscribe({
        next: (data) => {
          this.activeUsers = data;
          this.checkCompletion();
        },
        error: (error) => {
          this.handleError('Failed to load active users', error);
          this.checkCompletion();
        }
      });

    const popularTagsSub = this.analyticsService.getMostUsedTags()
      .subscribe({
        next: (data) => {
          this.popularTags = data;
          this.checkCompletion();
        },
        error: (error) => {
          this.handleError('Failed to load popular tags', error);
          this.checkCompletion();
        }
      });

    const notesPerDaySub = this.analyticsService.getNotesPerDay()
      .subscribe({
        next: (data) => {
          this.notesPerDay = data;
          this.checkCompletion();
        },
        error: (error) => {
          this.handleError('Failed to load notes per day', error);
          this.checkCompletion();
        }
      });

    const summarySub = this.analyticsService.getAnalyticsSummary()
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.checkCompletion();
        },
        error: (error) => {
          this.handleError('Failed to load summary', error);
          this.checkCompletion();
        }
      });

    this.subscriptions.push(activeUsersSub, popularTagsSub, notesPerDaySub, summarySub);
  }

  private checkCompletion(): void {
    this.completedRequests++;
    if (this.completedRequests >= this.totalRequests) {
      this.loading = false;
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = message;
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  // Helper method to get chart data for notes per day
  getChartData(): { labels: string[], data: number[] } {
    if (this.notesPerDay.length > 0) {
      const labels = this.notesPerDay.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      const data = this.notesPerDay.map(item => item.count);
      return { labels, data };
    }
    return { labels: [], data: [] };
  }

  // Helper method to calculate bar height percentage
  getBarHeight(value: number): number {
    const maxValue = Math.max(...this.notesPerDay.map(item => item.count));
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  }
} 