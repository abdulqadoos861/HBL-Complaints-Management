import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportNavbarComponent } from './navbar/navbar';
import { SupportHomeComponent } from './home/home';
import { SupportComplaintsComponent } from './complaints/complaints';
import { SupportVerifyComponent } from './verify/verify';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, SupportNavbarComponent, SupportHomeComponent, SupportComplaintsComponent, SupportVerifyComponent],
  template: `
    <div class="min-h-screen bg-[#f4f7fb] flex flex-col font-sans">
      <app-support-navbar (viewChanged)="changeView($event)"></app-support-navbar>
      
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <app-support-home *ngIf="currentView === 'dashboard'"></app-support-home>
        <app-support-complaints *ngIf="currentView === 'complaints'" (verifyCase)="openVerify($event)"></app-support-complaints>
        <app-support-verify *ngIf="currentView === 'verify'" [complaintId]="selectedComplaintId" (goBack)="changeView('complaints')"></app-support-verify>
      </main>

      <footer class="p-6 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
        HBL Helpdesk Portal &copy; 2026 | Secure Staff System
      </footer>
    </div>
  `,
  styleUrl: './support.css',
})
export class SupportComponent {
  currentView: 'dashboard' | 'complaints' | 'verify' = 'dashboard';
  selectedComplaintId: string = '';

  changeView(view: any) {
    this.currentView = view;
  }

  openVerify(complaintId: string) {
    this.selectedComplaintId = complaintId;
    this.currentView = 'verify';
  }
}
