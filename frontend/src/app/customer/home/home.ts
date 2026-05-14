import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-fade-in">
      <div class="bg-gradient-to-br from-[#a91b2c] to-[#7a131f] rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div class="relative z-10 max-w-2xl">
          <h2 class="text-5xl font-black mb-4 tracking-tight">How can we help you today?</h2>
          <p class="text-white/80 text-lg font-medium mb-10">We are committed to providing you with the best banking experience. If you have an issue, we're here to resolve it.</p>
          
          <div class="flex flex-wrap gap-4">
            <button (click)="action.emit('register')" class="px-8 py-4 bg-white text-[#a91b2c] rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
              Register a New Complaint
            </button>
            <button (click)="action.emit('list')" class="px-8 py-4 bg-[#a91b2c]/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black hover:bg-white/10 transition-all">
              Track Existing Complaint
            </button>
          </div>
        </div>
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
           <div class="w-16 h-16 bg-red-50 text-[#a91b2c] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#a91b2c] group-hover:text-white transition-all">
             <i class="fas fa-bolt"></i>
           </div>
           <h3 class="text-xl font-black text-gray-900 mb-2">Fast Resolution</h3>
           <p class="text-gray-500 font-medium text-sm">Most complaints are addressed within 24-48 hours by our dedicated team.</p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
           <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
             <i class="fas fa-eye"></i>
           </div>
           <h3 class="text-xl font-black text-gray-900 mb-2">Full Transparency</h3>
           <p class="text-gray-500 font-medium text-sm">Track every step of your complaint's progress in real-time from your dashboard.</p>
        </div>

        <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
           <div class="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
             <i class="fas fa-headset"></i>
           </div>
           <h3 class="text-xl font-black text-gray-900 mb-2">Expert Support</h3>
           <p class="text-gray-500 font-medium text-sm">Your issues are handled by subject matter experts in their respective departments.</p>
        </div>
      </div>
    </div>
  `
})
export class CustomerHomeComponent {
  @Output() action = new EventEmitter<'register' | 'list'>();
}
