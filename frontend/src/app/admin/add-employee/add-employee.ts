import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css'
})
export class AddEmployeeComponent implements OnInit {
  employee = {
    employee_id: '',
    name: '',
    username: '',
    email: '',
    department: '',
    designation: '',
    password: '',
  };

  lastRegisteredEmployee = {
    id: '',
    password: ''
  };

  employeesList: any[] = [];
  departments = [
    'IT', 
    'HR', 
    'Support', 
    'Operations', 
    'Finance', 
    'Compliance', 
    'Customer Service', 
    'Marketing', 
    'Legal', 
    'Risk Management', 
    'Audit', 
    'Digital Banking', 
    'Remittance', 
    'Branch Banking',
    'Trade Finance',
    'Corporate Banking',
    'Retail Banking',
    'Security'
  ];
  isLoading = false;
  showSuccessModal = false;
  message = '';
  isError = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.generateCredentials();
    this.fetchEmployees();
  }

  generateCredentials() {
    this.employee.employee_id = 'HBL-' + Math.floor(1000 + Math.random() * 9000);
    this.employee.password = this.generateRandomPassword(10);
  }

  generateRandomPassword(length: number): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  onNameChange() {
    if (this.employee.name) {
      this.employee.username = this.employee.name.toLowerCase().replace(/\s+/g, '.') + Math.floor(10 + Math.random() * 89);
    }
  }

  fetchEmployees() {
    this.http.get<any>('http://localhost:3000/api/admin/employees', { withCredentials: true }).subscribe({
      next: (response) => {
        if (response.ok) {
          this.employeesList = response.employees;
          this.cdr.detectChanges(); // Force UI update
        }
      },
      error: (err) => {
        // console.error('Error fetching employees:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.message = '';
    this.isError = false;

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.employee.email)) {
      this.message = 'Please enter a valid email address.';
      this.isError = true;
      this.isLoading = false;
      return;
    }
    
    const apiUrl = 'http://localhost:3000/api/admin/addemployee';

    this.http.post<any>(apiUrl, this.employee, { withCredentials: true }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isError = false;
        
        // Save these for the success modal
        this.lastRegisteredEmployee.id = this.employee.employee_id;
        this.lastRegisteredEmployee.password = this.employee.password;
        
        this.showSuccessModal = true;
        this.fetchEmployees(); // Refresh list automatically
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.message = err.error?.message || 'Failed to add employee. Please check your connection.';
        // console.error('Error adding employee:', err);
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.employee = {
      employee_id: '',
      name: '',
      username: '',
      email: '',
      department: '',
      designation: '',
      password: '',
    };
    this.generateCredentials();
  }
}
