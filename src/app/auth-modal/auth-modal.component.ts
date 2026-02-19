import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { LoginData, RegisterData } from '../models/auth';

@Component({
    selector: 'app-auth-modal',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './auth-modal.component.html'
})
export class AuthModalComponent {
  private fb = inject(FormBuilder);
  public modalService = inject(ModalService);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  private mouseDownOnBackdrop = false;

  // Solo cierra si mousedown Y mouseup ocurren en el backdrop
  onBackdropMouseDown(event: MouseEvent): void {
    // Verifica si el click empezó en el backdrop (no en el modal)
    this.mouseDownOnBackdrop = event.target === event.currentTarget;
  }

  onBackdropMouseUp(event: MouseEvent): void {
    // Solo cierra si el mousedown también fue en el backdrop
    if (this.mouseDownOnBackdrop && event.target === event.currentTarget) {
      this.closeModal();
    }
    this.mouseDownOnBackdrop = false;
  }

  onModalMouseUp(event: MouseEvent): void {
    // Resetear el estado para evitar que quede "armado" para el siguiente click
    this.mouseDownOnBackdrop = false;
    event.stopPropagation();
  }

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      userSurname: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      birthDate: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginData = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Verifica tu email y contraseña.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    // Transform date to 'YYYY-MM-DD HH:MM:SS'
    // formValue.birthDate comes as 'YYYY-MM-DD' from the input date
    const formattedDate = `${formValue.birthDate} 00:00:00`;

    const data: RegisterData = {
      ...formValue,
      birthDate: formattedDate
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          // Conflict: User already exists
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
          this.errorMessage = 'El correo electrónico ya está registrado.';
        } else {
          this.errorMessage = error.error?.message || 'Error al registrarse. Intenta nuevamente.';
        }
      }
    });
  }

  closeModal(): void {
    this.modalService.close();
    this.errorMessage = '';
    this.showPassword = false;
    this.loginForm.reset();
    this.registerForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

