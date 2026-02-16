import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { PurchaseService } from '../../services/purchase.service';
import { filter } from 'rxjs/operators';
import { PurchaseDetails } from '../../models/purchase';

@Component({
  selector: 'purchase-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-redirect.component.html',
  styleUrl: './purchase-redirect.component.css'
})
export class PurchaseRedirectComponent {
  constructor(private route: ActivatedRoute, private purchaseService: PurchaseService) {}
  purchaseDetails?: PurchaseDetails;
  purchaseId?: number;

ngOnInit() {
  console.log('component loaded');

  this.route.queryParams.pipe(
    map(params => params['payment_id']),
    filter(Boolean),
    switchMap((paymentId) => {
          console.log('Payment ID:', paymentId);
         return this.purchaseService.verifyPayment(paymentId)
    }),
    switchMap(((verificationResult:{success: boolean, purchaseId: number}) => {
      console.log('Verification Result:', verificationResult);
      this.purchaseId = verificationResult.purchaseId;
      return this.purchaseService.getPurchaseById(verificationResult.purchaseId);
    })
    )).subscribe({
    next: res => {
      console.log(res)
      this.purchaseDetails = {
        ticketTypeName: res.data.ticketType?.ticketTypeName,
        locationName: res.data.ticketType?.event?.location?.locationName,
        eventDate: res.data.ticketType?.event?.beginDatetime,
        ticketId: res.data.ticket?.[0].id
      }
    },
    error: err => console.error(err)})
}
}