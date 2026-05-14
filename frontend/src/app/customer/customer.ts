import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerNavbarComponent } from './navbar/navbar';
import { CustomerHomeComponent } from './home/home';
import { RegisterComplaintComponent } from './register/register';
import { MyComplaintsComponent } from './list/list';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule, 
    CustomerNavbarComponent, 
    CustomerHomeComponent, 
    RegisterComplaintComponent, 
    MyComplaintsComponent
  ],
  template: `
    <div class="min-h-screen bg-[#fdfdfd] flex flex-col font-sans">
      <app-customer-navbar (viewChanged)="currentView = $event"></app-customer-navbar>
      
      <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <app-customer-home 
          *ngIf="currentView === 'dashboard'"
          (action)="currentView = $event"
        ></app-customer-home>
        
        <app-register-complaint 
          *ngIf="currentView === 'register'"
        ></app-register-complaint>
        
        <app-my-complaints 
          *ngIf="currentView === 'list'"
        ></app-my-complaints>
      </main>

      <footer class="p-8 text-center bg-white border-t border-gray-100">
        <div class="flex justify-center gap-6 mb-4">
          <img src="https://www.hbl.com/assets/images/hbl-logo.png" class="h-6 opacity-30 grayscale" alt="HBL">
        </div>
        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">
          HBL Customer Care Portal &copy; 2026 | All Rights Reserved
        </p>
      </footer>
    </div>
  `
})
export class CustomerComponent {
  currentView: 'dashboard' | 'register' | 'list' = 'dashboard';
}
