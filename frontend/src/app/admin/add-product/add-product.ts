import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
})
export class AddProductComponent implements OnInit {
  product = {
    slug: '',
    label: '',
    is_active: true
  };

  newCategory = '';
  categories: string[] = [];

  inputFields: any[] = [];
  newField = {
    label: '',
    name: '',
    type: 'text',
    required: false,
    placeholder: '',
    order: 0,
    categoryName: ''
  };

  slaSteps: string[] = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Closed'];
  newSlaStep = '';

  isLoading = false;
  successMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  addCategory() {
    if (this.newCategory.trim()) {
      if (!this.categories.includes(this.newCategory.trim())) {
        this.categories.push(this.newCategory.trim());
      }
      this.newCategory = '';
    }
  }

  removeCategory(index: number) {
    this.categories.splice(index, 1);
  }

  addField() {
    if (this.newField.label && this.newField.name) {
      this.inputFields.push({ ...this.newField });
      this.newField = {
        label: '',
        name: '',
        type: 'text',
        required: false,
        placeholder: '',
        order: this.inputFields.length,
        categoryName: ''
      };
    } else {
      Swal.fire('Error', 'Label and Name are required for input fields', 'error');
    }
  }

  removeField(index: number) {
    this.inputFields.splice(index, 1);
  }

  addSlaStep() {
    if (this.newSlaStep.trim()) {
      this.slaSteps.push(this.newSlaStep.trim());
      this.newSlaStep = '';
    }
  }

  removeSlaStep(index: number) {
    this.slaSteps.splice(index, 1);
  }

  onSubmit() {
    if (!this.product.label || !this.product.slug) {
      Swal.fire('Error', 'Product Label and Slug are required', 'error');
      return;
    }

    if (this.categories.length === 0) {
      Swal.fire('Error', 'Add at least one category', 'error');
      return;
    }

    this.isLoading = true;

    const payload = {
      product: this.product,
      categories: this.categories,
      inputFields: this.inputFields,
      sla: this.slaSteps
    };

    this.http.post<any>('http://localhost:3000/api/product/create', payload, { withCredentials: true }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'success',
          title: 'Deployment Successful',
          text: 'The banking product has been architected and deployed to the system.',
          confirmButtonColor: '#008269'
        });
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Deployment Failed',
          text: err.error?.message || 'A system error occurred during product engineering.',
          confirmButtonColor: '#008269'
        });
      }
    });
  }

  resetForm() {
    this.product = { slug: '', label: '', is_active: true };
    this.categories = [];
    this.inputFields = [];
    this.slaSteps = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Closed'];
  }
}
