import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-support-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.html'
})
export class SupportVerifyComponent implements OnInit {
  @Input() complaintId!: string;
  @Output() goBack = new EventEmitter<void>();

  complaint: any = null;
  updates: any[] = [];
  departments: string[] = [];
  employees: any[] = [];
  
  isLoading = true;
  isSubmitting = false;

  verifyForm = {
    verificationStatus: 'Verified',
    assignedDepartment: '',
    assignedTo: '',
    priority: 'Medium',
    internalNotes: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchDetails();
    this.fetchDepartments();
  }

  fetchDetails() {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/api/complaints/${this.complaintId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.complaint = res.complaint;
          this.updates = res.updates || [];
          if (this.complaint.verificationStatus) {
             this.verifyForm.verificationStatus = this.complaint.verificationStatus === 'Pending' ? 'Verified' : this.complaint.verificationStatus;
          }
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

  fetchDepartments() {
    this.http.get<string[]>('http://localhost:3000/api/departments', { withCredentials: true }).subscribe({
      next: (deps) => {
        // Filter out 'support' or let them assign to anyone
        this.departments = deps.filter(d => d.toLowerCase() !== 'support');
        this.cdr.detectChanges();
      }
    });
  }

  getDetailsKeys(): string[] {
    if (!this.complaint?.details || typeof this.complaint.details !== 'object') return [];
    return Object.keys(this.complaint.details).filter(k => this.complaint.details[k] !== null && this.complaint.details[k] !== '');
  }

  onDepartmentChange() {
    this.verifyForm.assignedTo = '';
    this.employees = [];
    if (!this.verifyForm.assignedDepartment) return;

    this.http.get<any[]>(`http://localhost:3000/api/employees?department=${this.verifyForm.assignedDepartment}`, { withCredentials: true }).subscribe({
      next: (emps) => {
        this.employees = emps;
        this.cdr.detectChanges();
      }
    });
  }

  submitVerify() {
    if (this.verifyForm.verificationStatus === 'Verified' && !this.verifyForm.assignedDepartment) {
      alert('Please assign a department before verifying.');
      return;
    }

    if (!this.verifyForm.internalNotes.trim()) {
      alert('Please add internal notes about your decision.');
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      verificationStatus: this.verifyForm.verificationStatus,
      internalNotes: this.verifyForm.internalNotes,
      priority: this.verifyForm.priority
    };

    // Only include assignment fields if verifying
    if (this.verifyForm.verificationStatus === 'Verified') {
      payload.assignedDepartment = this.verifyForm.assignedDepartment;
      payload.assignedTo = this.verifyForm.assignedTo;
    }

    this.http.post<any>(`http://localhost:3000/api/verify/${this.complaintId}`, payload, { withCredentials: true }).subscribe({
      next: () => {
        alert(this.verifyForm.verificationStatus === 'Verified'
          ? 'Complaint verified and assigned successfully!'
          : 'Complaint rejected successfully.');
        this.isSubmitting = false;
        this.goBack.emit();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit verification.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
