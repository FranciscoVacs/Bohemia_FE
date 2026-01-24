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
        maxQuantity: [100, [Validators.required, Validators.min(1)]],
        saleMode: ['scheduled'],
        isManuallyActivated: [false],
        beginDatetime: [''],
        finishDatetime: ['']
    });

    // Mostrar formulario de nuevo ticket
    showNewTicketForm = signal(false);

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

    cancelAndDelete() {
        if (!confirm('¿Estás seguro? Se eliminará el evento y toda la información cargada.')) {
            return;
        }

        this.deleting.set(true);
        this.eventService.deleteEvent(this.eventId()!).subscribe({
            next: () => {
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Error deleting event:', err);
                this.error.set('Error al eliminar el evento');
                this.deleting.set(false);
            }
        });
    }

    // Ticket Management
    toggleNewTicketForm() {
        this.showNewTicketForm.update(v => !v);
        if (this.showNewTicketForm()) {
            this.ticketForm.reset({ saleMode: 'scheduled', price: 0, maxQuantity: 100 });
        }
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

        this.submitting.set(true);
        const values = this.ticketForm.value;

        const ticketData = {
            ticketTypeName: values.ticketTypeName,
            price: Number(values.price),
            maxQuantity: Number(values.maxQuantity),
            event: this.eventId(),
            saleMode: values.saleMode,
            isManuallyActivated: values.saleMode === 'manual' ? values.isManuallyActivated : false,
            beginDatetime: values.beginDatetime ? this.formatToBackendDate(new Date(values.beginDatetime)) : null,
            finishDatetime: values.finishDatetime ? this.formatToBackendDate(new Date(values.finishDatetime)) : null,
        };

        this.ticketTypeService.createTicketType(this.eventId()!, ticketData as any).subscribe({
            next: () => {
                this.successMessage.set('Tipo de ticket agregado');
                this.showNewTicketForm.set(false);
                this.ticketForm.reset({ saleMode: 'scheduled', price: 0, maxQuantity: 100 });
                this.loadEventData(this.eventId()!);
                this.submitting.set(false);
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
            },
            error: (err: any) => {
                console.error('Error deleting ticket type:', err);
                this.error.set(err.error?.message || 'Error al eliminar tipo de ticket');
            }
        });
    }

    // Publish
    publishEvent() {
        if (!this.canPublish()) return;

        this.publishing.set(true);
        this.error.set(null);

        this.eventService.publishEvent(this.eventId()!).subscribe({
            next: () => {
                this.successMessage.set('¡Evento publicado exitosamente!');
                this.publishing.set(false);
                // Redirect to event list
                setTimeout(() => {
                    this.router.navigate(['/admin']);
                }, 1500);
            },
            error: (err: any) => {
                console.error('Error publishing event:', err);
                this.error.set(err.error?.message || 'Error al publicar el evento');
                this.publishing.set(false);
            }
        });
    }
}
