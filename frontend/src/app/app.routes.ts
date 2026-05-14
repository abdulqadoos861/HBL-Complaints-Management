import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password';
import { AdminComponent } from './admin/admin';
import { SupportComponent } from './support/support';
import { EmployeeComponent } from './employee/employee';
import { CustomerComponent } from './customer/customer';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'support', component: SupportComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
