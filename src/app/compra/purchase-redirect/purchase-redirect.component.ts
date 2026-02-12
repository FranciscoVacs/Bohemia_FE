import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'purchase-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-redirect.component.html',
  styleUrl: './purchase-redirect.component.css'
})
export class PurchaseRedirectComponent {
  constructor() {}

  ngOnInit() {
  console.log('PurchaseRedirectComponent initialized');
  }
}
