import { environment } from '../../environments/environment.development.js';
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

  createPreference(id: number): Observable<{init_point: string}> {
    return this.http.post<{init_point: string}>(`${this.apiUrl}/purchase/create_preference`, {id});
  }    
    
    }
    
