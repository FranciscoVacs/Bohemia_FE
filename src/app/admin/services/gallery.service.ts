import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GalleryImage {
    id: number;
    cloudinaryUrl: string;
    publicId: string;
    originalName: string;
    createdAt?: string;
}

export interface UploadProgress {
    status: 'progress' | 'complete';
    progress: number;
    data?: GalleryImage[];
}

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
    private photoApiUrl = `${environment.apiUrl}/event-photos`;  // plural: event-photos
    private eventApiUrl = `${environment.apiUrl}/event`;

    /**
     * Get all images for an event (admin access - bypasses gallery status)
     */
    getByEventIdAdmin(eventId: number): Observable<GalleryImage[]> {
        // Para admin, usamos el endpoint que obtiene todas las fotos sin importar el status
        return this.http.get<ApiResponse<GalleryImage[]>>(`${this.photoApiUrl}/gallery/admin/${eventId}`).pipe(
            map(response => response.data || [])
        );
    }

    /**
     * Upload multiple images to an event gallery with progress tracking
     * Backend expects field name 'photos' (not 'images')
     */
    uploadImages(eventId: number, files: File[]): Observable<UploadProgress> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('photos', file);
        });

        return this.http.post<ApiResponse<GalleryImage[]>>(
            `${this.photoApiUrl}/upload/${eventId}`,
            formData,
            {
                reportProgress: true,
                observe: 'events'
            }
        ).pipe(
            map((event: HttpEvent<ApiResponse<GalleryImage[]>>): UploadProgress | null => {
                if (event.type === HttpEventType.UploadProgress) {
                    const progress = event.total
                        ? Math.round((100 * event.loaded) / event.total)
                        : 0;
                    return { status: 'progress', progress };
                } else if (event.type === HttpEventType.Response) {
                    return {
                        status: 'complete',
                        progress: 100,
                        data: event.body?.data
                    };
                }
                return null;
            }),
            filter((result): result is UploadProgress => result !== null)
        );
    }

    /**
     * Delete a single image
     */
    deleteImage(imageId: number): Observable<void> {
        return this.http.delete<void>(`${this.photoApiUrl}/${imageId}`);
    }

    /**
     * Delete all images for an event
     */
    deleteAllByEventId(eventId: number): Observable<void> {
        return this.http.delete<void>(`${this.photoApiUrl}/event/${eventId}`);
    }

    /**
     * Update gallery published status
     */
    updateGalleryStatus(eventId: number, isPublished: boolean): Observable<{ id: number; isGalleryPublished: boolean }> {
        return this.http.patch<ApiResponse<{ id: number; isGalleryPublished: boolean }>>(
            `${this.eventApiUrl}/${eventId}/gallery-status`,
            { isGalleryPublished: isPublished }
        ).pipe(
            map(response => response.data)
        );
    }
}
