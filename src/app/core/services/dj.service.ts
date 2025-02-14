import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DjService {

  constructor(private apiService: ApiService) { }

  postDJ(event: any) {
    return this.apiService.post(`/dj`, event)
    .pipe(map((response: any) => response.data))
  }  

  getDJs() {
    return this.apiService.get(`/dj`)
    .pipe(map((response: any) => response.data))
  }

  getDJById(id:any) {
    return this.apiService.get(`/dj` + `/${id}`)
    .pipe(map((response: any) => response.data))
  }

  updateDJById(dj:any, id: any) {
    return this.apiService.patch(`/dj` + `/${id}`, dj)
  }

  deleteDJ(id:any){
    return this.apiService.delete(`/dj` + `/${id}`)
  }

}
