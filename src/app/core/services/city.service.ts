import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { City } from '../entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private apiService: ApiService) { }

  postCity(city: City): Observable<City> {
    return this.apiService.post<City>(`/city`, city)
  }  

  getCities(): Observable<[City]>{
    return this.apiService.get<[City]>(`/city`)
  }

  getCityById(id:number): Observable<City>{
    return this.apiService.get<City>(`/city` + `/${id}`)
  }

  updateCityById(city:City, id: number){
    return this.apiService.patch(`/city` + `/${id}`, city)
  }

  deleteCity(id:number){
    return this.apiService.delete(`/city` + `/${id}`)
  }
}
