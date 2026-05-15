import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.html',
})
export class EmployeeComplaintsComponent implements OnInit {
  @Output() handleCase = new EventEmitter<string>();

  complaints: any[] = [];
  isLoading = true;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchMyComplaints();
  }

  fetchMyComplaints() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/complaints', { withCredentials: true }).subscribe({
      next: (data) => {
        this.complaints = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load complaints. Please try logging in again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onHandleCase(id: string) {
    this.handleCase.emit(id);
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
}
