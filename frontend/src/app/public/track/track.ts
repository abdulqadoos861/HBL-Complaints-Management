import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './track.html',
})
export class PublicTrackComponent implements OnInit {
  searchTrackingId = '';
  isSearching = false;
  selectedComplaint: any = null;
  updates: any[] = [];
  isDetailsLoading = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  trackManual() {
    if (!this.searchTrackingId.trim()) return;
    this.isSearching = true;
    this.viewDetails(this.searchTrackingId.trim());
  }

  viewDetails(complaintNumber: string) {
    this.isDetailsLoading = true;
    this.http.get<any>(`http://localhost:3000/api/tracking/${complaintNumber}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedComplaint = res.complaint;
          this.updates = res.updates;
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
