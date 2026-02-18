import { Component, inject, signal, ViewChild, OnDestroy } from '@angular/core';
import { EventService } from '../services/event.service';
import { PurchaseService } from '../services/purchase.service.js';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { NavbarStateService } from '../services/navbar-state.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../models/event';
import { AdminTicketType, TicketType } from '../models/ticket-type';
import { switchMap, of, catchError } from 'rxjs';
import { AttendeesDataComponent } from './attendees-data/attendees-data.component.js';
import { PaymentMethodComponent } from './payment-method/payment-method.component.js';
import { CreatePurchaseDTO } from '../dto/purchase.dto.js';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component.js'
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
declare let L: any;
type TicketWithAmount = AdminTicketType & { amountSelected: number };

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, AttendeesDataComponent, PaymentMethodComponent],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})

export class CompraComponent implements OnDestroy {
  router = inject(Router);
  private eventService = inject(EventService);
  private purchaseService = inject(PurchaseService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private navbarState = inject(NavbarStateService);
  mapUrl: SafeResourceUrl = '';
  event!: Event | null;
  locationName: string = '';
  // UI ticket type that includes a quantity selected by the user
  ticketTypes: TicketWithAmount[] = [];
  eventID!: number;
  state: number = 1; // 1: seleccionar tickets, 2: datos, 3: pago
  ticketAdded = false;
  anySelected = true;
  loginRequired = false;
  actualTicketType = signal<TicketWithAmount | null>(null);
  timerDisplay: string = '10:00';
  private timerSeconds: number = 600;
  private timerInterval: any = null;
  @ViewChild(AttendeesDataComponent) child!: AttendeesDataComponent;


  ngOnInit() {
    this.navbarState.setPurchaseStep(this.state);

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
          this.ticketTypes = arr.map((t: AdminTicketType) => ({ ...t, amountSelected: 0 }));
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

        L.marker([lat, lng], { icon: redIcon }).addTo(this.map);
        this.map.getContainer().addEventListener('wheel', (e: any) => {
          if (e.ctrlKey) {
            e.preventDefault();
            this.map.scrollWheelZoom.enable();
          } else {
            this.map.scrollWheelZoom.disable();
          }
        }, { passive: false });
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
    if (ticketType.amountSelected > 0) {
      ticketType.amountSelected--;
    }
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

  createPurchase() {
    let tTypeAlreadySelected = false;
    this.ticketTypes.forEach(tType => {
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
        }
      });
    })
  }



  handleContinue(): void {
    this.loginRequired = false;
    const valid = this.checkFormState();
    if (!valid) return;
    if (this.state === 1 && !this.authService.isAuthenticated()) {
      this.loginRequired = true;
      this.modalService.openLogin();
      return;
    }
    this.addState();
  }

  addState(): void {
    if (this.state < 3) {
      this.state++;
      this.navbarState.setPurchaseStep(this.state);
      if (this.state === 3) {
        this.startTimer();
      }
    }
    else this.createPurchase();
  }

  removeState(): void {
    if (this.state > 1) {
      if (this.state === 3) {
        this.stopTimer();
      }
      this.state--;
      this.navbarState.setPurchaseStep(this.state);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.navbarState.clearPurchaseStep();
  }

  startTimer(): void {
    this.timerSeconds = 600;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();
      if (this.timerSeconds <= 0) {
        this.stopTimer();
        alert('El tiempo de reserva ha expirado. Serás redirigido al inicio.');
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay(): void {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
