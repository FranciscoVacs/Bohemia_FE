import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'attendees-data',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './attendees-data.component.html',
  styleUrl: './attendees-data.component.css'
})
export class AttendeesDataComponent {
  private fb = inject(FormBuilder);

    attendeeForm = this.fb.group({
    attendeeName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    dniOrPassport: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    })
}
