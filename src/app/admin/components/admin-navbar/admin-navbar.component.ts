import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-secondary/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 relative">
          <a routerLink="/" class="inline-flex items-center gap-2 text-white no-underline text-md px-4 py-2 rounded-lg transition-all hover:bg-[#b7ff00]/10 hover:text-[#b7ff00] cursor-pointer">
            <span class="material-symbols-outlined text-md">arrow_back</span>
            <span class="hidden md:inline">Home</span>
          </a>
          <div class="absolute left-1/2 -translate-x-1/2">
            <a routerLink="/admin" class="bg-linear-to-r from-[#b7ff00] to-[#7acc00] text-black px-4 py-1.5 rounded-full font-bold text-xs tracking-wider no-underline cursor-pointer transition-all hover:shadow-lg hover:shadow-[#b7ff00]/30">
              ADMIN PANEL
            </a>
          </div>
            <a routerLink="/admin" fragment="listado-eventos"
              class="inline-flex text-[#b7ff00] px-4 py-2 rounded-lg hover:bg-[#b7ff00]/10 items-center gap-2 no-underline cursor-pointer transition-all">
              <span class="material-symbols-outlined md:hidden">list</span>
              <span class="hidden md:inline">Listado de Eventos</span>
            </a>
        </div>
      </div>
    </nav>
  `
})
export class AdminNavbarComponent { }
