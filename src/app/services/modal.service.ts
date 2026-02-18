import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    //estado interno
    private _isOpen = signal<boolean>(false);
    private _currentView = signal<'LOGIN' | 'REGISTER'>('LOGIN');

    //estado externo
    public readonly isOpen = this._isOpen.asReadonly();
    public readonly currentView = this._currentView.asReadonly();

    //metodos
    openLogin(): void {
        this._currentView.set('LOGIN');
        this._isOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    openRegister(): void {
        this._currentView.set('REGISTER');
        this._isOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    close(): void {
        this._isOpen.set(false);
        document.body.style.overflow = '';
    }

    switchView(): void {
        const newView = this._currentView() === 'LOGIN' ? 'REGISTER' : 'LOGIN';
        this._currentView.set(newView);
    }
}
