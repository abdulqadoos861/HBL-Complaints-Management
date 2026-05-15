import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  userId = '';
  password = '';
  errorMessage = '';
  isLoading = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/api/login', { withCredentials: true }).subscribe({
      next: (data) => {
        if (data.isAuthenticated) {
          this.redirectUser(data.role, data.department);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  redirectUser(role: string, department: string) {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'employee') {
      if (department === 'support') {
        this.router.navigate(['/support']);
      } else {
        this.router.navigate(['/employee']);
      }
    } else if (role === 'customer') {
      this.router.navigate(['/customer']);
    }
  }

  onLogin() {
    this.errorMessage = '';
    
    if (!this.userId || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter both User ID and Password',
        confirmButtonColor: '#008269'
      });
      return;
    }

    const loginData = { 
      username: this.userId, 
      password: this.password 
    };

    // Show loading alert
    Swal.fire({
      title: 'Verifying Credentials',
      html: 'Please wait while we secure your session...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>('http://localhost:3000/api/login', loginData, { withCredentials: true }).subscribe({
      next: (data) => {
        Swal.close();
        this.redirectUser(data.role, data.department);
      },
      error: (err) => {
        Swal.close();
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.errorMessage = msg;
        
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: msg,
          confirmButtonColor: '#008269'
        });
        console.error('Login error:', err);
      }
    });
  }
}
