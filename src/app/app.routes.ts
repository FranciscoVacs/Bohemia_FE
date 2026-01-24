import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GaleriaComponent } from './galeria/galeria.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'galeria', component: GaleriaComponent },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    },
];
