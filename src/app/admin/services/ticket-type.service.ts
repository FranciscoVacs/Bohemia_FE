import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminTicketType, AdminCreateTicketType } from '../../models/ticket-type';
import { ApiResponse } from '../../models/api-response';

@Injectable({
    providedIn: 'root'
})
export class TicketTypeService {
    private readonly apiUrl = environment.apiUrl;
    private http = inject(HttpClient);

    /**
     * Obtiene los tipos de ticket de un evento
     */
    getTicketTypes(eventId: number): Observable<AdminTicketType[]> {
        return this.http.get<ApiResponse<AdminTicketType[]>>(`${this.apiUrl}/event/${eventId}/ticketType`)
            .pipe(map(response => response.data));
    }

    /**
     * Crea un tipo de ticket para un evento
     */
    createTicketType(eventId: number, data: AdminCreateTicketType): Observable<ApiResponse<AdminTicketType>> {
        return this.http.post<ApiResponse<AdminTicketType>>(`${this.apiUrl}/event/${eventId}/ticketType`, data);
    }

    /**
     * Actualiza un tipo de ticket
     */
    updateTicketType(eventId: number, ticketTypeId: number, data: Partial<AdminCreateTicketType>): Observable<ApiResponse<AdminTicketType>> {
        return this.http.patch<ApiResponse<AdminTicketType>>(`${this.apiUrl}/event/${eventId}/ticketType/${ticketTypeId}`, data);
    }

    /**
     * Cierra un tipo de ticket activo (transfiere tickets restantes al siguiente en cola)
     */
    closeTicketType(eventId: number, ticketTypeId: number): Observable<ApiResponse<AdminTicketType>> {
        return this.http.patch<ApiResponse<AdminTicketType>>(`${this.apiUrl}/event/${eventId}/ticketType/${ticketTypeId}/close`, {});
    }

    /**
     * Elimina un tipo de ticket
     */
    deleteTicketType(eventId: number, ticketTypeId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/event/${eventId}/ticketType/${ticketTypeId}`);
    }
}
