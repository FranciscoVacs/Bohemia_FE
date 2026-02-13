import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Dj {
    id: number;
    djName: string;
    djSurname: string;
    djApodo: string;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class DjService {
    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    /**
     * Obtiene todos los DJs (requiere admin)
     */
    getAll(): Observable<Dj[]> {
        return this.http.get<ApiResponse<Dj[]>>(`${this.apiUrl}/dj`)
            .pipe(map(response => response.data));
    }

    /**
     * Obtiene un DJ por ID (requiere admin)
     */
    getById(id: number): Observable<Dj> {
        return this.http.get<ApiResponse<Dj>>(`${this.apiUrl}/dj/${id}`)
            .pipe(map(response => response.data));
    }
}
