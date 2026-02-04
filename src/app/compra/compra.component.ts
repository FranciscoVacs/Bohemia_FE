import { Component } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../models/event';
import { TicketType } from '../models/ticket-type';
import { switchMap, of, catchError } from 'rxjs';
import { AttendeesDataComponent } from './attendees-data/attendees-data.component.js';
import { PaymentMethodComponent } from './payment-method/payment-method.component.js';
type TicketWithAmount = TicketType & { amountSelected: number };

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, RouterLink, AttendeesDataComponent, PaymentMethodComponent],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})

export class CompraComponent {
  constructor(private eventService: EventService, private route: ActivatedRoute) {}
  event!: Event | null;
  // UI ticket type that includes a quantity selected by the user
  ticketTypes: TicketWithAmount[] = [];
  eventID!: number;
  state: number = 1; // 1: seleccionar tickets, 2: datos, 3: pago
  ticketAdded = false;
  ngOnInit(){

    // Get the future event, then fetch its ticket types.
    // Using `switchMap` avoids nested subscriptions and keeps a single stream.
    this.eventService.getFutureEvents()
      .pipe(
        switchMap((event) => {
          this.event = event;
          console.log('Loaded event', this.event);
          if (event && event.id) {
            return this.eventService.getTicketTypes(event.id);
          }
          return of([]);
        }),
        catchError((err) => {
          console.error('Error cargando ticketTypes o evento', err);
          return of([]);
        })
      )
      .subscribe({
        next: (types) => {
          const arr = types || [];
          this.ticketTypes = arr.map((t: TicketType) => ({ ...t, amountSelected: 0 }));
          console.log('Loaded ticket types', this.ticketTypes);
        },
        error: (err) => console.error(err)
      });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long'
    });
  }


  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  removeTicket(ticketType: TicketWithAmount) {
    if (ticketType.amountSelected > 0) {
    ticketType.amountSelected--;}
  }

  addTicket(ticketType: TicketWithAmount) {
    ticketType.amountSelected++;
    this.ticketAdded = true;
  }  

  calculateSubtotal(): number {
    let subtotal = 0;
    this.ticketTypes.forEach(tType => {
      subtotal += tType.amountSelected * tType.price;
    });
    return subtotal;
  }

  addState(): void {
    this.state++;
  }

  removeState(): void {
    if (this.state > 1)
    this.state--;
  }

}
