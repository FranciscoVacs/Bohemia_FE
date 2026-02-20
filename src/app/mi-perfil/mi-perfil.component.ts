import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

import { mapZodErrorsToForm } from '../utils/form-error-mapper';

@Component({
    selector: 'app-mi-perfil',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './mi-perfil.component.html',
    styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    activeTab = signal<'detalles' | 'password'>('detalles');

    // User data
    currentUser = this.authService.currentUser;

    userInitials = computed(() => {
        const user = this.currentUser();
        if (!user) return '';
        const nameInitial = user.userName?.charAt(0).toUpperCase() || '';
        const surnameInitial = user.userSurname?.charAt(0).toUpperCase() || '';
        return `${nameInitial}${surnameInitial}`;
    });

    userFullName = computed(() => {
        const user = this.currentUser();
        if (!user) return '';
        return `${user.userName} ${user.userSurname}`;
    });

    // Forms
    profileForm!: FormGroup;
    passwordForm!: FormGroup;

    // State
    profileSaving = signal(false);
    profileSuccess = signal(false);
    profileError = signal<string | null>(null);

    passwordSaving = signal(false);
    passwordSuccess = signal(false);
    passwordError = signal<string | null>(null);

    // Password visibility toggles
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    ngOnInit(): void {
        const user = this.currentUser();

        this.profileForm = this.fb.group({
            userName: [user?.userName || '', [Validators.required, Validators.maxLength(100)]],
            userSurname: [user?.userSurname || '', [Validators.required, Validators.maxLength(100)]],
            email: [user?.email || '', [Validators.required, Validators.email]],
            birthDate: [this.formatDateForInput(user?.birthDate || ''), [Validators.required]],
        });

        this.passwordForm = this.fb.group({
            newPassword: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            ]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    setTab(tab: 'detalles' | 'password'): void {
        this.activeTab.set(tab);
        // Clear messages when switching tabs
        this.profileSuccess.set(false);
        this.profileError.set(null);
        this.passwordSuccess.set(false);
        this.passwordError.set(null);
    }

    saveProfile(): void {
        if (this.profileForm.invalid || this.profileSaving()) return;

        this.profileSaving.set(true);
        this.profileSuccess.set(false);
        this.profileError.set(null);

        const formValue = this.profileForm.value;
        // Convert date to backend format: "YYYY-MM-DD HH:MM:SS"
        const birthDate = formValue.birthDate
            ? `${formValue.birthDate} 00:00:00`
            : undefined;

        const data = {
            userName: formValue.userName,
            userSurname: formValue.userSurname,
            email: formValue.email,
            birthDate,
        };

        this.authService.updateProfile(data).subscribe({
            next: () => {
                this.profileSaving.set(false);
                this.profileSuccess.set(true);
                setTimeout(() => this.profileSuccess.set(false), 3000);
            },
            error: (err: any) => {
                this.profileSaving.set(false);
                if (mapZodErrorsToForm(err, this.profileForm)) {
                    this.profileError.set('Por favor, revisa los errores en el formulario.');
                } else {
                    this.profileError.set(err?.error?.message || 'Error al guardar los cambios');
                }
                setTimeout(() => this.profileError.set(null), 5000);
            }
        });
    }

    savePassword(): void {
        if (this.passwordForm.invalid || this.passwordSaving()) return;

        const { newPassword, confirmPassword } = this.passwordForm.value;

        if (newPassword !== confirmPassword) {
            this.passwordError.set('Las contraseñas no coinciden');
            setTimeout(() => this.passwordError.set(null), 5000);
            return;
        }

        this.passwordSaving.set(true);
        this.passwordSuccess.set(false);
        this.passwordError.set(null);

        this.authService.updateProfile({ password: newPassword }).subscribe({
            next: () => {
                this.passwordSaving.set(false);
                this.passwordSuccess.set(true);
                this.passwordForm.reset();
                setTimeout(() => this.passwordSuccess.set(false), 3000);
            },
            error: (err: any) => {
                this.passwordSaving.set(false);
                if (mapZodErrorsToForm(err, this.passwordForm)) {
                    this.passwordError.set('Por favor, revisa los errores en el formulario.');
                } else if (err?.error?.message === 'La contraseña actual es incorrecta') {
                    this.passwordError.set('La contraseña actual es incorrecta');
                } else {
                    this.passwordError.set(err?.error?.message || 'Error al actualizar la contraseña');
                }
                setTimeout(() => this.passwordError.set(null), 5000);
            }
        });
    }

    private formatDateForInput(dateStr: string): string {
        if (!dateStr) return '';
        // Handle "YYYY-MM-DD HH:MM:SS" or ISO formats
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD for <input type="date">
    }
}
