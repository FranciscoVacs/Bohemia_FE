import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminEvent } from '../../../models/event';
import { AdminTicketType } from '../../../models/ticket-type';
import { AdminEventService } from '../../services/admin-event.service';
import { TicketTypeService } from '../../services/ticket-type.service';

@Component({
    selector: 'app-ticket-config',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ticket-config.component.html',
})
export class TicketConfigComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private eventService = inject(AdminEventService);
    private ticketTypeService = inject(TicketTypeService);

    // Estado
    eventId = signal<number | null>(null);
    loading = signal(false);
    submitting = signal(false);
    publishing = signal(false);
    deleting = signal(false);
    error = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Datos del evento
    currentEvent = signal<AdminEvent | null>(null);
    ticketTypes = signal<AdminTicketType[]>([]);

    // Formulario para nuevo ticket
    ticketForm: FormGroup = this.fb.group({
        ticketTypeName: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        maxQuantity: [1, [Validators.required, Validators.min(1)]],
        saleMode: ['scheduled'],
        isManuallyActivated: [false],
        beginDate: [{ value: '', disabled: true }],  // Disabled por defecto, se habilita en modo scheduled
        finishDate: [{ value: '', disabled: true }]   // Disabled por defecto, se habilita en modo scheduled
    });

    // Mostrar formulario de nuevo ticket
    showNewTicketForm = signal(false);
    
    // Modals
    showCancelModal = signal(false);
    showPublishModal = signal(false);

    // Computed
    canPublish = computed(() => {
        const event = this.currentEvent();
        return event && !event.isPublished && this.ticketTypes().length > 0;
    });

    totalTickets = computed(() => {
        return this.ticketTypes().reduce((sum, t) => sum + t.maxQuantity, 0);
    });

    estimatedRevenue = computed(() => {
        return this.ticketTypes().reduce((sum, t) => sum + (t.price * t.maxQuantity), 0);
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.eventId.set(Number(id));
            this.loadEventData(Number(id));
        } else {
            this.router.navigate(['/admin']);
        }
    }

    private loadEventData(id: number) {
        this.loading.set(true);
        this.eventService.getEventById(id).subscribe({
            next: (event) => {
                this.currentEvent.set(event);
                this.ticketTypes.set(event.ticketTypes || []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading event:', err);
                this.error.set('Error al cargar el evento');
                this.loading.set(false);
            }
        });
    }

    // Navigation
    goBackToEventData() {
        this.router.navigate(['/admin/eventos', this.eventId(), 'editar']);
    }

    // Save as draft and exit to admin list
    saveDraftAndExit() {
        // Event is already saved as draft, just navigate back
        this.router.navigate(['/admin']);
    }

    // Open cancel modal instead of using confirm()
    cancelAndDelete() {
        this.showCancelModal.set(true);
    }
    
    closeCancelModal() {
        this.showCancelModal.set(false);
    }
    
    confirmCancelAndDelete() {
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
    }

    // Ticket Management
    toggleNewTicketForm() {
        this.showNewTicketForm.update(v => !v);
        if (this.showNewTicketForm()) {
            this.ticketForm.reset({ saleMode: 'scheduled', price: 0, maxQuantity: 1, isManuallyActivated: false });
            // Estado inicial: modo scheduled, fechas habilitadas
            this.ticketForm.get('beginDate')?.enable();
            this.ticketForm.get('finishDate')?.enable();
        }
    }
    
    setSaleMode(mode: 'manual' | 'scheduled') {
        this.ticketForm.patchValue({ saleMode: mode });
        
        // Habilitar/deshabilitar campos de fecha según el modo
        if (mode === 'scheduled') {
            this.ticketForm.get('beginDate')?.enable();
            this.ticketForm.get('finishDate')?.enable();
        } else {
            this.ticketForm.get('beginDate')?.disable();
            this.ticketForm.get('finishDate')?.disable();
            // Limpiar valores al cambiar a manual
            this.ticketForm.patchValue({
                beginDate: '',
                finishDate: ''
            });
        }
    }
    
    toggleManualActivation() {
        const current = this.ticketForm.get('isManuallyActivated')?.value;
        this.ticketForm.patchValue({ isManuallyActivated: !current });
    }

    private formatToBackendDate(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    addTicketType() {
        if (this.ticketForm.invalid || !this.eventId()) {
            this.ticketForm.markAllAsTouched();
            return;
        }

        const values = this.ticketForm.value;

        // Validar que si el modo es 'scheduled', las fechas sean requeridas
        if (values.saleMode === 'scheduled') {
            if (!values.beginDate || !values.finishDate) {
                this.error.set('Para el modo programado, debes especificar las fechas de inicio y fin de venta');
                return;
            }

            // Combine date with fixed times: begin at 00:00:00, finish at 23:59:59
            const beginDatetime = new Date(`${values.beginDate}T00:00:00`);
            const finishDatetime = new Date(`${values.finishDate}T23:59:59`);

            // Validar que la fecha de fin sea posterior a la de inicio
            if (finishDatetime <= beginDatetime) {
                this.error.set('La fecha de fin de venta debe ser posterior a la fecha de inicio');
                return;
            }
        }

        this.submitting.set(true);
        this.error.set(null);

        // Combine date fields with fixed times for scheduled mode
        let beginDatetime: Date | null = null;
        let finishDatetime: Date | null = null;
        
        if (values.saleMode === 'scheduled' && values.beginDate) {
            beginDatetime = new Date(`${values.beginDate}T00:00:00`);
        }
        if (values.saleMode === 'scheduled' && values.finishDate) {
            finishDatetime = new Date(`${values.finishDate}T23:59:59`);
        }

        const ticketData = {
            ticketTypeName: values.ticketTypeName,
            price: Number(values.price),
            maxQuantity: Number(values.maxQuantity),
            event: this.eventId(),
            saleMode: values.saleMode,
            isManuallyActivated: values.saleMode === 'manual' ? values.isManuallyActivated : false,
            beginDatetime: beginDatetime ? this.formatToBackendDate(beginDatetime) : null,
            finishDatetime: finishDatetime ? this.formatToBackendDate(finishDatetime) : null,
        };

        this.ticketTypeService.createTicketType(this.eventId()!, ticketData as any).subscribe({
            next: () => {
                this.successMessage.set('Tipo de ticket agregado');
                this.showNewTicketForm.set(false);
                this.ticketForm.reset({ saleMode: 'scheduled', price: 0, maxQuantity: 1, isManuallyActivated: false });
                this.loadEventData(this.eventId()!);
                this.submitting.set(false);
                this.clearMessagesAfterTimeout();
            },
            error: (err: any) => {
                console.error('Error creating ticket type:', err);
                this.error.set(err.error?.message || 'Error al crear tipo de ticket');
                this.submitting.set(false);
            }
        });
    }

    deleteTicketType(ticketId: number) {
        if (!confirm('¿Eliminar este tipo de ticket?')) return;

        this.ticketTypeService.deleteTicketType(this.eventId()!, ticketId).subscribe({
            next: () => {
                this.successMessage.set('Tipo de ticket eliminado');
                this.loadEventData(this.eventId()!);
                this.clearMessagesAfterTimeout();
            },
            error: (err: any) => {
                console.error('Error deleting ticket type:', err);
                this.error.set(err.error?.message || 'Error al eliminar tipo de ticket');
            }
        });
    }

    // Auto-clear messages after timeout
    private clearMessagesAfterTimeout() {
        setTimeout(() => {
            this.successMessage.set(null);
        }, 4000);
    }

    // Publish
    showPublishConfirmation() {
        if (!this.canPublish()) return;
        this.showPublishModal.set(true);
    }
    
    closePublishModal() {
        this.showPublishModal.set(false);
    }
    
    confirmPublish() {
        this.publishing.set(true);
        this.error.set(null);

        this.eventService.publishEvent(this.eventId()!).subscribe({
            next: () => {
                this.successMessage.set('Evento publicado exitosamente!');
                this.publishing.set(false);
                this.showPublishModal.set(false);
                // Redirect to event list
                setTimeout(() => {
                    this.router.navigate(['/admin']);
                }, 1500);
            },
            error: (err: any) => {
                console.error('Error publishing event:', err);
                this.error.set(err.error?.message || 'Error al publicar el evento');
                this.publishing.set(false);
                this.showPublishModal.set(false);
            }
        });
    }

    // Keep legacy method for backwards compatibility
    publishEvent() {
        this.showPublishConfirmation();
    }
}
