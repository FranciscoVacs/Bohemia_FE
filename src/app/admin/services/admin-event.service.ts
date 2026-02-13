import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminEvent } from '../../models/event';
import { ApiResponse } from '../../models/api-response';
import { EventStats } from '../../models/event-stats';

@Injectable({
    providedIn: 'root'
})
export class AdminEventService {
    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    /**
     * Obtiene todos los eventos (solo admin)
     */
    getAllEvents(): Observable<AdminEvent[]> {
        return this.http.get<ApiResponse<AdminEvent[]>>(`${this.apiUrl}/event/admin`)
            .pipe(map(response => response.data));
    }

    /**
     * Obtiene un evento por ID (usa endpoint admin para obtener eventos no publicados también)
     */
    getEventById(id: number): Observable<AdminEvent> {
        return this.http.get<ApiResponse<AdminEvent>>(`${this.apiUrl}/event/admin/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Crea un nuevo evento
     */
    createEvent(formData: FormData): Observable<ApiResponse<AdminEvent>> {
        return this.http.post<ApiResponse<AdminEvent>>(`${this.apiUrl}/event/crear`, formData);
    }

    /**
     * Actualiza un evento existente
     */
    updateEvent(id: number, formData: FormData): Observable<ApiResponse<AdminEvent>> {
        return this.http.patch<ApiResponse<AdminEvent>>(`${this.apiUrl}/event/${id}`, formData);
    }

    /**
     * Elimina un evento
     */
    deleteEvent(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/event/${id}`);
    }

    /**
     * Actualiza el estado de la galería de un evento
     */
    updateGalleryStatus(id: number, isPublished: boolean): Observable<ApiResponse<{ id: number; isGalleryPublished: boolean }>> {
        return this.http.patch<ApiResponse<{ id: number; isGalleryPublished: boolean }>>(`${this.apiUrl}/event/${id}/gallery-status`, { isGalleryPublished: isPublished });
    }

/**
     * Publica un evento (cambia isPublished a true)
     */
    publishEvent(id: number): Observable<ApiResponse<AdminEvent>> {
        return this.http.patch<ApiResponse<AdminEvent>>(`${this.apiUrl}/event/${id}/publish`, {});
    }

    /**
     * Obtiene estadísticas completas de un evento
     */
    getEventStats(eventId: number, limit: number = 10): Observable<EventStats> {
        return this.http.get<ApiResponse<EventStats>>(`${this.apiUrl}/event/${eventId}/stats?limit=${limit}`)
            .pipe(map(response => response.data));
    }
}
