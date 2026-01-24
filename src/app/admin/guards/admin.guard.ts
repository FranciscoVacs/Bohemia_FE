import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que protege las rutas de administración.
 * Solo permite el acceso si el usuario está autenticado Y es admin.
 */
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar si el usuario está autenticado y es admin
    if (authService.isAuthenticated() && authService.isAdmin()) {
        return true;
    }

    // Si no es admin, redirigir al home
    router.navigate(['/']);
    return false;
};
