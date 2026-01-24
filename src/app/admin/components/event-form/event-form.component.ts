import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminEvent } from '../../../models/event';
import { AdminEventService } from '../../services/admin-event.service';
import { LocationService, Location } from '../../services/location.service';
import { DjService, Dj } from '../../services/dj.service';

@Component({
    selector: 'app-event-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './event-form.component.html',
})
export class EventFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private eventService = inject(AdminEventService);
    private locationService = inject(LocationService);
    private djService = inject(DjService);

    // Estado
    isEditMode = signal(false);
    eventId = signal<number | null>(null);
    loading = signal(false);
    submitting = signal(false);
    savingDraft = signal(false);
    error = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Datos del evento cargado
    currentEvent = signal<AdminEvent | null>(null);

    // Datos para selects
    locations = signal<Location[]>([]);
    djs = signal<Dj[]>([]);

    // Preview de imagen
    imagePreview = signal<string | null>(null);
    selectedFile = signal<File | null>(null);

    // Computed: fecha mínima = hoy
    minDate = computed(() => {
        const today = new Date();
        return today.toISOString().slice(0, 16);
    });

    // Formulario principal del evento
    eventForm: FormGroup = this.fb.group({
        eventName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        eventDescription: ['', [Validators.maxLength(1000)]],
        minAge: [18, [Validators.required, Validators.min(0), Validators.max(99)]],
        beginDatetime: ['', [Validators.required]],
        finishDatetime: ['', [Validators.required]],
        locationId: ['', [Validators.required]],
        djId: ['', [Validators.required]],
    });

    ngOnInit() {
        this.loadData();
        this.checkEditMode();
    }

    private loadData() {
        this.locationService.getAll().subscribe({
            next: (locations) => this.locations.set(locations),
            error: (err) => console.error('Error loading locations:', err)
        });

        this.djService.getAll().subscribe({
            next: (djs) => this.djs.set(djs),
            error: (err) => console.error('Error loading DJs:', err)
        });
    }

    private checkEditMode() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.eventId.set(Number(id));
            this.loadEventData(Number(id));
        }
    }

    private loadEventData(id: number) {
        this.loading.set(true);
        this.eventService.getEventById(id).subscribe({
            next: (event) => {
                this.currentEvent.set(event);

                this.eventForm.patchValue({
                    eventName: event.eventName,
                    eventDescription: event.eventDescription,
                    minAge: event.minAge,
                    beginDatetime: this.formatDatetimeLocal(event.beginDatetime),
                    finishDatetime: this.formatDatetimeLocal(event.finishDatetime),
                });

                if (event.coverPhoto) {
                    this.imagePreview.set(event.coverPhoto);
                }

                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading event:', err);
                this.error.set('Error al cargar el evento');
                this.loading.set(false);
            }
        });
    }

    private formatDatetimeLocal(dateString: string): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            const maxSizeMB = 5;
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                this.error.set(`La imagen supera el tamaño máximo de ${maxSizeMB}MB.`);
                input.value = '';
                return;
            }

            if (!file.type.startsWith('image/')) {
                this.error.set('El archivo debe ser una imagen (JPG, PNG, etc.)');
                input.value = '';
                return;
            }

            this.error.set(null);
            this.selectedFile.set(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.selectedFile.set(null);
        this.imagePreview.set(null);
    }

    // Cancel - go back to list
    cancel() {
        if (this.isEditMode()) {
            if (!confirm('¿Estás seguro? El evento quedará guardado como borrador.')) {
                return;
            }
        }
        this.router.navigate(['/admin']);
    }

    // Validate that end date is after start date
    private validateDates(): boolean {
        const beginDate = this.eventForm.get('beginDatetime')?.value;
        const finishDate = this.eventForm.get('finishDatetime')?.value;
        if (beginDate && finishDate && new Date(finishDate) <= new Date(beginDate)) {
            this.error.set('La fecha de fin debe ser posterior a la fecha de inicio');
            return false;
        }
        return true;
    }

    // Auto-clear messages after timeout
    private clearMessagesAfterTimeout() {
        setTimeout(() => {
            this.successMessage.set(null);
        }, 4000);
    }

    // Save as Draft and stay on page
    saveDraft() {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            return;
        }

        if (!this.isEditMode() && !this.selectedFile()) {
            this.error.set('Debes seleccionar una imagen de portada');
            return;
        }

        if (!this.validateDates()) {
            return;
        }

        this.savingDraft.set(true);
        this.error.set(null);

        const formData = this.buildEventFormData();

        if (this.isEditMode()) {
            this.eventService.updateEvent(this.eventId()!, formData).subscribe({
                next: () => {
                    this.successMessage.set('Borrador guardado correctamente');
                    this.savingDraft.set(false);
                    this.clearMessagesAfterTimeout();
                },
                error: (err) => {
                    console.error('Error saving draft:', err);
                    this.error.set(err.error?.message || 'Error al guardar el borrador');
                    this.savingDraft.set(false);
                }
            });
        } else {
            this.eventService.createEvent(formData).subscribe({
                next: (response) => {
                    const newEventId = response.data.id;
                    this.successMessage.set('Borrador creado correctamente');
                    this.savingDraft.set(false);
                    // Switch to edit mode
                    this.isEditMode.set(true);
                    this.eventId.set(newEventId);
                    this.clearMessagesAfterTimeout();
                },
                error: (err) => {
                    console.error('Error creating draft:', err);
                    this.error.set(err.error?.message || 'Error al crear el borrador');
                    this.savingDraft.set(false);
                }
            });
        }
    }

    // Next Step - Save and go to Step 2 (Ticket Configuration)
    goToStep2() {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            return;
        }

        if (!this.isEditMode() && !this.selectedFile()) {
            this.error.set('Debes seleccionar una imagen de portada');
            return;
        }

        if (!this.validateDates()) {
            return;
        }

        this.submitting.set(true);
        this.error.set(null);

        const formData = this.buildEventFormData();

        if (this.isEditMode()) {
            // Update and navigate to step 2
            this.eventService.updateEvent(this.eventId()!, formData).subscribe({
                next: () => {
                    this.router.navigate(['/admin/eventos', this.eventId(), 'tickets']);
                },
                error: (err) => {
                    console.error('Error updating event:', err);
                    this.error.set(err.error?.message || 'Error al actualizar el evento');
                    this.submitting.set(false);
                }
            });
        } else {
            // Create and navigate to step 2
            this.eventService.createEvent(formData).subscribe({
                next: (response) => {
                    const newEventId = response.data.id;
                    this.router.navigate(['/admin/eventos', newEventId, 'tickets']);
                },
                error: (err) => {
                    console.error('Error creating event:', err);
                    this.error.set(err.error?.message || 'Error al crear el evento');
                    this.submitting.set(false);
                }
            });
        }
    }

    private buildEventFormData(): FormData {
        const formData = new FormData();
        const values = this.eventForm.value;

        formData.append('eventName', values.eventName);
        formData.append('eventDescription', values.eventDescription || '');
        formData.append('minAge', values.minAge.toString());

        // Format dates to backend expected format 'YYYY-MM-DD HH:MM:SS'
        const beginDate = new Date(values.beginDatetime);
        const finishDate = new Date(values.finishDatetime);
        formData.append('beginDatetime', this.formatToBackendDate(beginDate));
        formData.append('finishDatetime', this.formatToBackendDate(finishDate));

        formData.append('location', values.locationId);
        formData.append('dj', values.djId);

        if (this.selectedFile()) {
            formData.append('coverPhoto', this.selectedFile()!);
        }

        return formData;
    }

    private formatToBackendDate(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
}
