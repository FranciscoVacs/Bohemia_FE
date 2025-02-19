import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map, Observable } from 'rxjs';
import { Dj } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class DjService {

  constructor(private apiService: ApiService) { }

  postDJ(dj: Dj): Observable<Dj> {
    return this.apiService.post(`/dj`, dj)
  }  

  getDJs(): Observable<[Dj]> {
    return this.apiService.get(`/dj`)
  }

  getDJById(id:number): Observable<Dj> {
    return this.apiService.get(`/dj` + `/${id}`)
  }

  updateDJById(dj:Dj, id: number) {
    return this.apiService.patch(`/dj` + `/${id}`, dj)
  }

  deleteDJ(id:number){
    return this.apiService.delete(`/dj` + `/${id}`)
  }

}
