import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminEvent } from '../../../models/event';
import { GalleryService, GalleryImage } from '../../services/gallery.service';
import { AdminEventService } from '../../services/admin-event.service';

@Component({
    selector: 'app-gallery-manager',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gallery-manager.component.html'
})
export class GalleryManagerComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private galleryService = inject(GalleryService);
    private eventService = inject(AdminEventService);

    // State
    eventId = signal<number | null>(null);
    eventName = signal<string>('');
    isGalleryPublished = signal<boolean>(false);
    images = signal<GalleryImage[]>([]);
    selectedImages = signal<Set<number>>(new Set());
    loading = signal(true);
    uploading = signal(false);
    uploadProgress = signal(0);  // 0-100 percentage
    updatingStatus = signal(false);
    error = signal<string | null>(null);
    isDragOver = signal(false);

    // Computed
    hasSelection = computed(() => this.selectedImages().size > 0);
    selectionCount = computed(() => this.selectedImages().size);
    allSelected = computed(() =>
        this.images().length > 0 && this.selectedImages().size === this.images().length
    );
    isPublished = computed(() => this.isGalleryPublished());
    canPublish = computed(() => this.images().length > 0);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.eventId.set(+id);
            this.loadEventData(+id);
            this.loadGallery(+id);
        }
    }

    private loadEventData(eventId: number) {
        this.eventService.getEventById(eventId).subscribe({
            next: (event: AdminEvent) => {
                this.eventName.set(event.eventName);
                // Load gallery status from event
                this.isGalleryPublished.set(event.isGalleryPublished);
            },
            error: (err: any) => {
                console.error('Error loading event:', err);
                this.error.set('Error al cargar el evento');
            }
        });
    }

    private loadGallery(eventId: number) {
        this.loading.set(true);
        this.error.set(null);

        this.galleryService.getByEventIdAdmin(eventId).subscribe({
            next: (images: GalleryImage[]) => {
                this.images.set(images);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading gallery:', err);
                // Es normal que esté vacía si no hay fotos
                this.images.set([]);
                this.loading.set(false);
            }
        });
    }

    // Gallery status toggle
    toggleGalleryStatus() {
        const eventId = this.eventId();
        if (!eventId || this.updatingStatus()) return;

        // No permitir publicar sin fotos
        if (!this.isGalleryPublished() && !this.canPublish()) {
            this.error.set('No se puede publicar una galería sin fotos. Subí al menos una imagen.');
            return;
        }

        const newStatus = !this.isGalleryPublished();
        this.updatingStatus.set(true);

        this.eventService.updateGalleryStatus(eventId, newStatus).subscribe({
            next: (result) => {
                this.isGalleryPublished.set(result.data.isGalleryPublished);
                this.updatingStatus.set(false);
            },
            error: (err: any) => {
                console.error('Error updating gallery status:', err);
                this.error.set('Error al actualizar el estado de la galería');
                this.updatingStatus.set(false);
            }
        });
    }

    // Drag & Drop handlers
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFiles(Array.from(files));
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFiles(Array.from(input.files));
        }
    }

    private handleFiles(files: File[]) {
        // Filter only images
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            this.error.set('Solo se permiten archivos de imagen');
            return;
        }

        // Check file size (max 15MB per file as per backend middleware)
        const maxSize = 15 * 1024 * 1024;
        const oversizedFiles = imageFiles.filter(f => f.size > maxSize);
        if (oversizedFiles.length > 0) {
            this.error.set(`Algunos archivos superan el límite de 15MB`);
            return;
        }

        // Upload
        this.uploadImages(imageFiles);
    }

    private uploadImages(files: File[]) {
        const eventId = this.eventId();
        if (!eventId) return;

        this.uploading.set(true);
        this.uploadProgress.set(0);
        this.error.set(null);

        // Configuración de lotes
        const BATCH_SIZE = 5;
        const totalFiles = files.length;
        let uploadedCount = 0;

        const uploadBatch = (startIndex: number) => {
            if (startIndex >= totalFiles) {
                this.uploading.set(false);
                this.uploadProgress.set(0);
                return;
            }

            const batch = files.slice(startIndex, startIndex + BATCH_SIZE);

            this.galleryService.uploadImages(eventId, batch).subscribe({
                next: (event) => {
                    if (event.status === 'progress') {
                        // Calcular progreso global
                        // Progreso base = (archivos anteriores / total) * 100
                        // Progreso actual = (progreso del lote / total) * (tamaño del lote / total) ... simplificado:

                        const batchWeight = batch.length / totalFiles;
                        const previousWeight = uploadedCount / totalFiles;
                        const currentBatchProgress = (event.progress / 100) * batchWeight;

                        const totalProgress = Math.round((previousWeight + currentBatchProgress) * 100);
                        this.uploadProgress.set(totalProgress);

                    } else if (event.status === 'complete' && event.data) {
                        this.images.update(current => [...current, ...event.data!]);
                        uploadedCount += batch.length;

                        // Procesar siguiente lote
                        uploadBatch(startIndex + BATCH_SIZE);
                    }
                },
                error: (err: any) => {
                    console.error('Error uploading batch:', err);
                    // Continuar con siguientes lotes o detener? Por ahora mostramos error pero intentamos continuar si es posible, o paramos.
                    // Mejor parar y mostrar lo que falló.
                    this.error.set(`Error al subir lote de imágenes: ${err.error?.message || 'Error desconocido'}`);
                    this.uploading.set(false);
                    this.uploadProgress.set(0);
                }
            });
        };

        // Iniciar primer lote
        uploadBatch(0);
    }

    // Selection
    toggleSelection(imageId: number) {
        this.selectedImages.update(current => {
            const newSet = new Set(current);
            if (newSet.has(imageId)) {
                newSet.delete(imageId);
            } else {
                newSet.add(imageId);
            }
            return newSet;
        });
    }

    isSelected(imageId: number): boolean {
        return this.selectedImages().has(imageId);
    }

    selectAll() {
        if (this.allSelected()) {
            this.selectedImages.set(new Set());
        } else {
            this.selectedImages.set(new Set(this.images().map(img => img.id)));
        }
    }

    // Delete
    deleteSelected() {
        const selected = Array.from(this.selectedImages());
        if (selected.length === 0) return;

        if (!confirm(`¿Eliminar ${selected.length} imagen(es)?`)) return;

        // Delete each image
        selected.forEach(imageId => {
            this.galleryService.deleteImage(imageId).subscribe({
                next: () => {
                    this.images.update(current => current.filter(img => img.id !== imageId));
                    this.selectedImages.update(current => {
                        const newSet = new Set(current);
                        newSet.delete(imageId);
                        return newSet;
                    });
                },
                error: (err: any) => {
                    console.error('Error deleting image:', err);
                }
            });
        });
    }

    deleteSingleImage(imageId: number, event: Event) {
        event.stopPropagation();
        if (!confirm('¿Eliminar esta imagen?')) return;

        this.galleryService.deleteImage(imageId).subscribe({
            next: () => {
                this.images.update(current => current.filter(img => img.id !== imageId));
            },
            error: (err: any) => {
                console.error('Error deleting image:', err);
                this.error.set('Error al eliminar la imagen');
            }
        });
    }

    goBack() {
        this.router.navigate(['/admin']);
    }
}
