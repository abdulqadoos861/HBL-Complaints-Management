import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CustomerNavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-register-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerNavbarComponent],
  templateUrl: './register.html',
})
export class RegisterComplaintComponent implements OnInit {
  complaint = {
    name: '',
    cnic: '',
    mobile: '',
    email: '',
    productType: '', // This will hold the product ID initially, then slug/label on submit
    category: '',
    subject: '',
    description: ''
  };

  products: any[] = [];
  categories: any[] = [];
  dynamicFields: any[] = [];
  dynamicData: any = {}; // Object to hold dynamic field values
  selectedFiles: File[] = [];

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  customerData: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProfile();
    this.loadProducts();
  }

  loadProfile() {
    this.http.get<any>('http://localhost:3000/api/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.profileData) {
          this.customerData = res.profileData;
          this.complaint.name = res.profileData.name || '';
          this.complaint.cnic = res.profileData.cnic || '';
          this.complaint.mobile = res.profileData.mobile || '';
          this.complaint.email = res.user?.email || '';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        // 401 = not logged in (public user) — show manual input fields silently
        if (err.status !== 401) {
          // console.error('Failed to load profile', err);
        }
      }
    });
  }

  loadProducts() {
    this.http.get<any[]>('http://localhost:3000/api/product/all', { withCredentials: true }).subscribe({
      next: (res) => {
        // Only show active products for registration
        this.products = (res || []).filter(p => p.is_active !== false);
        this.cdr.detectChanges();
      },
      // error: (err) => console.error('Failed to load products', err)
    });
  }

  onProductChange() {
    this.complaint.category = '';
    this.categories = [];
    this.dynamicFields = [];
    this.dynamicData = {};

    const productId = this.complaint.productType;
    if (!productId) return;

    // Load Categories
    this.http.get<any[]>(`http://localhost:3000/api/category/${productId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        // Map different possible shapes to strings
        this.categories = (res || []).map(c => {
          if (typeof c === 'string') return c;
          return c.name || c.label || c.category || c.value || JSON.stringify(c);
        }).filter(Boolean);
        this.cdr.detectChanges();
      },
      // error: (err) => console.error('Failed to load categories', err)
    });

    // Load Dynamic Fields
    this.http.get<any[]>(`http://localhost:3000/api/inputFields/${productId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.dynamicFields = res || [];
        this.dynamicFields.sort((a, b) => (a.order || 0) - (b.order || 0));
        // Initialize dynamic data object
        this.dynamicFields.forEach(field => {
          this.dynamicData[field.name] = '';
        });
        this.cdr.detectChanges();
      },
      // error: (err) => console.error('Failed to load dynamic fields', err)
    });
  }

  getFilteredDynamicFields() {
    let fields = this.dynamicFields;
    
    // Filter by category if selected
    if (this.complaint.category) {
      fields = fields.filter(f => !f.categoryName || f.categoryName.trim() === '' || f.categoryName === this.complaint.category);
    }

    // Filter out fields that clash with static core fields to avoid duplication
    const coreFields = ['subject', 'description', 'subject line', 'detailed description', 'complaint description'];
    return fields.filter(f => {
      const label = (f.label || f.name || '').toLowerCase().trim();
      return !coreFields.includes(label);
    });
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

    // Manual Validation for public users (if not logged in)
    if (!this.customerData) {
      // Email Validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.complaint.email)) {
        this.errorMessage = 'Please enter a valid email address.';
        this.isLoading = false;
        return;
      }

      // CNIC Validation
      const cnicRegex = /^(\d{5}-\d{7}-\d{1})|(\d{13})$/;
      if (!cnicRegex.test(this.complaint.cnic)) {
        this.errorMessage = 'CNIC must be 13 digits (e.g., 42XXX-XXXXXXX-X).';
        this.isLoading = false;
        return;
      }

      // Mobile Validation
      const mobileRegex = /^03\d{9}$/;
      if (!mobileRegex.test(this.complaint.mobile)) {
        this.errorMessage = 'Mobile number must be 11 digits (e.g., 03XXXXXXXXX).';
        this.isLoading = false;
        return;
      }
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
    
    // Details must be a JSON string
    formData.append('details', JSON.stringify(this.dynamicData));
    
    // Supporting docs tracking
    formData.append('supportingDocs', JSON.stringify([]));

    // Files
    this.selectedFiles.forEach((file) => {
      formData.append('docs', file);
    });

    this.http.post<any>('http://localhost:3000/api/create', formData, { withCredentials: true }).subscribe({
      next: (res) => {
        this.successMessage = `Complaint registered successfully! Your tracking number is ${res.complaint.complaintNumber}`;
        this.isLoading = false;
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to register complaint. Please ensure all fields are correct.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.complaint = {
      name: '',
      cnic: '',
      mobile: '',
      email: '',
      productType: '',
      category: '',
      subject: '',
      description: ''
    };
    this.categories = [];
    this.dynamicFields = [];
    this.dynamicData = {};
    this.selectedFiles = [];
  }
}
