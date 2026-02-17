import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminEvent } from '../../../models/event';
import { AdminTicketType, AdminCreateTicketType } from '../../../models/ticket-type';
import { AdminEventService } from '../../services/admin-event.service';
import { TicketTypeService } from '../../services/ticket-type.service';

/** Ticket pendiente de guardar (solo existe en memoria) */
interface PendingTicket {
    tempId: number;
    ticketTypeName: string;
    price: number;
    maxQuantity: number;
    sortOrder: number;
}

/** Edicion pendiente de un ticket existente del servidor */
interface PendingEdit {
    ticketTypeName?: string;
    price?: number;
    maxQuantity?: number;
}

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
    closing = signal(false);
    saving = signal(false);
    error = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Datos del evento
    currentEvent = signal<AdminEvent | null>(null);
    ticketTypes = signal<AdminTicketType[]>([]);

    // Tickets pendientes de crear (solo para edicion de evento publicado)
    pendingTickets = signal<PendingTicket[]>([]);
    private nextTempId = 1;

    // IDs de tickets marcados para eliminar (solo para edicion de evento publicado)
    pendingDeletions = signal<number[]>([]);

    // Ediciones pendientes de tickets existentes: Map<ticketId, PendingEdit>
    pendingEdits = signal<Map<number, PendingEdit>>(new Map());

    // Formulario para nuevo ticket
    ticketForm: FormGroup = this.fb.group({
        ticketTypeName: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        maxQuantity: [1, [Validators.required, Validators.min(1)]],
        sortOrder: [1, [Validators.required, Validators.min(1)]],
    });

    // Mostrar formulario de nuevo ticket
    showNewTicketForm = signal(false);

    // Modals
    showCancelModal = signal(false);
    showPublishModal = signal(false);
    showCloseModal = signal(false);
    ticketToClose = signal<AdminTicketType | null>(null);

    // Computed
    canPublish = computed(() => {
        const event = this.currentEvent();
        return event && !event.isPublished && this.allDisplayedTickets().length > 0;
    });

    // Computed: true si estamos editando un evento ya publicado
    isEditingPublished = computed(() => {
        const event = this.currentEvent();
        return event !== null && event.isPublished;
    });

    // Tickets del servidor sin los marcados para eliminar, con ediciones aplicadas
    serverTicketsFiltered = computed(() => {
        const deletions = this.pendingDeletions();
        const edits = this.pendingEdits();
        return this.ticketTypes()
            .filter(t => !deletions.includes(t.id))
            .map(t => {
                const edit = edits.get(t.id);
                if (edit) {
                    return {
                        ...t,
                        ticketTypeName: edit.ticketTypeName ?? t.ticketTypeName,
                        price: edit.price ?? t.price,
                        maxQuantity: edit.maxQuantity ?? t.maxQuantity,
                    };
                }
                return t;
            });
    });

    // Todos los tickets visibles: servidor (filtrados + editados) + pendientes
    allDisplayedTickets = computed(() => {
        const server = this.serverTicketsFiltered();
        const pending = this.pendingTickets();
        const edits = this.pendingEdits();
        const combined: DisplayTicket[] = [
            ...server.map(t => ({
                ...t,
                isPending: false as const,
                tempId: undefined,
                hasEdits: edits.has(t.id),
            })),
            ...pending.map(p => ({
                id: p.tempId,
                ticketTypeName: p.ticketTypeName,
                price: p.price,
                maxQuantity: p.maxQuantity,
                availableTickets: p.maxQuantity,
                sortOrder: p.sortOrder,
                status: 'pending' as const,
                isSaleActive: false,
                event: this.eventId()!,
                isPending: true as const,
                tempId: p.tempId,
                hasEdits: false,
            })),
        ];
        return combined.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    totalTickets = computed(() => {
        return this.allDisplayedTickets().reduce((sum, t) => sum + t.maxQuantity, 0);
    });

    estimatedRevenue = computed(() => {
        return this.allDisplayedTickets().reduce((sum, t) => sum + (t.price * t.maxQuantity), 0);
    });

    // Computed: sorted ticket types by sortOrder (para creacion - usa ticketTypes directos con ediciones)
    sortedTicketTypes = computed(() => {
        const edits = this.pendingEdits();
        return [...this.ticketTypes()]
            .map(t => {
                const edit = edits.get(t.id);
                if (edit) {
                    return {
                        ...t,
                        ticketTypeName: edit.ticketTypeName ?? t.ticketTypeName,
                        price: edit.price ?? t.price,
                        maxQuantity: edit.maxQuantity ?? t.maxQuantity,
                    };
                }
                return t;
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
    });

    // Computed: next sortOrder value for new tickets
    nextSortOrder = computed(() => {
        const all = this.allDisplayedTickets();
        if (all.length === 0) return 1;
        return Math.max(...all.map(t => t.sortOrder)) + 1;
    });

    // Computed: hay cambios sin guardar?
    hasUnsavedChanges = computed(() => {
        return this.pendingTickets().length > 0
            || this.pendingDeletions().length > 0
            || this.pendingEdits().size > 0;
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

    goBackToList() {
        if (this.hasUnsavedChanges()) {
            this.showCancelModal.set(true);
        } else {
            this.router.navigate(['/admin']);
        }
    }

    // Open cancel modal instead of using confirm()
    cancelAndDelete() {
        this.showCancelModal.set(true);
    }

    closeCancelModal() {
        this.showCancelModal.set(false);
    }

    confirmCancelAndDelete() {
        const event = this.currentEvent();

        if (event && event.isPublished) {
            // Evento publicado: descartar cambios pendientes y volver al listado
            this.pendingTickets.set([]);
            this.pendingDeletions.set([]);
            this.pendingEdits.set(new Map());
            this.router.navigate(['/admin']);
            return;
        }

        // Draft de creacion: eliminar evento y tickets
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
            this.ticketForm.reset({ price: 0, maxQuantity: 1, sortOrder: this.nextSortOrder() });
        }
    }

    addTicketType() {
        if (this.ticketForm.invalid || !this.eventId()) {
            this.ticketForm.markAllAsTouched();
            return;
        }

        const values = this.ticketForm.value;

        if (this.isEditingPublished()) {
            // Evento publicado: agregar a pendientes (batch)
            const pending: PendingTicket = {
                tempId: this.nextTempId++,
                ticketTypeName: values.ticketTypeName,
                price: Number(values.price),
                maxQuantity: Number(values.maxQuantity),
                sortOrder: Number(values.sortOrder),
            };
            this.pendingTickets.update(list => [...list, pending]);
            this.showNewTicketForm.set(false);
            this.ticketForm.reset({ price: 0, maxQuantity: 1, sortOrder: this.nextSortOrder() });
            this.successMessage.set('Ticket agregado (pendiente de guardar)');
            this.clearMessagesAfterTimeout();
        } else {
            // Creacion: guardar inmediatamente
            this.submitting.set(true);
            this.error.set(null);

            const ticketData = {
                ticketTypeName: values.ticketTypeName,
                price: Number(values.price),
                maxQuantity: Number(values.maxQuantity),
                event: this.eventId(),
                sortOrder: Number(values.sortOrder),
            };

            this.ticketTypeService.createTicketType(this.eventId()!, ticketData as any).subscribe({
                next: () => {
                    this.successMessage.set('Tipo de ticket agregado');
                    this.showNewTicketForm.set(false);
                    this.ticketForm.reset({ price: 0, maxQuantity: 1, sortOrder: this.nextSortOrder() });
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
    }

    deleteTicketType(ticketId: number, isPending: boolean) {
        if (isPending) {
            // Quitar de la lista de pendientes
            this.pendingTickets.update(list => list.filter(t => t.tempId !== ticketId));
            this.successMessage.set('Ticket pendiente eliminado');
            this.clearMessagesAfterTimeout();
            return;
        }

        if (this.isEditingPublished()) {
            // Evento publicado: marcar para eliminar en batch
            this.pendingDeletions.update(list => [...list, ticketId]);
            // Limpiar ediciones pendientes de este ticket
            this.pendingEdits.update(map => {
                const newMap = new Map(map);
                newMap.delete(ticketId);
                return newMap;
            });
            this.successMessage.set('Ticket marcado para eliminar (pendiente de guardar)');
            this.clearMessagesAfterTimeout();
        } else {
            // Creacion: eliminar inmediatamente
            if (!confirm('¿Eliminar este tipo de ticket?')) return;

            this.ticketTypeService.deleteTicketType(this.eventId()!, ticketId).subscribe({
                next: () => {
                    this.successMessage.set('Tipo de ticket eliminado');
                    this.pendingEdits.update(map => {
                        const newMap = new Map(map);
                        newMap.delete(ticketId);
                        return newMap;
                    });
                    this.loadEventData(this.eventId()!);
                    this.clearMessagesAfterTimeout();
                },
                error: (err: any) => {
                    console.error('Error deleting ticket type:', err);
                    this.error.set(err.error?.message || 'Error al eliminar tipo de ticket');
                }
            });
        }
    }

    /** Deshacer la eliminacion pendiente de un ticket */
    undoDeletion(ticketId: number) {
        this.pendingDeletions.update(list => list.filter(id => id !== ticketId));
    }

    /** Verificar si un ticket esta marcado para eliminar */
    isMarkedForDeletion(ticketId: number): boolean {
        return this.pendingDeletions().includes(ticketId);
    }

    /** Editar un campo de un ticket existente del servidor */
    updateTicketField(ticketId: number, field: 'ticketTypeName' | 'price' | 'maxQuantity', value: string | number) {
        const original = this.ticketTypes().find(t => t.id === ticketId);
        if (!original) return;

        // Parsear valor
        let parsedValue: string | number = value;
        if (field === 'price') {
            parsedValue = Number(value);
            if (isNaN(parsedValue) || parsedValue < 0) return;
        } else if (field === 'maxQuantity') {
            parsedValue = Number(value);
            if (isNaN(parsedValue) || parsedValue < 1) return;
        }

        // Verificar si el valor realmente cambio respecto al original
        if (original[field] === parsedValue) {
            // Sin cambio, limpiar esta edicion si existe
            this.pendingEdits.update(map => {
                const newMap = new Map(map);
                const existing = newMap.get(ticketId);
                if (existing) {
                    delete existing[field];
                    if (Object.keys(existing).length === 0) {
                        newMap.delete(ticketId);
                    } else {
                        newMap.set(ticketId, { ...existing });
                    }
                }
                return newMap;
            });
            return;
        }

        if (this.isEditingPublished()) {
            // Evento publicado: acumular en pendingEdits (batch)
            this.pendingEdits.update(map => {
                const newMap = new Map(map);
                const existing = newMap.get(ticketId) || {};
                newMap.set(ticketId, { ...existing, [field]: parsedValue });
                return newMap;
            });
        } else {
            // Creacion: guardar inmediatamente via API
            this.ticketTypeService.updateTicketType(this.eventId()!, ticketId, { [field]: parsedValue } as Partial<AdminCreateTicketType>).subscribe({
                next: () => {
                    // Actualizar el ticket en la lista local sin recargar todo
                    this.ticketTypes.update(list =>
                        list.map(t => t.id === ticketId ? { ...t, [field]: parsedValue } : t)
                    );
                },
                error: (err: any) => {
                    console.error('Error updating ticket type:', err);
                    this.error.set(err.error?.message || 'Error al actualizar tipo de ticket');
                }
            });
        }
    }

    /** Editar un campo de un ticket pendiente (solo existe en memoria) */
    updatePendingTicketField(tempId: number, field: 'ticketTypeName' | 'price' | 'maxQuantity', value: string | number) {
        let parsedValue: string | number = value;
        if (field === 'price') {
            parsedValue = Number(value);
            if (isNaN(parsedValue) || parsedValue < 0) return;
        } else if (field === 'maxQuantity') {
            parsedValue = Number(value);
            if (isNaN(parsedValue) || parsedValue < 1) return;
        }

        this.pendingTickets.update(list =>
            list.map(t => t.tempId === tempId ? { ...t, [field]: parsedValue } : t)
        );
    }

    /** Verificar si un ticket tiene ediciones pendientes */
    hasEditFor(ticketId: number): boolean {
        return this.pendingEdits().has(ticketId);
    }

    // Guardar todos los cambios pendientes (ediciones + creaciones + eliminaciones)
    saveAllChanges() {
        const eventId = this.eventId();
        if (!eventId) return;

        const pending = this.pendingTickets();
        const deletions = this.pendingDeletions();
        const edits = this.pendingEdits();

        if (pending.length === 0 && deletions.length === 0 && edits.size === 0) {
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        // Construir array de observables
        const deleteOps = deletions.map(id =>
            this.ticketTypeService.deleteTicketType(eventId, id)
        );

        const createOps = pending.map(p =>
            this.ticketTypeService.createTicketType(eventId, {
                ticketTypeName: p.ticketTypeName,
                price: p.price,
                maxQuantity: p.maxQuantity,
                event: eventId,
                sortOrder: p.sortOrder,
            } as AdminCreateTicketType)
        );

        const editOps = Array.from(edits.entries()).map(([ticketId, edit]) =>
            this.ticketTypeService.updateTicketType(eventId, ticketId, edit as Partial<AdminCreateTicketType>)
        );

        const allOps = [...deleteOps, ...createOps, ...editOps];

        if (allOps.length === 0) {
            this.saving.set(false);
            return;
        }

        forkJoin(allOps).subscribe({
            next: () => {
                this.pendingTickets.set([]);
                this.pendingDeletions.set([]);
                this.pendingEdits.set(new Map());
                this.saving.set(false);
                this.successMessage.set('Cambios guardados exitosamente');
                this.clearMessagesAfterTimeout();
                // Recargar datos del servidor para reflejar estado real
                this.loadEventData(eventId);
            },
            error: (err: any) => {
                console.error('Error saving changes:', err);
                this.error.set(err.error?.message || 'Error al guardar los cambios. Algunos cambios pueden haberse aplicado parcialmente.');
                this.saving.set(false);
                // Recargar datos del servidor para reflejar estado real
                this.loadEventData(eventId);
            }
        });
    }

    // Close ticket type (admin action) - siempre inmediato
    openCloseModal(ticket: AdminTicketType) {
        this.ticketToClose.set(ticket);
        this.showCloseModal.set(true);
    }

    closeCloseModal() {
        this.showCloseModal.set(false);
        this.ticketToClose.set(null);
    }

    confirmCloseTicketType() {
        const ticket = this.ticketToClose();
        if (!ticket) return;

        this.closing.set(true);
        this.error.set(null);

        this.ticketTypeService.closeTicketType(this.eventId()!, ticket.id).subscribe({
            next: () => {
                this.successMessage.set(`Ticket "${ticket.ticketTypeName}" cerrado. Los tickets restantes fueron transferidos al siguiente en la cola.`);
                this.showCloseModal.set(false);
                this.ticketToClose.set(null);
                this.closing.set(false);
                this.loadEventData(this.eventId()!);
                this.clearMessagesAfterTimeout();
            },
            error: (err: any) => {
                console.error('Error closing ticket type:', err);
                this.error.set(err.error?.message || 'Error al cerrar tipo de ticket');
                this.closing.set(false);
                this.showCloseModal.set(false);
                this.ticketToClose.set(null);
            }
        });
    }

    // Status label helper
    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'pending': 'En Cola',
            'active': 'Activo',
            'sold_out': 'Agotado',
            'closed': 'Cerrado',
        };
        return labels[status] || status;
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

/** Tipo unificado para mostrar en la tabla (servidor o pendiente) */
interface DisplayTicket {
    id: number;
    ticketTypeName: string;
    price: number;
    maxQuantity: number;
    availableTickets: number;
    sortOrder: number;
    status: 'pending' | 'active' | 'sold_out' | 'closed';
    isSaleActive: boolean;
    event: number;
    isPending: boolean;
    tempId: number | undefined;
    hasEdits: boolean;
}
