import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-10 animate-fade-in">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-br from-[#008269] to-[#005f4c] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h2 class="text-5xl font-black mb-4 tracking-tight">Staff Portal</h2>
              <p class="text-white/80 font-bold text-lg">Centralized Case Management & System Metrics</p>
            </div>
            <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 flex items-center gap-4 shadow-2xl">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#008269] shadow-inner">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-white/50">Current Date</p>
                <p class="font-bold text-sm">{{ today | date:'longDate' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <div class="bg-white/10 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 hover:bg-white/20 transition-all cursor-default group">
              <div class="w-10 h-10 bg-[#ffc107] rounded-xl flex items-center justify-center text-gray-900 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i class="fas fa-tasks text-xs"></i>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Active Cases</p>
              <h3 class="text-3xl font-black">12</h3>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 hover:bg-white/20 transition-all cursor-default group">
              <div class="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-gray-900 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i class="fas fa-check-circle text-xs"></i>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Resolved</p>
              <h3 class="text-3xl font-black">48</h3>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 hover:bg-white/20 transition-all cursor-default group">
              <div class="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-gray-900 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i class="fas fa-bolt text-xs"></i>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">SLA Success</p>
              <h3 class="text-3xl font-black">94%</h3>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 hover:bg-white/20 transition-all cursor-default group">
              <div class="w-10 h-10 bg-purple-400 rounded-xl flex items-center justify-center text-gray-900 mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i class="fas fa-clock text-xs"></i>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">Avg Response</p>
              <h3 class="text-3xl font-black">1.8h</h3>
            </div>
          </div>
        </div>
        <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute left-1/4 top-0 w-64 h-64 bg-[#ffc107]/10 rounded-full blur-[100px]"></div>
      </div>

      <!-- Action Center -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-gray-900 tracking-tight">Management Suite</h3>
            <span class="text-[10px] font-black text-[#008269] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Internal Tools</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button class="flex items-center gap-6 p-6 bg-gray-50 hover:bg-[#008269]/10 rounded-[2rem] transition-all group border-2 border-transparent hover:border-[#008269]/20 text-left">
              <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#008269] shadow-sm group-hover:bg-[#008269] group-hover:text-white transition-all">
                <i class="fas fa-list-check text-xl"></i>
              </div>
              <div>
                <p class="font-black text-gray-900 group-hover:text-[#008269] transition-colors">Case Queue</p>
                <p class="text-xs font-bold text-gray-400">View your assigned complaints</p>
              </div>
            </button>

            <button class="flex items-center gap-6 p-6 bg-gray-50 hover:bg-[#008269]/10 rounded-[2rem] transition-all group border-2 border-transparent hover:border-[#008269]/20 text-left">
              <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#008269] shadow-sm group-hover:bg-[#008269] group-hover:text-white transition-all">
                <i class="fas fa-file-shield text-xl"></i>
              </div>
              <div>
                <p class="font-black text-gray-900 group-hover:text-[#008269] transition-colors">SLA Policy</p>
                <p class="text-xs font-bold text-gray-400">Review resolution guidelines</p>
              </div>
            </button>

            <button class="flex items-center gap-6 p-6 bg-gray-50 hover:bg-[#008269]/10 rounded-[2rem] transition-all group border-2 border-transparent hover:border-[#008269]/20 text-left">
              <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#008269] shadow-sm group-hover:bg-[#008269] group-hover:text-white transition-all">
                <i class="fas fa-chart-line text-xl"></i>
              </div>
              <div>
                <p class="font-black text-gray-900 group-hover:text-[#008269] transition-colors">Analytics</p>
                <p class="text-xs font-bold text-gray-400">Performance insights</p>
              </div>
            </button>

            <button class="flex items-center gap-6 p-6 bg-gray-50 hover:bg-[#008269]/10 rounded-[2rem] transition-all group border-2 border-transparent hover:border-[#008269]/20 text-left">
              <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#008269] shadow-sm group-hover:bg-[#008269] group-hover:text-white transition-all">
                <i class="fas fa-user-gear text-xl"></i>
              </div>
              <div>
                <p class="font-black text-gray-900 group-hover:text-[#008269] transition-colors">Preferences</p>
                <p class="text-xs font-bold text-gray-400">Manage account settings</p>
              </div>
            </button>
          </div>
        </div>
        
        <div class="bg-gray-900 rounded-[3rem] p-10 shadow-2xl text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div class="relative z-10">
            <div class="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-[#008269] text-4xl mb-6 shadow-inner mx-auto">
              <i class="fas fa-shield-check"></i>
            </div>
            <h3 class="text-2xl font-black mb-2 tracking-tight">Secure Portal</h3>
            <p class="text-white/40 font-bold text-sm leading-relaxed mb-8">All communications and data processing are encrypted using HBL Bank standards.</p>
            <div class="bg-[#008269] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block">System Status: Optimal</div>
          </div>
          <div class="absolute -left-10 -top-10 w-40 h-40 bg-[#008269]/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeHomeComponent {
  today = new Date();
}
