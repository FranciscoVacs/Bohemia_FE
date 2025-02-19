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
    return this.apiService.get(`/event`)
  }

  getEventById(id: number): Observable<Event> {
    return this.apiService.get(`/event` + `/${id}`)
  }

  postEvent(event: Event): Observable<Event> {
    return this.apiService.post(`/event`, event)
  }

  updateEvent(event: Event, id: number) {
    return this.apiService.patch(`/event` + `/${id}`, event);
  }

  deleteEvent(id:number){
    return this.apiService.delete(`/event` + `/${id}`)
  }


}
