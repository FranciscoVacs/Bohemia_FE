import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { Observable } from 'rxjs';
import { Event } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService) { }

  getEvents(): Observable<[Event]> {
    return this.apiService.get<[Event]>(`/event`)
  }

  getEventById(id: number): Observable<Event> {
    return this.apiService.get<Event>(`/event` + `/${id}`)
  }

  postEvent(event: FormData): Observable<Event> {
    return this.apiService.post<Event>(`/event`, event)
  }

  updateEvent(event: FormData, id: number) {
    return this.apiService.patch(`/event` + `/${id}`, event);
  }

  deleteEvent(id:number){
    return this.apiService.delete(`/event` + `/${id}`)
  }


}
