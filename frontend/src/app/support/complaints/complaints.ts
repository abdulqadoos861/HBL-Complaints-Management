import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.html',
})
export class SupportComplaintsComponent implements OnInit {
  @Output() verifyCase = new EventEmitter<string>();

  complaints: any[] = [];
  isLoading = true;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchPendingComplaints();
  }

  fetchPendingComplaints() {
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

  onVerifyCase(id: string) {
    this.verifyCase.emit(id);
  }

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'verified': return 'bg-green-100 text-green-700';
      case 'in progress': return 'bg-purple-100 text-purple-700';
      case 'pending customer response': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
