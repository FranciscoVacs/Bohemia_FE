import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GaleriaComponent } from './galeria/galeria.component';
import { CompraComponent } from './compra/compra.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'galeria', component: GaleriaComponent },
    { path: 'compra', component: CompraComponent },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    },
];
