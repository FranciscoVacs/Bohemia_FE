import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';
import { Dj } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class DjService {

  constructor(private apiService: ApiService) { }

  postDJ(dj: Dj) {
    return this.apiService.post(`/dj`, dj)
    .pipe(map((response: any) => response.data))
  }  

  getDJs() {
    return this.apiService.get(`/dj`)
    .pipe(map((response: any) => response.data))
  }

  getDJById(id:number) {
    return this.apiService.get(`/dj` + `/${id}`)
    .pipe(map((response: any) => response.data))
  }

  updateDJById(dj:Dj, id: number) {
    return this.apiService.patch(`/dj` + `/${id}`, dj)
  }

  deleteDJ(id:number){
    return this.apiService.delete(`/dj` + `/${id}`)
  }

}
