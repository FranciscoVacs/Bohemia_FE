import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { GalleryEvent, EventPhoto } from '../models/gallery';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GalleryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/event-photos`;

    /**
     * Obtener todos los eventos con galerías publicadas (público, sin auth)
     */
    getEventsWithGalleries(): Observable<GalleryEvent[]> {
        return this.http.get<ApiResponse<GalleryEvent[]>>(`${this.apiUrl}/galleries`).pipe(
            map(response => response.data || [])
        );
    }

    /**
     * Obtener fotos de un evento específico (requiere autenticación)
     */
    getEventPhotos(eventId: number): Observable<EventPhoto[]> {
        return this.http.get<ApiResponse<EventPhoto[]>>(`${this.apiUrl}/gallery/${eventId}`).pipe(
            map(response => response.data || [])
        );
    }
}
