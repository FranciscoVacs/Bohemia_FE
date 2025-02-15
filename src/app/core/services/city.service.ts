import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs/operators';
import { City } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private apiService: ApiService) { }

  postCity(city: City) {
    return this.apiService.post(`/city`, city)
    .pipe(map((response: any) => response.data))
  }  

  getCities() {
    return this.apiService.get(`/city`)
    .pipe(map((response: any) => response.data))
  }

  getCityById(id:number) {
    return this.apiService.get(`/city` + `/${id}`)
    .pipe(map((response: any) => response.data))
  }

  updateCityById(city:City, id: number) {
    return this.apiService.patch(`/city` + `/${id}`, city)
  }

  deleteCity(id:number){
    return this.apiService.delete(`/city` + `/${id}`)
  }
}
