import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'attendees-data',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './attendees-data.component.html',
  styleUrl: './attendees-data.component.css'
})
export class AttendeesDataComponent {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  public modalService = inject(ModalService);
    attendeeForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    surname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]]
  })

    ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.autoCompleteAttendeeData();
    }
    }
    checkInputs(): boolean {
      this.attendeeForm.markAllAsTouched();
      return this.attendeeForm.valid;
      }

    autoCompleteAttendeeData(): void {
      const currentUser = this.authService.currentUser()
      if (!currentUser) return;
      this.attendeeForm.patchValue({
        name: currentUser.userName || '',
        surname: currentUser.userSurname || '',
        email: currentUser.email || ''
      });
    };      
}
