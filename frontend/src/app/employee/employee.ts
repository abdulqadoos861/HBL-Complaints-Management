import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeNavbarComponent } from './navbar/navbar';
import { EmployeeHomeComponent } from './home/home';
import { EmployeeComplaintsComponent } from './complaints/complaints';
import { EmployeeAddUpdateComponent } from './add-update/add-update';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, EmployeeNavbarComponent, EmployeeHomeComponent, EmployeeComplaintsComponent, EmployeeAddUpdateComponent],
  template: `
    <div class="min-h-screen bg-[#f8faf9] flex flex-col font-sans">
      <app-employee-navbar (viewChanged)="changeView($event)"></app-employee-navbar>
      
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <app-employee-home *ngIf="currentView === 'dashboard'"></app-employee-home>
        <app-employee-complaints *ngIf="currentView === 'complaints'" (handleCase)="openAddUpdate($event)"></app-employee-complaints>
        <app-employee-add-update *ngIf="currentView === 'addUpdate'" [complaintId]="selectedComplaintId" (goBack)="changeView('complaints')"></app-employee-add-update>
      </main>

      <footer class="p-6 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
        HBL Internal Systems &copy; 2026 | Secure Staff Portal
      </footer>
    </div>
  `,
  styleUrl: './employee.css',
})
export class EmployeeComponent {
  currentView: 'dashboard' | 'complaints' | 'addUpdate' = 'dashboard';
  selectedComplaintId: string = '';

  changeView(view: any) {
    this.currentView = view;
  }

  openAddUpdate(complaintId: string) {
    this.selectedComplaintId = complaintId;
    this.currentView = 'addUpdate';
  }
}
