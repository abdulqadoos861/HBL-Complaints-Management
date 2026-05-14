import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="bg-gradient-to-br from-[#008269] to-[#005f4c] rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-4xl font-black mb-2">Welcome Back!</h2>
          <p class="text-white/80 font-medium">Your daily task overview and system metrics.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Active Tasks</p>
              <h3 class="text-3xl font-black">12</h3>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Resolved Today</p>
              <h3 class="text-3xl font-black">08</h3>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Response Time</p>
              <h3 class="text-3xl font-black">2.4h</h3>
            </div>
          </div>
        </div>
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 class="text-xl font-black text-gray-900 mb-4">Quick Links</h3>
          <div class="space-y-3">
             <button class="w-full text-left p-4 bg-gray-50 hover:bg-[#008269]/10 rounded-2xl font-bold text-gray-700 transition-all flex justify-between items-center group">
               View All Assignments
               <i class="fas fa-chevron-right text-gray-300 group-hover:text-[#008269]"></i>
             </button>
             <button class="w-full text-left p-4 bg-gray-50 hover:bg-[#008269]/10 rounded-2xl font-bold text-gray-700 transition-all flex justify-between items-center group">
               SLA Guidelines
               <i class="fas fa-chevron-right text-gray-300 group-hover:text-[#008269]"></i>
             </button>
          </div>
        </div>
        
        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-[#008269] text-3xl mb-4">
            <i class="fas fa-bell"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-900">No New Notifications</h3>
          <p class="text-sm text-gray-500">You're all caught up for now!</p>
        </div>
      </div>
    </div>
  `
})
export class EmployeeHomeComponent {}
