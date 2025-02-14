import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private apiService: ApiService) { }

  getLocations() {
    return this.apiService.get(`/location`)
    .pipe(map((response:any) => response.data));
  }

  getLocationById(id: number) {
    return this.apiService.get(`/location` + `/${id}`)
    .pipe(map((response:any) => response.data));;
  }

}
