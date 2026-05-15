import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { AddEmployeeComponent } from './add-employee/add-employee';
import { ComplaintsComponent } from './complaints/complaints';
import { AdminHomeComponent } from './home/home';
import { ViewComplaintComponent } from './view-complaint/view-complaint';
import { EmployeeListComponent } from './employee-list/employee-list';
import { AddProductComponent } from './add-product/add-product';
import { ProductListComponent } from './product-list/product-list';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    AddEmployeeComponent, 
    ComplaintsComponent, 
    AdminHomeComponent,
    ViewComplaintComponent,
    EmployeeListComponent,
    AddProductComponent,
    ProductListComponent
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  currentView: 'dashboard' | 'add-employee' | 'complaints' | 'view-details' | 'manage-employees' | 'add-product' | 'manage-products' = 'dashboard';
  selectedComplaintId: string = '';

  setView(view: 'dashboard' | 'add-employee' | 'complaints' | 'view-details' | 'manage-employees' | 'add-product' | 'manage-products') {
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
