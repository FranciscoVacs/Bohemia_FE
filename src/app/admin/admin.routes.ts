import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const adminRoutes: Routes = [
    {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/event-management/event-management.component')
            .then(m => m.EventManagementComponent),
    },
    {
        path: 'eventos/crear',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/event-form/event-form.component')
            .then(m => m.EventFormComponent),
    },
    {
        path: 'eventos/:id/editar',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/event-form/event-form.component')
            .then(m => m.EventFormComponent),
    },
    {
        path: 'eventos/:id/tickets',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/ticket-config/ticket-config.component')
            .then(m => m.TicketConfigComponent),
    },
    {
        path: 'eventos/:id/galeria',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/gallery-manager/gallery-manager.component')
            .then(m => m.GalleryManagerComponent),
    },
    {
        path: 'eventos/:id/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/event-stats/event-stats.component')
            .then(m => m.EventStatsComponent),
    },
];

