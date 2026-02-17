import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Purchase } from '../models/purchase.js';
import { ApiResponse } from '../models/api-response.js';
import { Observable } from 'rxjs';
import { CreatePurchaseDTO } from '../dto/purchase.dto.js';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  createPurchase(createPurchase: CreatePurchaseDTO): Observable<ApiResponse<Purchase>> {
    return this.http.post<ApiResponse<Purchase>>(`${this.apiUrl}/purchase`, createPurchase);
  }


  getPurchaseById(id: number): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(`${this.apiUrl}/purchase/${id}`);
  }

  createPreference(id: number): Observable<{ init_point: string }> {
    return this.http.post<{ init_point: string }>(`${this.apiUrl}/purchase/create_preference`, { id });
  }

  verifyPayment(paymentId: number): Observable<{ success: boolean, purchaseId: number }> {
    return this.http.get<{ success: boolean, purchaseId: number }>(`${this.apiUrl}/purchase/verify/${paymentId}`);
  }

  getUserPurchases(): Observable<{ message: string; data: Purchase[] }> {
    return this.http.get<{ message: string; data: Purchase[] }>(`${this.apiUrl}/user/me/purchases`);
  }

  downloadTicketPdf(purchaseId: number, ticketId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/purchase/${purchaseId}/ticket/${ticketId}`, {
      responseType: 'blob'
    });
  }

}

