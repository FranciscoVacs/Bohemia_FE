import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';

@Injectable({
  providedIn: 'root'
})
export class TicketTypeService {

  constructor(private apiService: ApiService) { }

  postTicketType(ticketType: any, id: number) {
    return this.apiService.post(`/event` + `/${id}` + `/ticketType` , ticketType);
  }
}
