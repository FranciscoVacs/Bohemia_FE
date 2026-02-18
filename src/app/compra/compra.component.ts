import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { EventService } from '../services/event.service';
import { PurchaseService } from '../services/purchase.service';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../models/event';
import { AdminTicketType, TicketType } from '../models/ticket-type';
import { switchMap, of, catchError } from 'rxjs';
import { AttendeesDataComponent } from './attendees-data/attendees-data.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { CreatePurchaseDTO } from '../dto/purchase.dto';
import {UserDropdownComponent} from '../user-dropdown/user-dropdown.component'
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
declare let L: any;
type TicketWithAmount = AdminTicketType & { amountSelected: number };
// 1: seleccionar tickets, 2: datos, 3: pago
enum PurchaseStep {
  Tickets = 1,
  AttendeeData = 2,
  Payment = 3,
}

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
  private modalService = inject(ModalService);
  mapUrl: SafeResourceUrl = '';
  event!: Event | null;
  locationName: string  = '';
  // UI ticket type that includes a quantity selected by the user
  ticketTypes = signal<TicketWithAmount[]>([]);
  subtotal = computed(() => {
  return this.ticketTypes().reduce((sum, tType) => {
    return sum + tType.amountSelected * tType.price;
    }, 0);
  });
  eventID!: number;
  PurchaseStep = PurchaseStep; // Exponer enum al template  
  state: PurchaseStep = PurchaseStep.Tickets;
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
          this.ticketTypes.set(arr.map((t: AdminTicketType) => ({ ...t, amountSelected: 0 })));
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


        const redIcon = L.icon({
          iconUrl: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
          iconSize: [27, 43],
          iconAnchor: [13, 43],  
        });
        this.map = L.map('map', { scrollWheelZoom: false }).setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        L.marker([lat, lng], { icon: redIcon}).addTo(this.map);
        this.map.getContainer().addEventListener('wheel', (e:any) => {
          if (e.ctrlKey) {
            e.preventDefault();    
            this.map.scrollWheelZoom.enable();
          } else {
            this.map.scrollWheelZoom.disable();
          }
        },{ passive: false });
      })
      .catch(err => console.error('Error fetching geocoding data', err));
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
  this.ticketTypes.update(list =>
    list.map(t =>
      t.id === ticketType.id && t.amountSelected > 0
        ? { ...t, amountSelected: t.amountSelected - 1 }
        : t
    )
  );
}

addTicket(ticketType: TicketWithAmount) {
  this.ticketTypes.update(list =>
    list.map(t =>
      t.id === ticketType.id
        ? { ...t, amountSelected: t.amountSelected + 1 }
        : t
    )
  );
  this.ticketAdded = true;
}

  calculateServiceFee(): number {
     return this.subtotal() * 0.1
  }
  calculateTotal(): number {
    return this.subtotal() + this.calculateServiceFee();
  }

  createPurchase(){
    let tTypeAlreadySelected = false;
    this.ticketTypes().forEach(tType => { 
    if (tTypeAlreadySelected) return;
    if (tType.amountSelected === 0) return; 
    else tTypeAlreadySelected = true;
    const purchaseDTO: CreatePurchaseDTO = {
    ticketQuantity: tType.amountSelected,
    ticketTypeId: tType.id,
    }

    this.purchaseService.createPurchase(purchaseDTO).pipe(switchMap((purchaseResponse) => {
      const purchase = purchaseResponse.data;  
      return this.purchaseService.createPreference(
      purchase.id)
      })).subscribe({
        next: (res) => {
          window.location.href = res.init_point;
        },
        error: (err) => {
          console.log('Error creating preference', err);
      }});
    })
  }



  handleContinue(): void {
    this.loginRequired = false;
    const valid = this.checkFormState();
    if (!valid) return;
    if (this.state === PurchaseStep.Tickets && !this.authService.isAuthenticated()) {
      this.loginRequired = true;
      this.modalService.openLogin();
      return;
    }
    this.addState();
  }

  addState(): void {
    if (this.state < PurchaseStep.Payment) this.state++;
    else this.createPurchase();
  }

  removeState(): void {
    if (this.state > PurchaseStep.Tickets)
    this.state--;
  }

  checkFormState(): boolean {
    if (this.state === PurchaseStep.Tickets) {
      this.anySelected = this.ticketTypes().some(t => t.amountSelected > 0);
      return this.anySelected;
    }
    else if (this.state === PurchaseStep.AttendeeData) {
    return this.child.checkInputs()
    }
    else 
      return true;
    }

    checkTicketType(ticketType: TicketWithAmount): boolean {
      return ticketType.availableTickets <= 0;
    }
}
