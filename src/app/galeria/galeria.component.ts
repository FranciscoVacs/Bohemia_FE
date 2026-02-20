import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryService } from '../services/gallery.service';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { GalleryEvent, EventPhoto } from '../models/gallery';

@Component({
  selector: 'app-galeria',
  imports: [CommonModule],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estado
  events = signal<GalleryEvent[]>([]);
  photos = signal<EventPhoto[]>([]);
  selectedEvent = signal<GalleryEvent | null>(null);
  loading = signal(false);
  loadingPhotos = signal(false);
  error = signal<string | null>(null);

  // Lightbox
  lightboxOpen = signal(false);
  lightboxPhoto = signal<EventPhoto | null>(null);
  lightboxIndex = signal(0);

  // Computed
  isAuthenticated = this.authService.isAuthenticated;
  currentView = computed(() => this.selectedEvent() ? 'album' : 'events');

  ngOnInit(): void {
    this.loadEvents();

    // Si viene con eventId en la URL, cargar ese album
    this.route.params.subscribe(params => {
      if (params['eventId']) {
        const eventId = +params['eventId'];
        this.loadAlbum(eventId);
      }
    });
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.galleryService.getEventsWithGalleries().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las galerías.');
        this.loading.set(false);
        console.error('Error loading galleries:', err);
      }
    });
  }

  openAlbum(event: GalleryEvent): void {
    if (!this.isAuthenticated()) {
      this.modalService.openLogin();
      return;
    }

    this.router.navigate(['/galeria', event.id]);
  }

  private loadAlbum(eventId: number): void {
    if (!this.isAuthenticated()) {
      this.modalService.openLogin();
      return;
    }

    // Buscar el evento en la lista ya cargada o esperar a que cargue
    const existingEvent = this.events().find(e => e.id === eventId);
    if (existingEvent) {
      this.selectedEvent.set(existingEvent);
    }

    this.loadingPhotos.set(true);
    this.error.set(null);

    this.galleryService.getEventPhotos(eventId).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.loadingPhotos.set(false);

        // Si no teníamos el evento, intentar setear info mínima
        if (!this.selectedEvent() && this.events().length > 0) {
          const ev = this.events().find(e => e.id === eventId);
          if (ev) this.selectedEvent.set(ev);
        }
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las fotos de este evento.');
        this.loadingPhotos.set(false);
        console.error('Error loading photos:', err);
      }
    });
  }

  goBack(): void {
    this.selectedEvent.set(null);
    this.photos.set([]);
    this.error.set(null);
    this.router.navigate(['/galeria']);
  }

  // Lightbox
  openLightbox(photo: EventPhoto, index: number): void {
    this.lightboxPhoto.set(photo);
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    this.lightboxPhoto.set(null);
    document.body.style.overflow = '';
  }

  prevPhoto(): void {
    const allPhotos = this.photos();
    let newIndex = this.lightboxIndex() - 1;
    if (newIndex < 0) newIndex = allPhotos.length - 1;
    this.lightboxIndex.set(newIndex);
    this.lightboxPhoto.set(allPhotos[newIndex]);
  }

  nextPhoto(): void {
    const allPhotos = this.photos();
    let newIndex = this.lightboxIndex() + 1;
    if (newIndex >= allPhotos.length) newIndex = 0;
    this.lightboxIndex.set(newIndex);
    this.lightboxPhoto.set(allPhotos[newIndex]);
  }

  downloadPhoto(photo: EventPhoto): void {
    // Usar fetch para descargar como blob y forzar la descarga
    fetch(photo.cloudinaryUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = photo.originalName || 'bohemia-photo.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback: abrir en nueva pestaña
        window.open(photo.cloudinaryUrl, '_blank');
      });
  }

  onLightboxKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowLeft') this.prevPhoto();
    if (event.key === 'ArrowRight') this.nextPhoto();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
