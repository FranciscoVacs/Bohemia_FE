import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Event } from '../models/event';
import { ApiResponse } from '../models/api-response';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getFutureEvents(): Observable<Event> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/event/future`)
      .pipe(map(response => response.data));
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/event/${id}`)
      .pipe(map(response => response.data));
  }

  getTicketTypes(eventId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/event/${eventId}/ticketTypes`)
      .pipe(map(response => response.data));
  }
}
