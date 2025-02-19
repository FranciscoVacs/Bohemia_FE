import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { TicketType } from '../entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketTypeService {

  constructor(private apiService: ApiService) { }

  postTicketType(ticketType: TicketType, id: number): Observable<TicketType> {
    return this.apiService.post(`/event` + `/${id}` + `/ticketType` , ticketType);
  }
}
