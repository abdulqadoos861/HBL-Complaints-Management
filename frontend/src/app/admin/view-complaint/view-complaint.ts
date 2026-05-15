import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-complaint.html',
  styleUrl: './view-complaint.css'
})
export class ViewComplaintComponent implements OnInit {
  @Input() complaintId!: string;
  @Output() back = new EventEmitter<void>();

  complaintData: any = null;
  updates: any[] = [];
  departments: string[] = [];
  employees: any[] = [];
  isLoading = true;
  isProcessing = false;
  error = '';

  // Verification Form
  verifyForm = {
    verificationStatus: 'Verified',
    assignedDepartment: '',
    assignedTo: '',
    priority: 'Medium',
    internalNotes: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.complaintId) {
      this.fetchComplaintDetails();
      this.fetchDepartments();
    }
  }

  fetchComplaintDetails() {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/api/complaints/${this.complaintId}`, { withCredentials: true }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Complaint Data Received:', response);
          this.complaintData = response.complaint;
          this.updates = response.updates || [];
          
          // Pre-fill form if already partially assigned
          this.verifyForm.assignedDepartment = this.complaintData.assignedDepartment || '';
          this.verifyForm.priority = this.complaintData.priority || 'Medium';
          this.verifyForm.internalNotes = this.complaintData.internalNotes || '';
          
          if (this.verifyForm.assignedDepartment) {
            this.fetchEmployeesByDepartment(this.verifyForm.assignedDepartment);
          }
        } else {
          this.error = response.message || 'Failed to load complaint details.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Server error while fetching details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchDepartments() {
    this.http.get<string[]>('http://localhost:3000/api/departments', { withCredentials: true }).subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error fetching departments:', err)
    });
  }

  fetchEmployeesByDepartment(dept: string) {
    if (!dept) return;
    this.http.get<any[]>(`http://localhost:3000/api/employees?department=${dept}`, { withCredentials: true }).subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  onDepartmentChange() {
    this.verifyForm.assignedTo = '';
    this.fetchEmployeesByDepartment(this.verifyForm.assignedDepartment);
  }

  submitVerification() {
    this.isProcessing = true;
    this.http.post(`http://localhost:3000/api/verify/${this.complaintId}`, this.verifyForm, { withCredentials: true }).subscribe({
      next: (res: any) => {
        alert('Complaint verified and assigned successfully!');
        this.isProcessing = false;
        this.fetchComplaintDetails(); // Refresh
      },
      error: (err) => {
        alert('Failed to verify complaint.');
        this.isProcessing = false;
      }
    });
  }

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'assigned': return 'bg-indigo-100 text-indigo-700';
      case 'in progress': return 'bg-blue-100 text-blue-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'reject': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getDetailsKeys(): string[] {
    if (!this.complaintData?.details || typeof this.complaintData.details !== 'object') return [];
    return Object.keys(this.complaintData.details).filter(k => this.complaintData.details[k] !== null && this.complaintData.details[k] !== '');
  }

  goBack() {
    this.back.emit();
  }
}
