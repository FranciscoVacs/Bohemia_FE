import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, UserDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  public modalService = inject(ModalService);
  public authService = inject(AuthService);
}
