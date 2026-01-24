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
