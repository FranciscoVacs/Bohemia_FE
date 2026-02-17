import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

/**
 * Guard que protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, redirige al home y abre el modal de login.
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const modalService = inject(ModalService);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/']);
    modalService.openLogin();
    return false;
};
