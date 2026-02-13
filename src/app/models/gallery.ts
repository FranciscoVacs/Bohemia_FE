// Interfaces para galería de fotos de eventos

export interface GalleryStatusUpdate {
    isGalleryPublished: boolean;
}

export interface EventPhoto {
    id: number;
    cloudinaryUrl: string;
    publicId: string;
    originalName: string;
    event: number;
}

// Interface para el listado público de eventos con galería publicada
export interface GalleryEvent {
    id: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    coverPhoto: string;
    location: {
        locationName: string;
        address: string;
        city: {
            cityName: string;
        };
    };
    dj: {
        djApodo: string;
    };
}
