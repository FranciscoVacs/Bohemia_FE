import { Component, inject, ViewChild } from '@angular/core';
import { EventService } from '../services/event.service';
import { PurchaseService } from '../services/purchase.service.js';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../models/event';
import { TicketType } from '../models/ticket-type';
import { switchMap, of, catchError } from 'rxjs';
import { AttendeesDataComponent } from './attendees-data/attendees-data.component.js';
import { PaymentMethodComponent } from './payment-method/payment-method.component.js';
import { CreatePurchaseDTO } from '../dto/purchase.dto.js';
import {UserDropdownComponent} from '../user-dropdown/user-dropdown.component.js'
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
declare let L: any;
type TicketWithAmount = TicketType & { amountSelected: number };

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, RouterLink, AttendeesDataComponent, PaymentMethodComponent, UserDropdownComponent],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})

export class CompraComponent {
  router = inject(Router);
  private eventService = inject(EventService);
  private purchaseService = inject(PurchaseService);
  private authService = inject(AuthService);
  mapUrl: SafeResourceUrl = '';
  event!: Event | null;
  locationName: string  = '';
  purchaseError: string | null = null;
  purchaseComplete: boolean = false;
  // UI ticket type that includes a quantity selected by the user
  ticketTypes: TicketWithAmount[] = [];
  eventID!: number;
  state: number = 1; // 1: seleccionar tickets, 2: datos, 3: pago
  ticketAdded = false;
  anySelected = true;
  loginRequired = false;
  
  @ViewChild(AttendeesDataComponent) child!: AttendeesDataComponent ;


  ngOnInit(){

    // Get the future event, then fetch its ticket types.
    // Using `switchMap` avoids nested subscriptions and keeps a single stream.
    this.eventService.getFutureEvents()
      .pipe(
        switchMap((event) => {
          this.event = event;
          this.locationName = event.location!.locationName
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
          // Initialize map after event and template have rendered
          setTimeout(() => this.showMap(), 0);
        },
        error: (err) => console.error(err)
      });
      
  }

  // Leaflet map instance
  private map: any = null;

  showMap() {
    if (!this.event || !this.event.location) {
      console.warn('showMap: event or location not available yet');
      return;
    }

    const query = `${this.event.location.address} ${this.event.location.city.cityName}`;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (!data || !data.length) { console.warn('No location found for query', query); return; }

        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);

        // Remove existing map instance if present
        try {
          if (this.map) {
            this.map.remove();
            this.map = null;
          }
        } catch (e) {
          console.warn('Error removing existing map', e);
        }

        this.map = L.map('map', { zoomControl: true }).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        L.marker([lat, lng]).addTo(this.map);
      })
      .catch(err => console.error('Error fetching geocoding data', err));
  }
  
  createPurchase(){
    this.purchaseError = null;
    this.ticketTypes.forEach(tType => { 
    if (tType.amountSelected === 0) return;
    const purchaseDTO: CreatePurchaseDTO = {
    ticketQuantity: tType.amountSelected,
    ticketTypeId: tType.id,
    }
    console.log(purchaseDTO.ticketQuantity, " ", purchaseDTO.ticketTypeId);

    this.purchaseService.createPurchase(purchaseDTO).subscribe({
        next: (response) => {
          console.log('Purchase created', response);
          this.purchaseComplete = true;
          this.purchaseError = null;
          this.router.navigate(['/']);

        },
        error: (err) => {
          this.purchaseError = err?.error?.message || 'Error al crear la compra.';
          this.purchaseComplete = false;
        }
      })
    })
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

  calculateServiceFee(): number {
     return this.calculateSubtotal() * 0.1
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    this.ticketTypes.forEach(tType => {
      subtotal += tType.amountSelected * tType.price;
    });
    return subtotal;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateServiceFee();
  }

  addState(): void {
    if (this.state < 3) this.state++;
    else this.createPreference();
  }

  createPreference(): void {
    console.log("hello");
    this.purchaseService.createPreference({
      ticketTypeName: this.ticketTypes[2].ticketTypeName,
      ticketNumbers: this.ticketTypes[2].amountSelected,
      price: this.ticketTypes[2].price}).subscribe({
        next: (res) => {
          window.location.href = res.init_point;
        },
        error: (err) => {          console.error('Error creating preference', err);
        }
      })
  }

  handleContinue(): void {
    this.loginRequired = false;
    const valid = this.checkFormState();
    if (!valid) return;
    if (this.state === 2 && !this.authService.isAuthenticated()) {
      this.loginRequired = true;
      return;
    }
    this.addState();
  }

  removeState(): void {
    if (this.state > 1)
    this.state--;
  }

  checkFormState(): boolean {
    if (this.state === 1) {
      this.anySelected = this.ticketTypes.some(t => t.amountSelected > 0);
      return this.anySelected;
    }
    else if (this.state === 2) {
    return this.child.checkInputs()
    }
    else 
      return true;
    
  }
}
