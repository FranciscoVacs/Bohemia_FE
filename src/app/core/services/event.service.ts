import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { Observable } from 'rxjs';
import { Event } from '../entities';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService, private httpClient: HttpClient) { }

  getEvents(): Observable<[Event]> {
    return this.apiService.get<[Event]>(`/event`)
  }

  getEventById(id: number): Observable<Event> {
    return this.apiService.get<Event>(`/event` + `/${id}`)
  }

  postEvent(eventFormData: FormData): Observable<Event> {
    return this.httpClient.post<{data: Event}>(`http://localhost:3000/api` + `/event`, eventFormData).pipe(map(response => response.data))
  }

  updateEvent(event: FormData, id: number) {
    return this.apiService.patch(`/event` + `/${id}`, event);
  }

  deleteEvent(id:number){
    return this.apiService.delete(`/event` + `/${id}`)
  }


}
