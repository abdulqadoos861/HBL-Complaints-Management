import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CustomerNavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerNavbarComponent],
  templateUrl: './list.html',
})
export class MyComplaintsComponent implements OnInit {
  isLoggedIn = false;
  complaints: any[] = [];
  isLoading = true;
  error = '';
  
  selectedComplaint: any = null;
  updates: any[] = [];
  isDetailsLoading = false;

  searchTrackingId = '';
  isSearching = false;

  replyText = '';
  isReplying = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.checkLogin();
    this.fetchMyComplaints();
  }

  checkLogin() {
    this.http.get<any>('http://localhost:3000/api/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.profileData) {
          this.isLoggedIn = true;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoggedIn = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchMyComplaints() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/myComplaints', { withCredentials: true }).subscribe({
      next: (data) => {
        this.complaints = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // 401 = not logged in (public user) — silently show empty list
        // so the search bar is still usable without authentication
        if (err.status !== 401) {
          this.error = 'Failed to load your complaints.';
        }
        this.complaints = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackManual() {
    if (!this.searchTrackingId.trim()) return;
    this.isSearching = true;
    this.viewDetails(this.searchTrackingId.trim());
  }

  viewDetails(complaintNumber: string) {
    this.isDetailsLoading = true;
    this.http.get<any>(`http://localhost:3000/api/tracking/${complaintNumber}`, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedComplaint = res.complaint;
          this.updates = res.updates;
          this.replyText = '';
        } else {
          alert('Tracking ID not found.');
        }
        this.isDetailsLoading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to load tracking details.');
        this.isDetailsLoading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReply() {
    if (!this.replyText.trim() || !this.selectedComplaint) return;
    this.isReplying = true;

    const payload = {
      complaintId: this.selectedComplaint._id,
      response: this.replyText
    };

    this.http.post('http://localhost:3000/api/customer-reply', payload, { withCredentials: true }).subscribe({
      next: () => {
        alert('Response submitted successfully! Your complaint is now back in review.');
        this.isReplying = false;
        this.viewDetails(this.selectedComplaint.complaintNumber); // Refresh
      },
      error: (err) => {
        alert('Failed to submit response.');
        this.isReplying = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'assigned': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'reject': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  }
}
