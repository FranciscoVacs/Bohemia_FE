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
    direccion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    dniOrPassport: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
    })

    checkInputs(): boolean {
      this.attendeeForm.markAllAsTouched();
      return this.attendeeForm.valid;
      }
}
