import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService) { }

  getEvents() {
    return this.apiService.get(`/event`)
    .pipe(map((response: any) => response.data))
  }

  getEventById(id: number) {
    return this.apiService.get(`/event` + `/${id}`)
    .pipe(map((response: any) => response.data))
  }
  postEvent(event: any) {
    return this.apiService.post(`/event`, event)
    .pipe(map((response: any) => response.data))

  }

  updateEvent(event: any, id: number) {
    return this.apiService.patch(`/event` + `/${id}`, event);
  }

  deleteEvent(id:number){
    return this.apiService.delete(`/event` + `/${id}`)
  }


}
