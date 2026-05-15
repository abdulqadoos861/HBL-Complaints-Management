import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/product/all', { withCredentials: true }).subscribe({
      next: (res) => {
        this.products = res || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to fetch products', err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(product: any) {
    const newStatus = !product.is_active;
    
    Swal.fire({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Product?`,
      text: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${product.label}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#008269' : '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: `Yes, ${newStatus ? 'activate' : 'deactivate'} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch<any>(`http://localhost:3000/api/product/toggle/${product._id}`, { is_active: newStatus }, { withCredentials: true }).subscribe({
          next: (res) => {
            product.is_active = newStatus;
            Swal.fire({
              title: 'Success!',
              text: res.message,
              icon: 'success',
              confirmButtonColor: '#008269'
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to update status', 'error');
          }
        });
      }
    });
  }
}
