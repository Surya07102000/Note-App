import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: any[] = [];
  currentUser: any;
  loading = true;
  error = '';
  adminRoleId: string | null = null;
  isAdmin = false;
  
  // Sort functionality
  sortBy: 'name' | 'email' | 'role' | 'created' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  roleFilter: 'all' | 'admin' | 'user' = 'all';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  paginatedUsers: User[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role?.name === 'admin';
    this.loadRolesAndUsers();
  }

  loadRolesAndUsers(): void {
    this.loading = true;
    this.error = '';

    if (this.isAdmin) {
      // Admin sees all users and roles
      this.userService.getAllRoles().subscribe({
        next: (roles) => {
          this.roles = roles;
          const adminRole = roles.find(r => r.name === 'admin');
          this.adminRoleId = adminRole?._id || null;
          
          this.userService.getAllUsers().subscribe({
            next: (users) => {
              this.users = users;
              this.applyFiltersAndSort();
              this.loading = false;
            },
            error: (err) => {
              this.error = 'Failed to load users';
              this.loading = false;
            }
          });
        },
        error: (err) => {
          this.error = 'Failed to load roles';
          this.loading = false;
        }
      });
    } else {
      // Normal user sees only their own profile
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.users = [user];
          this.filteredUsers = [user];
          this.totalItems = 1;
          this.paginatedUsers = [user];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load user profile';
          this.loading = false;
        }
      });
    }
  }

  promoteToAdmin(user: User): void {
    if (!this.adminRoleId) {
      alert('Admin role not found!');
      return;
    }
    if (!confirm(`Are you sure you want to promote ${user.name} to admin?`)) return;
    
    this.userService.updateUserRole(user._id, this.adminRoleId).subscribe({
      next: (updatedUser) => {
        user.role = updatedUser.role;
        this.applyFiltersAndSort(); // Refresh the filtered list
        alert(`${user.name} is now an admin!`);
      },
      error: (err) => {
        alert('Failed to promote user.');
      }
    });
  }

  // Sort and Filter Methods
  setSortBy(field: 'name' | 'email' | 'role' | 'created'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFiltersAndSort();
  }

  setRoleFilter(filter: 'all' | 'admin' | 'user'): void {
    this.roleFilter = filter;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.users];

    // Apply role filter
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role?.name === this.roleFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role?.name?.toLowerCase() || '';
          bValue = b.role?.name?.toLowerCase() || '';
          break;
        case 'created':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredUsers = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page when filters change
    this.updatePagination();
  }

  // Helper methods for UI
  getSortIcon(field: string): string {
    if (this.sortBy !== field) return '↕️';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  getFilteredCount(): string {
    const total = this.users.length;
    const filtered = this.filteredUsers.length;
    
    if (this.roleFilter === 'all') {
      return `Showing all ${total} users`;
    }
    
    return `Showing ${filtered} of ${total} users (${this.roleFilter}s only)`;
  }

  clearFilters(): void {
    this.roleFilter = 'all';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.applyFiltersAndSort();
  }

  // Pagination methods
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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