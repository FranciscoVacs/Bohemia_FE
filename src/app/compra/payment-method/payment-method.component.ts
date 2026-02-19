import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'payment-method',
    imports: [],
    templateUrl: './payment-method.component.html',
    styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  private fb = inject(FormBuilder);

    cardForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
    })
}
