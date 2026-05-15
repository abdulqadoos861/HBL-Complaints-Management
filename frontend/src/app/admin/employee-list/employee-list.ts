import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.html'
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/api/admin/employees', { withCredentials: true }).subscribe({
      next: (res) => {
        this.employees = res.employees || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load employees list.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(employee: any) {
    const newStatus = !employee.user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this employee account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#008269' : '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: `Yes, ${action} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch(`http://localhost:3000/api/admin/employees/${employee._id}/status`, { isActive: newStatus }, { withCredentials: true }).subscribe({
          next: (res: any) => {
            Swal.fire('Updated!', res.message, 'success');
            employee.user.isActive = newStatus;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error toggling status:', err);
            Swal.fire('Error', 'Failed to update status', 'error');
          }
        });
      }
    });
  }
}
