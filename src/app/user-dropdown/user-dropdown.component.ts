import { Component, inject, signal, computed, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
    selector: 'user-dropdown',
    imports: [CommonModule, RouterLink],
    templateUrl: './user-dropdown.component.html',
    styleUrl: './user-dropdown.component.css'
})
export class UserDropdownComponent {
  public authService = inject(AuthService);
  public modalService = inject(ModalService);

  /** Whether the parent navbar is in scrolled/island mode */
  @Input() isNavScrolled = false;

  // Dropdown state
  isDropdownOpen = signal(false);

  // Computed initials (first letter of name + first letter of surname)
  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    const nameInitial = user.userName?.charAt(0).toUpperCase() || '';
    const surnameInitial = user.userSurname?.charAt(0).toUpperCase() || '';
    return `${nameInitial}${surnameInitial}`;
  });

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.closeDropdown();
    }
  }
}
