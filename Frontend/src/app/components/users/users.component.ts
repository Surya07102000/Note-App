import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  currentUser: any;
  loading = true;
  error = '';
  isAdmin = false;

  // Date filter properties
  filterStartDate: string = '';
  filterEndDate: string = '';
  isFilterApplied = false;
  filteredUserCount = 0;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  paginatedUsers: User[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
      // Add token validation first
    if (!this.authService.checkTokenValidity()) {
      return; // Will redirect to login if token is invalid
    }
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role?.name === 'admin';
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUsers(startDate?: string, endDate?: string): void {
    this.loading = true;
    this.error = '';

    if (this.isAdmin) {
      // Admin sees all users with optional date filtering
      const sub = this.userService.getAllUsers(startDate, endDate).subscribe({
        next: (data) => {
          this.users = data;
          this.filteredUserCount = data.length;
          this.totalItems = data.length;
          this.updatePagination();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load users';
          this.loading = false;
        }
      });
      this.subscriptions.push(sub);
    } else {
      // Normal user sees only their own profile
      const sub = this.userService.getCurrentUser().subscribe({
        next: (data) => {
          this.users = [data];
          this.filteredUserCount = 1;
          this.totalItems = 1;
          this.paginatedUsers = [data];
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load user profile';
          this.loading = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      const sub = this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user._id !== userId);
          this.totalItems = this.users.length;
          this.updatePagination();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user';
        }
      });
      this.subscriptions.push(sub);
    }
  }



  // Computed properties for summary statistics
  get totalUsers(): number {
    return this.users.length;
  }

  get adminUsers(): number {
    return this.users.filter(user => user.role?.name === 'admin').length;
  }

  get regularUsers(): number {
    return this.users.filter(user => user.role?.name === 'user').length;
  }

  // Date filter methods
  applyDateFilter(): void {
    if (!this.filterStartDate && !this.filterEndDate) {
      this.error = 'Please select at least one date to filter';
      return;
    }

    if (this.filterStartDate && this.filterEndDate && this.filterStartDate > this.filterEndDate) {
      this.error = 'Start date cannot be later than end date';
      return;
    }

    this.isFilterApplied = true;
    this.error = '';
    this.loadUsers(this.filterStartDate || undefined, this.filterEndDate || undefined);
  }

  clearDateFilter(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.isFilterApplied = false;
    this.error = '';
    this.loadUsers();
  }

  setQuickFilter(period: 'today' | 'week' | 'month'): void {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        this.filterStartDate = formatDate(today);
        this.filterEndDate = formatDate(today);
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        this.filterStartDate = formatDate(weekAgo);
        this.filterEndDate = formatDate(today);
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        this.filterStartDate = formatDate(monthAgo);
        this.filterEndDate = formatDate(today);
        break;
    }

    this.applyDateFilter();
  }

  getFilterDescription(): string {
    if (!this.isFilterApplied) return '';

    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    if (this.filterStartDate && this.filterEndDate) {
      if (this.filterStartDate === this.filterEndDate) {
        return `Users registered on ${formatDisplayDate(this.filterStartDate)}`;
      }
      return `Users registered between ${formatDisplayDate(this.filterStartDate)} and ${formatDisplayDate(this.filterEndDate)}`;
    } else if (this.filterStartDate) {
      return `Users registered from ${formatDisplayDate(this.filterStartDate)} onwards`;
    } else if (this.filterEndDate) {
      return `Users registered up to ${formatDisplayDate(this.filterEndDate)}`;
    }

    return '';
  }

  // Pagination methods
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    // Show maximum 5 pages
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPaginationInfo(): string {
    if (this.totalItems === 0) return 'No users found';
    
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    return `Showing ${startItem}-${endItem} of ${this.totalItems} users`;
  }
} 
