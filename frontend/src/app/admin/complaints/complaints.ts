import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css'
})
export class ComplaintsComponent implements OnInit {
  @Output() viewDetails = new EventEmitter<string>();
  
  complaints: any[] = [];
  isLoading = true;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/complaints', { withCredentials: true }).subscribe({
      next: (data) => {
        console.log('Complaints Data Received:', data);
        this.complaints = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load complaints. Make sure you are logged in as an admin.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error fetching complaints:', err);
      }
    });
  }

  onViewDetails(id: string) {
    this.viewDetails.emit(id);
  }

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'resolved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
