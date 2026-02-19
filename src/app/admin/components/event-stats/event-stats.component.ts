import { Component, inject, signal, computed, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, switchMap, startWith, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminEventService } from '../../services/admin-event.service';
import { EventStats, EventStatsState } from '../../../models/event-stats';

@Component({
    selector: 'app-event-stats',
    imports: [CommonModule, RouterModule],
    templateUrl: './event-stats.component.html',
    styleUrls: ['./event-stats.component.css']
})
export class EventStatsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(AdminEventService);
  private destroyRef = inject(DestroyRef);

  // Señales reactivas
  readonly state = signal<EventStatsState>({
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Computed properties para el template
  readonly stats = computed(() => this.state().stats);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly lastUpdated = computed(() => this.state().lastUpdated);

  // ID del evento desde la ruta
  private eventId!: number;

  ngOnInit() {
    // Obtener ID del evento desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.state.update(state => ({
        ...state,
        loading: false,
        error: 'ID de evento no proporcionado'
      }));
      return;
    }

    this.eventId = Number(id);
    if (isNaN(this.eventId)) {
      this.state.update(state => ({
        ...state,
        loading: false,
        error: 'ID de evento inválido'
      }));
      return;
    }

    // Iniciar polling cada 30 segundos para actualización en vivo
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchStats()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ngOnDestroy() {
    // La lógica de cleanup está manejada por takeUntilDestroyed
  }

  /**
   * Fetch stats returning an Observable for use with switchMap
   */
  private fetchStats() {
    // Solo mostrar loading spinner en la carga inicial (cuando no hay datos aún)
    this.state.update(state => ({
      ...state,
      loading: state.stats === null,
      error: null
    }));

    return this.eventService.getEventStats(this.eventId).pipe(
      tap({
        next: (stats) => {
          this.state.update(state => ({
            ...state,
            stats,
            loading: false,
            error: null,
            lastUpdated: new Date()
          }));
        },
        error: (err) => {
          console.error('Error loading event stats:', err);
          this.state.update(state => ({
            ...state,
            loading: false,
            error: 'Error al cargar estadísticas. Intente nuevamente.',
            lastUpdated: null
          }));
        }
      }),
      catchError(() => EMPTY)
    );
  }

  /**
   * Refresca manualmente las estadísticas
   */
  refreshStats() {
    this.fetchStats().subscribe();
  }

  /**
   * Formatea un número como moneda ARS
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  /**
   * Formatea una fecha relativa al momento actual
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `Hace ${seconds}s`;
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 2592000) return `Hace ${Math.floor(seconds / 86400)}d`;
    return `Hace ${Math.floor(seconds / 2592000)}m`;
  }

  /**
   * Formatea fecha completa
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Determina el color de la barra de progreso según porcentaje
   */
  getProgressBarColor(percentage: number): string {
    if (percentage >= 75) return 'bg-[#b7ff00]';
    if (percentage >= 40) return 'bg-white/30';
    return 'bg-white/15';
  }

  /**
   * Determina el badge de estado del evento
   */
  getEventStatusBadge(status: string): { text: string; classes: string } {
    switch (status) {
      case 'upcoming':
        return { text: 'Próximo', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'active':
        return { text: 'En Curso', classes: 'bg-green-500/10 text-green-500 border-green-500/20' };
      case 'past':
        return { text: 'Finalizado', classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
      default:
        return { text: status, classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  }

  /**
   * Determina el badge de estado de venta
   */
  getSaleStatusBadge(status: string): { text: string; classes: string } {
    switch (status) {
      case 'active':
        return { text: 'Activa', classes: 'bg-primary/10 text-primary border-primary/20' };
      case 'inactive':
        return { text: 'Inactiva', classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
      default:
        return { text: status, classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  }

  /**
   * Vuelve al listado de eventos
   */
  goBack() {
    this.router.navigate(['/admin']);
  }
}