import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GaleriaComponent } from './galeria/galeria.component';
import { CompraComponent } from './compra/compra.component';
import { PurchaseFailComponent } from './compra/purchase-fail/purchase-fail.component.js';
import { PurchaseRedirectComponent } from './compra/purchase-redirect/purchase-redirect.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'galeria', component: GaleriaComponent },
    { path: 'galeria/:eventId', component: GaleriaComponent },
    { path: 'compra', component: CompraComponent },
    { path: 'redirect', component: PurchaseRedirectComponent },
    { path: 'failed', component: PurchaseFailComponent },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent),
        canActivate: [authGuard]
    },
    {
        path: 'mis-entradas',
        loadComponent: () => import('./mis-entradas/mis-entradas.component').then(m => m.MisEntradasComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    },
];
