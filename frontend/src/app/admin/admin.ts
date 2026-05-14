import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { AddEmployeeComponent } from './add-employee/add-employee';
import { ComplaintsComponent } from './complaints/complaints';
import { AdminHomeComponent } from './home/home';
import { ViewComplaintComponent } from './view-complaint/view-complaint';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    AddEmployeeComponent, 
    ComplaintsComponent, 
    AdminHomeComponent,
    ViewComplaintComponent
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  currentView: 'dashboard' | 'add-employee' | 'complaints' | 'view-details' = 'dashboard';
  selectedComplaintId: string = '';

  setView(view: 'dashboard' | 'add-employee' | 'complaints' | 'view-details') {
    this.currentView = view;
  }

  showComplaintDetails(id: string) {
    this.selectedComplaintId = id;
    this.currentView = 'view-details';
  }

  closeDetails() {
    this.currentView = 'complaints';
    this.selectedComplaintId = '';
  }
}
