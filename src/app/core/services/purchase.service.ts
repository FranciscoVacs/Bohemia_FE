import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { Observable } from 'rxjs';
import { Purchase } from '../entities';

export class PurchaseData {  

  ticketType_id: number|undefined = 0; 
  ticket_quantity: number = 0; 
  user_id: number = 0;

  constructor(tType_id: number|undefined, quantity: number, user_id: number){
    this.ticketType_id= tType_id; 
    this.ticket_quantity = quantity; 
    this.user_id= user_id;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(private apiService: ApiService) { }

  getPurchaseById(id: number): Observable<Purchase> {
    return this.apiService.get<Purchase>(`/purchase` + `/${id}`)
  }

  postPurchase(purchaseData: PurchaseData): Observable<Purchase> {
    return this.apiService.post<Purchase>('/purchase', purchaseData)
  }
}
