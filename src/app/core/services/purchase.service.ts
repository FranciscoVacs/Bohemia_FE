import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(private apiService: ApiService) { }

  getPurchaseById(id: number) {
    return this.apiService.get(`/purchase` + `/${id}`)
    .pipe(map((response:any) => response));;
  }

  postPurchase(purchase: any){
    return this.apiService.post('/purchase', purchase)
  }
}
