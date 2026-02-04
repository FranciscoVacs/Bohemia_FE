import { environment } from '../../environments/environment.development.js';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../models/purchase.js';
import { ApiResponse } from '../models/api-response.js';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  
}