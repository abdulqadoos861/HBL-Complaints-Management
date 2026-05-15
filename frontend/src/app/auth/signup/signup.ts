import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  // Signup Fields
  username = '';
  email = '';
  password = '';
  fullName = '';
  cnic = '';
  mobile = '';
  accountNumber = '';
  
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  async onSignup() {
    this.errorMessage = '';
    this.successMessage = '';

    // Field Required Validation
    if (!this.username || !this.email || !this.password || !this.fullName || !this.cnic || !this.mobile || !this.accountNumber) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Email Validation (Standard regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // CNIC Validation (13 digits, allowing dashes)
    const cnicRegex = /^(\d{5}-\d{7}-\d{1})|(\d{13})$/;
    if (!cnicRegex.test(this.cnic)) {
      this.errorMessage = 'CNIC must be 13 digits (format: 42xxx-xxxxxxx-x or 13 digits)';
      return;
    }

    // Mobile Validation (Pakistan format: 03xxxxxxxxx)
    const mobileRegex = /^03\d{9}$/;
    if (!mobileRegex.test(this.mobile)) {
      this.errorMessage = 'Mobile number must be 11 digits starting with 03 (format: 03xxxxxxxxx)';
      return;
    }

    // Account Number Validation (14-20 digits)
    const accountRegex = /^\d{14,20}$/;
    if (!accountRegex.test(this.accountNumber)) {
      this.errorMessage = 'Account number must be between 14 to 20 digits';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password,
          name: this.fullName,
          cnic: this.cnic,
          mobile: this.mobile,
          account_number: this.accountNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.successMessage = data.message;
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage = data.message || 'Registration failed';
      }
    } catch (error) {
      this.errorMessage = 'Could not connect to server. Is the backend running?';
      // console.error('Signup error:', error);
    }
  }
}
