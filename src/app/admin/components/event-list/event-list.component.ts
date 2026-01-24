import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminEvent } from '../../../models/event';
import { AdminEventService } from '../../services/admin-event.service';

type SortColumn = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

@Component({
    selector: 'app-event-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './event-list.component.html',
})
export class EventListComponent implements OnInit {
    private eventService = inject(AdminEventService);
    private router = inject(Router);

    // Estados
    events = signal<AdminEvent[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    // Filtros
    searchQuery = signal('');
    selectedCity = signal('');
    selectedLocation = signal('');
    selectedMonth = signal('');
    selectedYear = signal('');

    // Ordenamiento (por defecto: fecha descendente - más nuevo primero)
    sortColumn = signal<SortColumn>('date');
    sortDirection = signal<SortDirection>('desc');

    // Paginación
    currentPage = signal(1);
    itemsPerPage = 4;

    // UI State
    showExtraFilters = signal(false);

    // Ciudades únicas (computado desde los eventos cargados)
    cities = computed(() => {
        const citySet = new Set<string>();
        this.events().forEach(event => {
            if (event.location?.city?.cityName) {
                citySet.add(event.location.city.cityName);
            }
        });
        return Array.from(citySet).sort();
    });

    // Ubicaciones únicas (computado desde los eventos cargados)
    uniqueLocations = computed(() => {
        const locationSet = new Set<string>();
        this.events().forEach(event => {
            if (event.location?.locationName) {
                locationSet.add(event.location.locationName);
            }
        });
        return Array.from(locationSet).sort();
    });

    // Eventos filtrados y ordenados
    filteredEvents = computed(() => {
        let filtered = this.events();

        // Filtro por búsqueda
        const query = this.searchQuery().toLowerCase();
        if (query) {
            filtered = filtered.filter(e =>
                e.eventName.toLowerCase().includes(query)
            );
        }

        // Filtro por ciudad
        const city = this.selectedCity();
        if (city) {
            filtered = filtered.filter(e =>
                e.location.city.cityName === city
            );
        }

        // Filtro por ubicación
        const location = this.selectedLocation();
        if (location) {
            filtered = filtered.filter(e =>
                e.location.locationName === location
            );
        }

        // Filtro por mes
        const month = this.selectedMonth();
        if (month) {
            filtered = filtered.filter(e => {
                const eventMonth = new Date(e.beginDatetime).getMonth() + 1;
                return eventMonth === parseInt(month);
            });
        }

        // Filtro por año
        const year = this.selectedYear();
        if (year) {
            filtered = filtered.filter(e => {
                const eventYear = new Date(e.beginDatetime).getFullYear();
                return eventYear === parseInt(year);
            });
        }

        // Ordenamiento
        const column = this.sortColumn();
        const direction = this.sortDirection();
        const multiplier = direction === 'asc' ? 1 : -1;

        filtered = [...filtered].sort((a, b) => {
            switch (column) {
                case 'date':
                    return (new Date(a.beginDatetime).getTime() - new Date(b.beginDatetime).getTime()) * multiplier;
                case 'name':
                    return a.eventName.localeCompare(b.eventName) * multiplier;
                default:
                    return 0;
            }
        });

        return filtered;
    });

    // Eventos paginados
    paginatedEvents = computed(() => {
        const start = (this.currentPage() - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredEvents().slice(start, end);
    });

    // Total de páginas
    totalPages = computed(() => {
        return Math.ceil(this.filteredEvents().length / this.itemsPerPage);
    });

    // Años disponibles
    availableYears = computed(() => {
        const years = new Set<number>();
        this.events().forEach(e => {
            years.add(new Date(e.beginDatetime).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    });

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading.set(true);
        this.error.set(null);

        // Cargar eventos
        this.eventService.getAllEvents().subscribe({
            next: (events) => {
                this.events.set(events);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading events:', err);
                this.error.set('Error al cargar los eventos');
                this.loading.set(false);
            }
        });
    }

    // Toggle filtros adicionales
    toggleFilters() {
        this.showExtraFilters.update(v => !v);
    }

    // Ordenar por columna
    sortByColumn(column: SortColumn) {
        if (this.sortColumn() === column) {
            // Si ya está ordenado por esta columna, cambiar dirección
            this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            // Nueva columna, empezar con descendente
            this.sortColumn.set(column);
            this.sortDirection.set('desc');
        }
        this.currentPage.set(1);
    }

    // Obtener ícono de ordenamiento
    getSortIcon(column: SortColumn): string {
        if (this.sortColumn() !== column) {
            return '⇅'; // No ordenado por esta columna
        }
        return this.sortDirection() === 'asc' ? '▲' : '▼';
    }

    // Verificar si columna está activa
    isColumnActive(column: SortColumn): boolean {
        return this.sortColumn() === column;
    }

    // Métodos de paginación
    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage() {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    // Formatear fecha
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Helpers para estado del evento
    isEventActive(event: AdminEvent): boolean {
        const now = new Date();
        const start = new Date(event.beginDatetime);
        const end = new Date(event.finishDatetime);
        return now >= start && now <= end;
    }

    isEventUpcoming(event: AdminEvent): boolean {
        const now = new Date();
        const start = new Date(event.beginDatetime);
        return now < start;
    }

    isEventPast(event: AdminEvent): boolean {
        const now = new Date();
        const end = new Date(event.finishDatetime);
        return now > end;
    }

    getEventStatus(event: AdminEvent): 'active' | 'upcoming' | 'past' {
        if (this.isEventActive(event)) return 'active';
        if (this.isEventUpcoming(event)) return 'upcoming';
        return 'past';
    }

    // Acciones
    editEvent(event: AdminEvent) {
        this.router.navigate(['/admin/eventos', event.id, 'editar']);
    }

    deleteEvent(event: AdminEvent) {
        if (confirm(`¿Estás seguro de eliminar "${event.eventName}"?`)) {
            this.eventService.deleteEvent(event.id).subscribe({
                next: () => {
                    this.loadData();
                },
                error: (err) => {
                    console.error('Error deleting event:', err);
                    alert('Error al eliminar el evento');
                }
            });
        }
    }

    viewStats(event: AdminEvent) {
        console.log('View stats:', event.id);
        // TODO: Navegar a la página de estadísticas
    }

    viewGallery(event: AdminEvent) {
        this.router.navigate(['/admin/eventos', event.id, 'galeria']);
    }
}
