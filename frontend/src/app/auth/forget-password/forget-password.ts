import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPasswordComponent {
  step: 1 | 2 = 1;
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  isLoading = false;
  message = '';
  error = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  requestOTP() {
    if (!this.email) {
      this.error = 'Please enter your email address.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.message = '';

    this.http.post<any>('http://localhost:3000/api/forgot-password', { email: this.email }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.step = 2;
          this.message = 'OTP sent to your email. It expires in 10 minutes.';
        } else {
          this.error = res.message || 'Failed to send OTP.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Server error. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword() {
    if (!this.otp || !this.newPassword) {
      this.error = 'OTP and New Password are required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    const payload = {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    };

    this.http.post<any>('http://localhost:3000/api/reset-password', payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          alert('Password reset successfully!');
          this.router.navigate(['/login']);
        } else {
          this.error = res.message || 'Failed to reset password.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Invalid or expired OTP.';
        this.cdr.detectChanges();
      }
    });
  }
}
