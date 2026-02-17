import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseService } from '../services/purchase.service';
import { AuthService } from '../services/auth.service';
import { Purchase } from '../models/purchase';

interface EventGroup {
    eventId: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    coverPhoto: string;
    locationName: string;
    locationAddress: string;
    ticketGroups: TicketGroup[];
}

interface TicketGroup {
    ticketTypeName: string;
    price: number;
    quantity: number;
    purchaseId: number;
    ticketIds: number[];
    downloading: boolean;
}

@Component({
    selector: 'app-mis-entradas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mis-entradas.component.html',
    styleUrl: './mis-entradas.component.css'
})
export class MisEntradasComponent implements OnInit {
    private purchaseService = inject(PurchaseService);
    private authService = inject(AuthService);

    activeTab = signal<'proximas' | 'pasadas'>('proximas');
    loading = signal(true);
    error = signal<string | null>(null);

    upcomingEvents = signal<EventGroup[]>([]);
    pastEvents = signal<EventGroup[]>([]);

    ngOnInit(): void {
        this.loadPurchases();
    }

    setTab(tab: 'proximas' | 'pasadas'): void {
        this.activeTab.set(tab);
    }

    loadPurchases(): void {
        this.loading.set(true);
        this.error.set(null);

        this.purchaseService.getUserPurchases().subscribe({
            next: (response) => {
                const purchases = response.data || [];
                const now = new Date();

                // Only approved purchases
                const approved = purchases.filter(p => p.paymentStatus?.toLowerCase() === 'approved');

                // Group by event
                const eventMap = new Map<number, EventGroup>();

                for (const purchase of approved) {
                    const tt = purchase.ticketType as any;
                    const event = tt?.event;
                    if (!event) continue;

                    const eventId = event.id;
                    if (!eventMap.has(eventId)) {
                        eventMap.set(eventId, {
                            eventId,
                            eventName: event.eventName,
                            beginDatetime: event.beginDatetime,
                            finishDatetime: event.finishDatetime,
                            coverPhoto: event.coverPhoto,
                            locationName: event.location?.locationName || '',
                            locationAddress: event.location?.address || '',
                            ticketGroups: []
                        });
                    }

                    const group = eventMap.get(eventId)!;
                    const tickets = (purchase.ticket || []) as any[];
                    group.ticketGroups.push({
                        ticketTypeName: tt.ticketTypeName,
                        price: tt.price,
                        quantity: purchase.ticketNumbers,
                        purchaseId: purchase.id,
                        ticketIds: tickets.map((t: any) => t.id),
                        downloading: false
                    });
                }

                const upcoming: EventGroup[] = [];
                const past: EventGroup[] = [];

                for (const eg of eventMap.values()) {
                    const eventDate = new Date(eg.finishDatetime);
                    if (eventDate > now) {
                        upcoming.push(eg);
                    } else {
                        past.push(eg);
                    }
                }

                // Sort upcoming by date ascending, past by date descending
                upcoming.sort((a, b) => new Date(a.beginDatetime).getTime() - new Date(b.beginDatetime).getTime());
                past.sort((a, b) => new Date(b.beginDatetime).getTime() - new Date(a.beginDatetime).getTime());

                this.upcomingEvents.set(upcoming);
                this.pastEvents.set(past);
                this.loading.set(false);
            },
            error: (err: any) => {
                this.loading.set(false);
                this.error.set(err?.error?.message || 'Error al cargar las entradas');
            }
        });
    }

    downloadTickets(eventIndex: number, groupIndex: number): void {
        const events = this.upcomingEvents();
        const group = events[eventIndex].ticketGroups[groupIndex];
        if (group.downloading) return;

        // Mark as downloading
        group.downloading = true;
        this.upcomingEvents.set([...events]);

        let completed = 0;
        const total = group.ticketIds.length;

        for (const ticketId of group.ticketIds) {
            this.purchaseService.downloadTicketPdf(group.purchaseId, ticketId).subscribe({
                next: (blob) => {
                    // Trigger download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ticket-${group.ticketTypeName.replace(/\s+/g, '_')}-${ticketId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    completed++;
                    if (completed === total) {
                        group.downloading = false;
                        this.upcomingEvents.set([...events]);
                    }
                },
                error: () => {
                    completed++;
                    if (completed === total) {
                        group.downloading = false;
                        this.upcomingEvents.set([...events]);
                    }
                }
            });
        }
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
}
