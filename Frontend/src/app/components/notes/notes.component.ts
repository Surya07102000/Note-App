import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotesService, Note, CreateNoteRequest, UpdateNoteRequest, User, SharedUser, ShareNoteRequest } from '../../services/notes.service';
import { AuthService } from '../../services/auth.service';
import { AiService, AIGenerateRequest, AIEnhanceRequest, AITemplateRequest } from '../../services/ai.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  noteForm: FormGroup;
  editForm: FormGroup;
  shareForm: FormGroup;
  isCreating = false;
  isEditing = false;
  isSharing = false;
  editingNoteId: string | null = null;
  sharingNoteId: string | null = null;
  selectedTags: string[] = [];
  allTags: string[] = [];
  showArchived = false;
  searchTerm = '';
  loading = false;
  error = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  userSearchTerm = '';
  showUserDropdown = false;
  currentUser: any;

  // AI Assistant Properties
  showAiAssistant = false;
  aiLoading = false;
  aiError = '';
  aiPrompt = '';
  aiOptions = {
    tone: 'professional' as 'professional' | 'casual' | 'academic' | 'creative',
    length: 'medium' as 'short' | 'medium' | 'long',
    format: 'structured' as 'structured' | 'bullet-points' | 'paragraph' | 'outline',
    includeExamples: false
  };
  aiResult: any = null;
  enhancementType = 'improve' as 'improve' | 'summarize' | 'expand' | 'restructure' | 'simplify';
  showTemplates = false;
  selectedTemplateType: 'meeting' | 'project' | 'research' | 'daily' | 'study' | 'creative' | 'custom' = 'meeting';
  customTemplatePrompt = '';
  aiServiceAvailable = false;
  writingSuggestions = '';
  showSuggestions = false;

  // View Note Properties
  isViewing = false;
  viewingNote: Note | null = null;

  constructor(
    private notesService: NotesService,
    private authService: AuthService,
    private fb: FormBuilder,
    private aiService: AiService
  ) {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      content: ['', [Validators.required]],
      tags: ['', [Validators.required]]
    });

    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      content: ['', [Validators.required]],
      tags: ['', [Validators.required]],
      isArchived: [false]
    });

    this.shareForm = this.fb.group({
      userId: ['', [Validators.required]],
      userSearch: [''],
      permission: ['read', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Add token validation first
  if (!this.authService.checkTokenValidity()) {
    return; // Will redirect to login if token is invalid
  }
    this.currentUser = this.authService.getCurrentUser();
    this.loadNotes();
    this.loadUsers();
    this.checkAiServiceStatus();
  }

  loadNotes(): void {
    this.loading = true;
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.filteredNotes = notes;
        this.extractAllTags();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.notesService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter(user => user._id !== this.currentUser?._id);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  extractAllTags(): void {
    const tagSet = new Set<string>();
    this.notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    this.allTags = Array.from(tagSet).sort();
  }

  applyFilters(): void {
    let filtered = this.notes;

    // Filter by archived status
    if (!this.showArchived) {
      filtered = filtered.filter(note => !note.isArchived);
    }

    // Filter by selected tags
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        this.selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    this.filteredNotes = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTagFilterChange(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  openCreateForm(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.isSharing = false;
    this.noteForm.reset();
  }

  closeCreateForm(): void {
    this.isCreating = false;
    this.noteForm.reset();
  }

  openEditForm(note: Note): void {
    this.isEditing = true;
    this.isCreating = false;
    this.isSharing = false;
    this.editingNoteId = note._id || null;
    this.editForm.patchValue({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      isArchived: note.isArchived
    });
  }

  closeEditForm(): void {
    this.isEditing = false;
    this.editingNoteId = null;
    this.editForm.reset();
  }

  openShareForm(note: Note): void {
    this.isSharing = true;
    this.isCreating = false;
    this.isEditing = false;
    this.sharingNoteId = note._id || null;
    this.shareForm.reset({ permission: 'read' });
    this.userSearchTerm = '';
    this.filteredUsers = [...this.users];
    this.showUserDropdown = false;
  }

  closeShareForm(): void {
    this.isSharing = false;
    this.sharingNoteId = null;
    this.shareForm.reset();
    this.userSearchTerm = '';
    this.showUserDropdown = false;
  }

  parseTags(tagsString: string): string[] {
    return tagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  createNote(): void {
    if (this.noteForm.valid) {
      const formValue = this.noteForm.value;
      const noteData: CreateNoteRequest = {
        title: formValue.title,
        content: formValue.content,
        tags: this.parseTags(formValue.tags)
      };

      this.notesService.createNote(noteData).subscribe({
        next: (newNote) => {
          this.notes.unshift(newNote);
          this.extractAllTags();
          this.applyFilters();
          this.closeCreateForm();
          this.error = '';
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  updateNote(): void {
    if (this.editForm.valid && this.editingNoteId) {
      const formValue = this.editForm.value;
      const noteData: UpdateNoteRequest = {
        title: formValue.title,
        content: formValue.content,
        tags: this.parseTags(formValue.tags),
        isArchived: formValue.isArchived
      };

      this.notesService.updateNote(this.editingNoteId, noteData).subscribe({
        next: (updatedNote) => {
          const index = this.notes.findIndex(note => note._id === this.editingNoteId);
          if (index > -1) {
            this.notes[index] = updatedNote;
          }
          this.extractAllTags();
          this.applyFilters();
          this.closeEditForm();
          this.error = '';
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  deleteNote(noteId: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(noteId).subscribe({
        next: () => {
          this.notes = this.notes.filter(note => note._id !== noteId);
          this.extractAllTags();
          this.applyFilters();
          this.error = '';
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  toggleArchive(note: Note): void {
    const newArchivedState = !note.isArchived;
    this.notesService.toggleArchive(note._id!, newArchivedState).subscribe({
      next: (updatedNote) => {
        const index = this.notes.findIndex(n => n._id === note._id);
        if (index > -1) {
          this.notes[index] = updatedNote;
        }
        this.applyFilters();
        this.error = '';
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  shareNote(): void {
    if (this.shareForm.valid && this.sharingNoteId) {
      const formValue = this.shareForm.value;
      const shareData: ShareNoteRequest = {
        userId: formValue.userId,
        permission: formValue.permission
      };

      this.notesService.shareNote(this.sharingNoteId, shareData).subscribe({
        next: (updatedNote) => {
          const index = this.notes.findIndex(note => note._id === this.sharingNoteId);
          if (index > -1) {
            this.notes[index] = updatedNote;
          }
          this.closeShareForm();
          this.error = '';
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  updateSharingPermission(note: Note, sharedUser: SharedUser, newPermission: 'read' | 'write'): void {
    this.notesService.updateSharing(note._id!, sharedUser.user._id, newPermission).subscribe({
      next: (updatedNote) => {
        const index = this.notes.findIndex(n => n._id === note._id);
        if (index > -1) {
          this.notes[index] = updatedNote;
        }
        this.error = '';
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  removeSharing(note: Note, userId: string): void {
    if (confirm('Are you sure you want to remove sharing for this user?')) {
      this.notesService.removeSharing(note._id!, userId).subscribe({
        next: (updatedNote) => {
          const index = this.notes.findIndex(n => n._id === note._id);
          if (index > -1) {
            this.notes[index] = updatedNote;
          }
          this.error = '';
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  // Permission checks
  isOwner(note: Note): boolean {
    return typeof note.user === 'object' ? 
      note.user._id === this.currentUser?._id : 
      note.user === this.currentUser?._id;
  }

  canEdit(note: Note): boolean {
    if (this.isOwner(note)) return true;
    
    if (note.sharedWith) {
      const sharedEntry = note.sharedWith.find(share => 
        share.user._id === this.currentUser?._id
      );
      return sharedEntry?.permission === 'write';
    }
    
    return false;
  }

  canDelete(note: Note): boolean {
    return this.isOwner(note);
  }

  canShare(note: Note): boolean {
    return this.isOwner(note);
  }

  getNoteOwner(note: Note): string {
    if (typeof note.user === 'object') {
      return note.user.name;
    }
    return 'Unknown';
  }

  getSharedUsers(note: Note): SharedUser[] {
    return note.sharedWith || [];
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onPermissionChange(event: Event, note: Note, sharedUser: SharedUser): void {
    const target = event.target as HTMLSelectElement;
    const newPermission = target.value as 'read' | 'write';
    this.updateSharingPermission(note, sharedUser, newPermission);
  }

  clearError(): void {
    this.error = '';
  }

  // User search functionality
  onUserSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.userSearchTerm = target.value;
    this.filterUsers();
    this.showUserDropdown = true;
  }

  filterUsers(): void {
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTerm = this.userSearchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
  }

  selectUser(user: User): void {
    this.shareForm.patchValue({
      userId: user._id,
      userSearch: `${user.name} (${user.email})`
    });
    this.userSearchTerm = `${user.name} (${user.email})`;
    this.showUserDropdown = false;
  }

  onUserSearchFocus(): void {
    this.showUserDropdown = true;
    this.filterUsers();
  }

  onUserSearchBlur(): void {
    // Delay hiding the dropdown to allow click events on dropdown items
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  clearUserSelection(): void {
    this.shareForm.patchValue({
      userId: '',
      userSearch: ''
    });
    this.userSearchTerm = '';
    this.showUserDropdown = false;
  }

  // ==================== AI ASSISTANT METHODS ====================

  /**
   * Check if AI service is available
   */
  checkAiServiceStatus(): void {
    this.aiService.checkStatus().subscribe({
      next: (status) => {
        this.aiServiceAvailable = status.available;
        if (!status.available) {
          console.log('AI service not available:', status.message);
        }
      },
      error: (error) => {
        this.aiServiceAvailable = false;
        console.error('Failed to check AI service status:', error);
      }
    });
  }

  /**
   * Open AI Assistant modal
   */
  openAiAssistant(): void {
    this.showAiAssistant = true;
    this.isCreating = false;
    this.isEditing = false;
    this.isSharing = false;
    this.resetAiState();
  }

  /**
   * Close AI Assistant modal
   */
  closeAiAssistant(): void {
    this.showAiAssistant = false;
    this.resetAiState();
  }

  /**
   * Reset AI assistant state
   */
  resetAiState(): void {
    this.aiPrompt = '';
    this.aiResult = null;
    this.aiError = '';
    this.aiLoading = false;
    this.showTemplates = false;
    this.showSuggestions = false;
    this.writingSuggestions = '';
    this.customTemplatePrompt = '';
  }

  /**
   * Generate note content with AI
   */
  generateWithAI(): void {
    const validation = this.aiService.validatePrompt(this.aiPrompt);
    if (!validation.valid) {
      this.aiError = validation.message!;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    const request: AIGenerateRequest = {
      prompt: this.aiPrompt,
      options: this.aiOptions
    };

    this.aiService.generateNote(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.aiResult = response;
          this.aiError = '';
        } else {
          this.aiError = 'Failed to generate content. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'AI service is currently unavailable.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Use AI generated result to create a new note
   */
  useAiResult(): void {
    if (this.aiResult) {
      this.noteForm.patchValue({
        title: this.aiResult.title,
        content: this.aiResult.content,
        tags: this.aiResult.suggestedTags?.join(', ') || ''
      });
      this.closeAiAssistant();
      this.openCreateForm();
    }
  }

  /**
   * Enhance existing note content with AI
   */
  enhanceCurrentNote(): void {
    const form = this.isEditing ? this.editForm : this.noteForm;
    const currentTitle = form.get('title')?.value || '';
    const currentContent = form.get('content')?.value || '';

    const validation = this.aiService.validateContent(currentTitle, currentContent);
    if (!validation.valid) {
      this.aiError = validation.message!;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    const request: AIEnhanceRequest = {
      title: currentTitle,
      content: currentContent,
      enhancementType: this.enhancementType
    };

    this.aiService.enhanceNote(request).subscribe({
      next: (response) => {
        if (response.success) {
          form.patchValue({
            title: response.title,
            content: response.content,
            tags: response.suggestedTags?.join(', ') || form.get('tags')?.value
          });
          this.aiError = '';
        } else {
          this.aiError = 'Failed to enhance content. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'AI service is currently unavailable.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Generate tags using AI
   */
  generateTagsWithAI(isEditMode = false): void {
    const form = isEditMode ? this.editForm : this.noteForm;
    const title = form.get('title')?.value || '';
    const content = form.get('content')?.value || '';

    const validation = this.aiService.validateContent(title, content);
    if (!validation.valid) {
      this.aiError = validation.message!;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    this.aiService.generateTags({ title, content, maxTags: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.tags) {
          const currentTags = form.get('tags')?.value || '';
          const existingTags = currentTags ? currentTags.split(',').map((tag: string) => tag.trim()) : [];
          const newTags = [...new Set([...existingTags, ...response.tags])];
          
          form.patchValue({
            tags: newTags.join(', ')
          });
          this.aiError = '';
        } else {
          this.aiError = 'Failed to generate tags. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'Failed to generate tags.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Show template selection
   */
  openTemplateSelection(): void {
    this.showTemplates = true;
    this.showSuggestions = false;
    this.aiError = '';
  }

  /**
   * Generate template with AI
   */
  generateTemplate(): void {
    if (this.selectedTemplateType === 'custom' && !this.customTemplatePrompt.trim()) {
      this.aiError = 'Please provide a description for your custom template.';
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    const request: AITemplateRequest = {
      templateType: this.selectedTemplateType,
      customPrompt: this.customTemplatePrompt
    };

    this.aiService.generateTemplate(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.aiResult = response;
          this.showTemplates = false;
          this.aiError = '';
        } else {
          this.aiError = 'Failed to generate template. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'AI service is currently unavailable.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Get writing suggestions for current content
   */
  getWritingSuggestions(): void {
    const form = this.isEditing ? this.editForm : this.noteForm;
    const title = form.get('title')?.value || '';
    const content = form.get('content')?.value || '';

    const validation = this.aiService.validateContent(title, content);
    if (!validation.valid) {
      this.aiError = validation.message!;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    this.aiService.getWritingSuggestions({ title, content }).subscribe({
      next: (response) => {
        if (response.success && response.suggestions) {
          this.writingSuggestions = response.suggestions;
          this.showSuggestions = true;
          this.aiError = '';
        } else {
          this.aiError = 'Failed to get writing suggestions. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'AI service is currently unavailable.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Get helper methods for templates
   */
  getEnhancementTypes() {
    return this.aiService.getEnhancementTypes();
  }

  getTemplateTypes() {
    return this.aiService.getTemplateTypes();
  }

  /**
   * Set template type with proper typing
   */
  setTemplateType(templateType: string): void {
    this.selectedTemplateType = templateType as 'meeting' | 'project' | 'research' | 'daily' | 'study' | 'creative' | 'custom';
  }

  /**
   * Handle title blur event for potential AI suggestions
   */
  onTitleBlur(): void {
    const title = this.noteForm.get('title')?.value?.trim();
    if (title && this.aiServiceAvailable && !this.noteForm.get('content')?.value?.trim()) {
      // Show suggestion hint when title is entered but content is empty
      console.log('Title entered:', title, '- AI content generation available');
    }
  }

  /**
   * Generate content and tags based on title using AI
   */
  generateContentFromTitle(): void {
    const title = this.noteForm.get('title')?.value?.trim();
    
    if (!title) {
      this.aiError = 'Please enter a title first.';
      return;
    }

    this.aiLoading = true;
    this.aiError = '';

    // Create a prompt based on the title
    const prompt = `Create detailed content for a note titled "${title}". Provide comprehensive, well-structured information about this topic.`;

    const request: AIGenerateRequest = {
      prompt: prompt,
      options: {
        tone: 'professional',
        length: 'medium',
        format: 'structured',
        includeExamples: true
      }
    };

    this.aiService.generateNote(request).subscribe({
      next: (response) => {
        if (response.success) {
          // Fill in the content
          this.noteForm.patchValue({
            content: response.content
          });

          // Generate and fill in tags
          if (response.suggestedTags && response.suggestedTags.length > 0) {
            this.noteForm.patchValue({
              tags: response.suggestedTags.join(', ')
            });
          } else {
            // If no tags from content generation, try to generate them separately
            this.generateTagsFromTitleAndContent(title, response.content || '');
          }

          this.aiError = '';
        } else {
          this.aiError = 'Failed to generate content. Please try again.';
        }
        this.aiLoading = false;
      },
      error: (error) => {
        this.aiError = error.message || 'AI service is currently unavailable.';
        this.aiLoading = false;
      }
    });
  }

  /**
   * Generate tags from title and content
   */
  private generateTagsFromTitleAndContent(title: string, content: string): void {
    if (!title && !content) return;

    this.aiService.generateTags({ 
      title: title, 
      content: content || `Note about ${title}`, 
      maxTags: 5 
    }).subscribe({
      next: (response) => {
        if (response.success && response.tags) {
          const currentTags = this.noteForm.get('tags')?.value || '';
          const existingTags = currentTags ? currentTags.split(',').map((tag: string) => tag.trim()) : [];
          const newTags = [...new Set([...existingTags, ...response.tags])];
          
          this.noteForm.patchValue({
            tags: newTags.join(', ')
          });
        }
      },
      error: (error) => {
        console.error('Failed to generate tags:', error);
      }
    });
  }

  getToneOptions() {
    return this.aiService.getToneOptions();
  }

  getLengthOptions() {
    return this.aiService.getLengthOptions();
  }

  getFormatOptions() {
    return this.aiService.getFormatOptions();
  }

  /**
   * Clear AI error
   */
  clearAiError(): void {
    this.aiError = '';
  }

  /**
   * Format AI response info
   */
  formatAiInfo(result: any): string {
    return this.aiService.formatAIResponse(result);
  }

  // ==================== VIEW NOTE METHODS ====================

  /**
   * Open View Note modal
   */
  openViewNote(note: Note): void {
    this.viewingNote = note;
    this.isViewing = true;
    this.isCreating = false;
    this.isEditing = false;
    this.isSharing = false;
    this.showAiAssistant = false;
    this.clearAiError();
  }

  /**
   * Close View Note modal
   */
  closeViewNote(): void {
    this.isViewing = false;
    this.viewingNote = null;
    this.clearAiError();
  }

  /**
   * Get word count for content
   */
  getWordCount(content: string): number {
    if (!content) return 0;
    // Remove HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, ' ').trim();
    return textContent ? textContent.split(/\s+/).length : 0;
  }

  /**
   * Edit note from view modal
   */
  editFromView(): void {
    if (this.viewingNote) {
      this.closeViewNote();
      this.openEditForm(this.viewingNote);
    }
  }

  /**
   * Share note from view modal
   */
  shareFromView(): void {
    if (this.viewingNote) {
      this.closeViewNote();
      this.openShareForm(this.viewingNote);
    }
  }

  /**
   * Archive/Unarchive note from view modal
   */
  archiveFromView(): void {
    if (this.viewingNote) {
      this.toggleArchive(this.viewingNote);
      // Update the viewing note object to reflect the change
      this.viewingNote.isArchived = !this.viewingNote.isArchived;
    }
  }

  /**
   * Delete note from view modal
   */
  deleteFromView(): void {
    if (this.viewingNote && confirm('Are you sure you want to delete this note?')) {
      this.deleteNote(this.viewingNote._id!);
      this.closeViewNote();
    }
  }

  /**
   * Duplicate note from view modal
   */
  duplicateFromView(): void {
    if (this.viewingNote) {
      const duplicateData: CreateNoteRequest = {
        title: `Copy of ${this.viewingNote.title}`,
        content: this.viewingNote.content,
        tags: [...this.viewingNote.tags]
      };

      this.notesService.createNote(duplicateData).subscribe({
        next: (newNote) => {
          this.notes.unshift(newNote);
          this.extractAllTags();
          this.applyFilters();
          this.closeViewNote();
          // Optionally open the new note for editing
          setTimeout(() => this.openEditForm(newNote), 100);
        },
        error: (error) => {
          this.error = 'Failed to duplicate note: ' + error.message;
        }
      });
    }
  }

  /**
   * Export note from view modal
   */
  exportFromView(): void {
    if (this.viewingNote) {
      const exportContent = `
Title: ${this.viewingNote.title}
Created: ${this.formatDate(this.viewingNote.createdAt!)}
Tags: ${this.viewingNote.tags.join(', ')}

Content:
${this.viewingNote.content.replace(/<[^>]*>/g, '')}
      `.trim();

      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.viewingNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  /**
   * Enhance note content from view modal
   */
  enhanceFromView(): void {
    if (this.viewingNote) {
      this.aiLoading = true;
      this.aiError = '';

      const request: AIEnhanceRequest = {
        title: this.viewingNote.title,
        content: this.viewingNote.content,
        enhancementType: 'improve'
      };

      this.aiService.enhanceNote(request).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the note directly
            const noteData: UpdateNoteRequest = {
              title: response.title || this.viewingNote!.title,
              content: response.content || this.viewingNote!.content,
              tags: response.suggestedTags || this.viewingNote!.tags,
              isArchived: this.viewingNote!.isArchived
            };

            this.notesService.updateNote(this.viewingNote!._id!, noteData).subscribe({
              next: (updatedNote) => {
                // Update the note in the list
                const index = this.notes.findIndex(note => note._id === this.viewingNote!._id);
                if (index > -1) {
                  this.notes[index] = updatedNote;
                  this.viewingNote = updatedNote; // Update viewing note
                }
                this.extractAllTags();
                this.applyFilters();
                this.aiError = '';
              },
              error: (error) => {
                this.aiError = 'Failed to save enhanced content: ' + error.message;
              }
            });
          } else {
            this.aiError = 'Failed to enhance content. Please try again.';
          }
          this.aiLoading = false;
        },
        error: (error) => {
          this.aiError = error.message || 'AI service is currently unavailable.';
          this.aiLoading = false;
        }
      });
    }
  }

  /**
   * Generate tags from view modal
   */
  generateTagsFromView(): void {
    if (this.viewingNote) {
      this.aiLoading = true;
      this.aiError = '';

      this.aiService.generateTags({ 
        title: this.viewingNote.title, 
        content: this.viewingNote.content, 
        maxTags: 5 
      }).subscribe({
        next: (response) => {
          if (response.success && response.tags) {
            const newTags = [...new Set([...this.viewingNote!.tags, ...response.tags])];
            
            const noteData: UpdateNoteRequest = {
              title: this.viewingNote!.title,
              content: this.viewingNote!.content,
              tags: newTags,
              isArchived: this.viewingNote!.isArchived
            };

            this.notesService.updateNote(this.viewingNote!._id!, noteData).subscribe({
              next: (updatedNote) => {
                const index = this.notes.findIndex(note => note._id === this.viewingNote!._id);
                if (index > -1) {
                  this.notes[index] = updatedNote;
                  this.viewingNote = updatedNote;
                }
                this.extractAllTags();
                this.applyFilters();
                this.aiError = '';
              },
              error: (error) => {
                this.aiError = 'Failed to save generated tags: ' + error.message;
              }
            });
          } else {
            this.aiError = 'Failed to generate tags. Please try again.';
          }
          this.aiLoading = false;
        },
        error: (error) => {
          this.aiError = error.message || 'Failed to generate tags.';
          this.aiLoading = false;
        }
      });
    }
  }

  /**
   * Get writing suggestions from view modal
   */
  getSuggestionsFromView(): void {
    if (this.viewingNote) {
      this.aiLoading = true;
      this.aiError = '';

      this.aiService.getWritingSuggestions({ 
        title: this.viewingNote.title, 
        content: this.viewingNote.content 
      }).subscribe({
        next: (response) => {
          if (response.success && response.suggestions) {
            this.writingSuggestions = response.suggestions;
            this.showSuggestions = true;
            this.aiError = '';
          } else {
            this.aiError = 'Failed to get writing suggestions. Please try again.';
          }
          this.aiLoading = false;
        },
        error: (error) => {
          this.aiError = error.message || 'AI service is currently unavailable.';
          this.aiLoading = false;
        }
      });
    }
  }
} 
