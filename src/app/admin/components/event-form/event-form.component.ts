import { Component, inject, signal, computed, effect, OnInit, HostListener } from '@angular/core';
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
    saving = signal(false);
    deleting = signal(false);
    error = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Modal de cancelación
    showCancelModal = signal(false);

    // Datos del evento cargado
    currentEvent = signal<AdminEvent | null>(null);

    // Computed: true si estamos editando un evento ya publicado (no un draft de creación)
    isEditingPublished = computed(() => {
        const event = this.currentEvent();
        return this.isEditMode() && event !== null && event.isPublished;
    });

    // Datos para selects
    locations = signal<Location[]>([]);
    djs = signal<Dj[]>([]);

    // Filtro de ciudad para ubicaciones
    selectedCityId = signal<number | null>(null);

    // Computed: ciudades únicas extraídas de las ubicaciones
    cities = computed(() => {
        const cityMap = new Map<number, string>();
        this.locations().forEach(loc => {
            if (!cityMap.has(loc.city.id)) {
                cityMap.set(loc.city.id, loc.city.cityName);
            }
        });
        return Array.from(cityMap, ([id, cityName]) => ({ id, cityName })).sort((a, b) => a.cityName.localeCompare(b.cityName));
    });

    // Computed: ubicaciones filtradas por ciudad seleccionada
    filteredLocations = computed(() => {
        const cityId = this.selectedCityId();
        if (!cityId) return [];
        return this.locations().filter(loc => loc.city.id === cityId);
    });

    // Preview de imagen
    imagePreview = signal<string | null>(null);
    selectedFile = signal<File | null>(null);

    // Tracking de cambios para evento publicado
    hasUnsavedChanges = signal(false);

    // Computed: fecha mínima = hoy (formato string para input date)
    minDateStr = computed(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });

    // Formulario principal del evento con campos de fecha separados
    eventForm: FormGroup = this.fb.group({
        eventName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        eventDescription: ['', [Validators.maxLength(1000)]],
        minAge: [18, [Validators.required, Validators.min(0), Validators.max(99)]],
        beginDate: ['', [Validators.required]],
        beginTime: ['', [Validators.required]],
        finishDate: ['', [Validators.required]],
        finishTime: ['', [Validators.required]],
        locationId: ['', [Validators.required]],
        djId: ['', [Validators.required]],
    });

    // Effect: pre-seleccionar la ciudad cuando se cargan tanto las ubicaciones como el evento
    private cityPreselectionEffect = effect(() => {
        const locations = this.locations();
        const event = this.currentEvent();
        if (locations.length > 0 && event && !this.selectedCityId()) {
            const matchedLocation = locations.find(loc => loc.id === event.location.id);
            if (matchedLocation) {
                this.selectedCityId.set(matchedLocation.city.id);
            }
        }
    });

    ngOnInit() {
        this.loadData();
        this.checkEditMode();
    }

    // Prevenir navegación accidental con beforeunload
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.eventForm.dirty || this.selectedFile()) {
            $event.returnValue = true;
        }
    }

    onCityChange(cityId: string) {
        const parsed = cityId ? Number(cityId) : null;
        this.selectedCityId.set(parsed);
        this.eventForm.patchValue({ locationId: '' });
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

                const beginDatetime = new Date(event.beginDatetime);
                const finishDatetime = new Date(event.finishDatetime);

                this.eventForm.patchValue({
                    eventName: event.eventName,
                    eventDescription: event.eventDescription,
                    minAge: event.minAge,
                    beginDate: this.formatDateForInput(beginDatetime),
                    beginTime: this.formatTimeForInput(beginDatetime),
                    finishDate: this.formatDateForInput(finishDatetime),
                    finishTime: this.formatTimeForInput(finishDatetime),
                    locationId: event.location.id,
                    djId: event.dj.id,
                });

                if (event.coverPhoto) {
                    this.imagePreview.set(event.coverPhoto);
                }

                this.loading.set(false);

                // Reset dirty tracking after form is populated
                this.eventForm.markAsPristine();
                this.hasUnsavedChanges.set(false);

                // Listen for form changes to track unsaved changes (only for published events)
                if (event.isPublished) {
                    this.eventForm.valueChanges.subscribe(() => {
                        if (this.eventForm.dirty) {
                            this.hasUnsavedChanges.set(true);
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Error loading event:', err);
                this.error.set('Error al cargar el evento');
                this.loading.set(false);
            }
        });
    }

    private formatDateForInput(date: Date): string {
        return date.toISOString().slice(0, 10);
    }

    private formatTimeForInput(date: Date): string {
        return date.toTimeString().slice(0, 5);
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
            this.hasUnsavedChanges.set(true);

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
        this.hasUnsavedChanges.set(true);
    }

    // Cancel / go back - show confirmation modal if unsaved changes
    cancel() {
        if (this.isEditingPublished() && this.hasUnsavedChanges()) {
            this.showCancelModal.set(true);
        } else if (this.isEditingPublished()) {
            // No unsaved changes, go directly back
            this.router.navigate(['/admin']);
        } else {
            // Creation flow: always show modal
            this.showCancelModal.set(true);
        }
    }

    closeCancelModal() {
        this.showCancelModal.set(false);
    }

    confirmCancel() {
        const event = this.currentEvent();
        const isCreatingDraft = this.isEditMode() && this.eventId() && event && !event.isPublished;

        if (isCreatingDraft) {
            // Eliminar el evento borrador (flujo de creación)
            this.deleting.set(true);
            this.eventService.deleteEvent(this.eventId()!).subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: (err) => {
                    console.error('Error deleting event:', err);
                    this.error.set('Error al eliminar el evento');
                    this.deleting.set(false);
                    this.showCancelModal.set(false);
                }
            });
        } else {
            // Evento publicado o sin crear aún, solo navegar
            this.router.navigate(['/admin']);
        }
    }

    // Combine date and time fields into a single Date object
    private combineDateAndTime(dateStr: string, timeStr: string): Date {
        return new Date(`${dateStr}T${timeStr}:00`);
    }

    // Validate that end date is after start date
    private validateDates(): boolean {
        const values = this.eventForm.value;
        const beginDatetime = this.combineDateAndTime(values.beginDate, values.beginTime);
        const finishDatetime = this.combineDateAndTime(values.finishDate, values.finishTime);

        if (finishDatetime <= beginDatetime) {
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

    // Save changes for published event (stay on page)
    saveChanges() {
        if (this.eventForm.invalid || !this.selectedCityId()) {
            this.eventForm.markAllAsTouched();
            this.error.set(this.buildValidationErrorMessage());
            return;
        }

        if (!this.validateDates()) {
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        const formData = this.buildEventFormData();

        this.eventService.updateEvent(this.eventId()!, formData).subscribe({
            next: () => {
                this.saving.set(false);
                this.hasUnsavedChanges.set(false);
                this.eventForm.markAsPristine();
                this.selectedFile.set(null); // File already uploaded
                this.successMessage.set('Cambios guardados exitosamente');
                this.clearMessagesAfterTimeout();
            },
            error: (err) => {
                console.error('Error saving event:', err);
                this.error.set(err.error?.message || 'Error al guardar los cambios');
                this.saving.set(false);
            }
        });
    }

    // Next Step - Save and go to Step 2 (Ticket Configuration)
    goToStep2() {
        if (this.eventForm.invalid || !this.selectedCityId()) {
            this.eventForm.markAllAsTouched();
            this.error.set(this.buildValidationErrorMessage());
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

    private buildValidationErrorMessage(): string {
        const missing: string[] = [];
        const c = this.eventForm.controls;
        if (c['eventName'].invalid) missing.push('Nombre del Evento');
        if (c['beginDate'].invalid) missing.push('Fecha de inicio');
        if (c['beginTime'].invalid) missing.push('Hora de inicio');
        if (c['finishDate'].invalid) missing.push('Fecha de fin');
        if (c['finishTime'].invalid) missing.push('Hora de fin');
        if (!this.selectedCityId()) missing.push('Ciudad');
        if (c['locationId'].invalid) missing.push('Locación');
        if (c['djId'].invalid) missing.push('DJ Principal');
        if (missing.length > 0) {
            return 'Faltan los siguientes campos: ' + missing.join(', ');
        }
        return 'Por favor completa todos los campos requeridos';
    }

    private buildEventFormData(): FormData {
        const formData = new FormData();
        const values = this.eventForm.value;

        formData.append('eventName', values.eventName);
        formData.append('eventDescription', values.eventDescription || '');
        formData.append('minAge', values.minAge.toString());

        // Combine date and time, then format to backend expected format 'YYYY-MM-DD HH:MM:SS'
        const beginDatetime = this.combineDateAndTime(values.beginDate, values.beginTime);
        const finishDatetime = this.combineDateAndTime(values.finishDate, values.finishTime);
        formData.append('beginDatetime', this.formatToBackendDate(beginDatetime));
        formData.append('finishDatetime', this.formatToBackendDate(finishDatetime));

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
