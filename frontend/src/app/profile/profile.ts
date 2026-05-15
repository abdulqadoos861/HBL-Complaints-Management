import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  userRole = '';
  
  profileData = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    cnic: '', // Read-only
    accountNumber: '' // Read-only
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private location: Location) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/api/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.user) {
          this.userRole = res.user.role;
          this.profileData.email = res.user.email;
          this.profileData.name = res.profileData?.name || '';
          this.profileData.mobile = res.profileData?.mobile || '';
          this.profileData.cnic = res.profileData?.cnic || '';
          this.profileData.accountNumber = res.profileData?.account_number || '';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile data.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitProfile() {
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.profileData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      this.isSubmitting = false;
      return;
    }

    // Mobile Validation
    const mobileRegex = /^03\d{9}$/;
    if (!mobileRegex.test(this.profileData.mobile)) {
      this.errorMessage = 'Mobile number must be 11 digits (e.g., 03XXXXXXXXX).';
      this.isSubmitting = false;
      return;
    }

    const payload = {
      name: this.profileData.name,
      email: this.profileData.email,
      mobile: this.profileData.mobile,
      password: this.profileData.password
    };

    this.http.post<any>('http://localhost:3000/api/profile/update', payload, { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Profile updated successfully!';
          this.profileData.password = ''; // Clear password field after update
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update profile.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
