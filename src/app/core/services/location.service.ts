import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { Observable } from 'rxjs';
import { Location } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private apiService: ApiService) { }

  getLocations(): Observable<Location[]> {
    return this.apiService.get<[Location]>(`/location`)
  }

  getLocationById(id: number): Observable<Location> {
    return this.apiService.get<Location>(`/location` + `/${id}`)
  }

}
