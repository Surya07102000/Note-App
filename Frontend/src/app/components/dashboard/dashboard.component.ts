import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService, ActiveUser, PopularTag, NotesPerDay, AnalyticsSummary } from '../../services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any;

  // Analytics properties
  activeUsers: ActiveUser[] = [];
  popularTags: PopularTag[] = [];
  notesPerDay: NotesPerDay[] = [];
  summary: AnalyticsSummary | null = null;
  loading = true;
  error = '';

  private subscriptions: Subscription[] = [];
  private completedRequests = 0;
  private totalRequests = 4;

  constructor(private authService: AuthService, private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Only load analytics if user is admin
    if (this.user?.role?.name === 'admin') {
      this.loadAnalyticsData();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load analytics data for admin dashboard
  loadAnalyticsData(): void {
    this.loading = true;
    this.error = '';
    this.completedRequests = 0;

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
    this.error = message;
  }

  refreshData(): void {
    // Only refresh analytics if user is admin
    if (this.user?.role?.name === 'admin') {
      this.loadAnalyticsData();
    }
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
    const maxValue = this.getMaxValue();
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  }

  // Helper method to calculate bar height in pixels for better visibility
  getBarHeightInPixels(value: number): number {
    const maxHeight = 180; // Maximum height in pixels
    const maxValue = this.getMaxValue();
    if (maxValue === 0) return 4; // Minimum height for visibility
    const height = (value / maxValue) * maxHeight;
    return Math.max(height, value > 0 ? 4 : 0); // Minimum 4px for non-zero values
  }

  // Helper method to get maximum value from chart data
  getMaxValue(): number {
    if (this.notesPerDay.length === 0) return 0;
    return Math.max(...this.notesPerDay.map(item => item.count));
  }

  // Helper method to check if chart has any data
  hasChartData(): boolean {
    return this.notesPerDay.length > 0 && this.notesPerDay.some(item => item.count > 0);
  }


} 