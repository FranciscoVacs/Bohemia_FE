import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'purchase-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-redirect.component.html',
  styleUrl: './purchase-redirect.component.css'
})
export class PurchaseRedirectComponent {
  constructor(private route: ActivatedRoute) {}

ngOnInit() {
  console.log('component loaded');

  this.route.queryParams.subscribe(params => {
    console.log('ALL PARAMS:', params);
    console.log('payment_id:', params['payment_id']);
  });
}
}