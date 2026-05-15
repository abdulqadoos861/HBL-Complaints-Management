import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html'
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  stats: any = null;
  refreshInterval: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchStats();
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => this.fetchStats(), 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  fetchStats() {
    console.log('AdminHome: Fetching stats from backend...');
    this.http.get('http://localhost:3000/api/admin/stats', { withCredentials: true }).subscribe({
      next: (data) => {
        console.log('AdminHome: Received stats data:', data);
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('AdminHome: Error fetching stats:', err);
      }
    });
  }
}
