import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-add-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-update.html'
})
export class EmployeeAddUpdateComponent implements OnInit {
  @Input() complaintId!: string;
  @Output() goBack = new EventEmitter<void>();

  complaint: any = null;
  updates: any[] = [];
  isLoading = true;
  isSubmitting = false;

  updateForm = {
    status: '',
    previousstatus: '',
    resolationnote: ''
  };

  selectedFiles: File[] = [];
  availableStatuses: string[] = [];

  readonly WORKFLOW: Record<string, string[]> = {
    'Pending': ['Verified', 'Pending Customer Response', 'Closed'],
    'Submitted': ['Assigned', 'Pending Customer Response', 'Closed'],
    'Verified': ['Assigned', 'In Progress', 'Closed'],
    'Assigned': ['In Progress', 'Resolved', 'Closed'],
    'In Progress': ['Resolved', 'Pending Customer Response', 'Closed'],
    'Pending Customer Response': ['Submitted', 'Pending', 'Closed'],
    'Resolved': ['Closed', 'In Progress'],
    'Closed': []
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchDetails();
  }

  fetchDetails() {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/api/complaints/${this.complaintId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.complaint = res.complaint;
          this.updates = res.updates || [];
          
          const currentStep = res.complaint.currentStep || 'Submitted';
          this.updateForm.previousstatus = currentStep;
          this.updateForm.status = currentStep;

          // Determine available statuses (Current Status + Allowed Next Steps)
          const nextSteps = this.WORKFLOW[currentStep] || [];
          this.availableStatuses = [currentStep, ...nextSteps];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to load complaint details.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  submitUpdate() {
    if (!this.updateForm.resolationnote.trim()) {
      alert('Please add resolution notes.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('status', this.updateForm.status);
    formData.append('previousstatus', this.updateForm.previousstatus);
    formData.append('resolationnote', this.updateForm.resolationnote);
    
    this.selectedFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    this.http.post<any>(`http://localhost:3000/api/addupdate/${this.complaintId}`, formData, { withCredentials: true }).subscribe({
      next: () => {
        alert('Update posted successfully!');
        this.isSubmitting = false;
        this.updateForm.resolationnote = '';
        this.selectedFiles = [];
        this.fetchDetails(); // Refresh timeline
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to add update.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
