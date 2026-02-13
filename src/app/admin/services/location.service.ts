import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface City {
    id: number;
    cityName: string;
}

export interface Location {
    id: number;
    locationName: string;
    address: string;
    maxCapacity: number;
    city: City;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    /**
     * Obtiene todas las ubicaciones
     */
    getAll(): Observable<Location[]> {
        return this.http.get<ApiResponse<Location[]>>(`${this.apiUrl}/location`)
            .pipe(map(response => response.data));
    }

    /**
     * Obtiene una ubicación por ID
     */
    getById(id: number): Observable<Location> {
        return this.http.get<ApiResponse<Location>>(`${this.apiUrl}/location/${id}`)
            .pipe(map(response => response.data));
    }
}
