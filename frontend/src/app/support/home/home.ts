import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-support-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Welcome to Support Dashboard</h2>
          <p class="text-gray-500 mt-1">Manage, verify and assign incoming customer complaints.</p>
        </div>
        <div class="w-16 h-16 bg-[#0052cc]/10 rounded-2xl flex items-center justify-center">
          <i class="fas fa-chart-pie text-[#0052cc] text-2xl"></i>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
            <i class="fas fa-clock text-xl"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending Verification</p>
            <p class="text-3xl font-black text-gray-900">{{pendingCount}}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SupportHomeComponent implements OnInit {
  pendingCount: number = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.http.get<any[]>('http://localhost:3000/api/complaints', { withCredentials: true }).subscribe({
      next: (data) => {
        this.pendingCount = (data || []).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
