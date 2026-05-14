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

    // Simple validation
    if (!this.username || !this.email || !this.password || !this.fullName || !this.cnic || !this.mobile || !this.accountNumber) {
      this.errorMessage = 'All fields are required';
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
      console.error('Signup error:', error);
    }
  }
}
