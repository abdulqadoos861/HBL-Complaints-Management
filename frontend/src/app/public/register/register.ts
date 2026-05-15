import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class PublicRegisterComponent implements OnInit {
  complaint = {
    name: '',
    cnic: '',
    mobile: '',
    email: '',
    productType: '',
    category: '',
    subject: '',
    description: ''
  };

  products: any[] = [];
  categories: any[] = [];
  dynamicFields: any[] = [];
  dynamicData: any = {};
  selectedFiles: File[] = [];

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any[]>('http://localhost:3000/api/product/all').subscribe({
      next: (res) => {
        this.products = res || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load products', err)
    });
  }

  onProductChange() {
    this.complaint.category = '';
    this.categories = [];
    this.dynamicFields = [];
    this.dynamicData = {};

    const productId = this.complaint.productType;
    if (!productId) return;

    this.http.get<any[]>(`http://localhost:3000/api/category/${productId}`).subscribe({
      next: (res) => {
        this.categories = (res || []).map(c => {
          if (typeof c === 'string') return c;
          return c.name || c.label || c.category || c.value;
        }).filter(Boolean);
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>(`http://localhost:3000/api/inputFields/${productId}`).subscribe({
      next: (res) => {
        this.dynamicFields = (res || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        this.dynamicFields.forEach(field => this.dynamicData[field.name] = '');
        this.cdr.detectChanges();
      }
    });
  }

  getFilteredDynamicFields() {
    let fields = this.dynamicFields;
    if (this.complaint.category) {
      fields = fields.filter(f => !f.categoryName || f.categoryName === this.complaint.category);
    }
    const coreFields = ['subject', 'description'];
    return fields.filter(f => !coreFields.includes((f.label || f.name || '').toLowerCase().trim()));
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const selectedProduct = this.products.find(p => p._id === this.complaint.productType);
    const productLabel = selectedProduct ? (selectedProduct.slug || selectedProduct.label) : '';

    if (!productLabel || !this.complaint.category) {
      this.errorMessage = 'Please select a Product Type and Category.';
      this.isLoading = false;
      return;
    }

    const formData = new FormData();
    formData.append('name', this.complaint.name);
    formData.append('cnic', this.complaint.cnic);
    formData.append('mobile', this.complaint.mobile);
    formData.append('email', this.complaint.email);
    formData.append('productType', productLabel);
    formData.append('category', this.complaint.category);
    formData.append('subject', this.complaint.subject);
    formData.append('description', this.complaint.description);
    formData.append('details', JSON.stringify(this.dynamicData));
    formData.append('supportingDocs', JSON.stringify([]));

    this.selectedFiles.forEach(file => formData.append('docs', file));

    this.http.post<any>('http://localhost:3000/api/create', formData).subscribe({
      next: (res) => {
        this.successMessage = `Complaint registered successfully! Your tracking number is ${res.complaint.complaintNumber}`;
        this.isLoading = false;
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to register complaint.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.complaint = { name: '', cnic: '', mobile: '', email: '', productType: '', category: '', subject: '', description: '' };
    this.categories = []; this.dynamicFields = []; this.dynamicData = {}; this.selectedFiles = [];
  }
}
