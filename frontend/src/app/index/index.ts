import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {
  constructor(private http: HttpClient) {}

  submitContact(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const name = (form.querySelector('#name') as HTMLInputElement).value;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const message = (form.querySelector('#message') as HTMLTextAreaElement).value;

    if (!name || !email || !message) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }

    Swal.fire({
      title: 'Sending Message...',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>('http://localhost:3000/api/contact', { name, email, message }).subscribe({
      next: (res) => {
        Swal.fire('Success', res.message, 'success');
        form.reset();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to send message', 'error');
      }
    });
  }
}
