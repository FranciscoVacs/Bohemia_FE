import { Component, inject, signal, computed, ViewChild, OnDestroy } from '@angular/core';
import { EventService } from '../services/event.service';
import { PurchaseService } from '../services/purchase.service';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { NavbarStateService } from '../services/navbar-state.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Event } from '../models/event';
import { AdminTicketType, TicketType } from '../models/ticket-type';
import { switchMap, of, catchError } from 'rxjs';
import { AttendeesDataComponent } from './attendees-data/attendees-data.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { CreatePurchaseDTO } from '../dto/purchase.dto';
import { UserDropdownComponent } from '../user-dropdown/user-dropdown.component';
import { Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import * as L from 'leaflet';

type TicketWithAmount = AdminTicketType & { amountSelected: number };

export enum PurchaseStep {
  Tickets = 1,
  AttendeeData = 2,
  Payment = 3,
}

@Component({
  selector: 'app-compra',
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
          this.ticketTypes.set(arr.map((t: AdminTicketType) => ({ ...t, amountSelected: 0 })));
          // Initialize map after event and template have rendered
          setTimeout(() => this.showMap(), 0);
        },
        error: (err) => console.error(err)
      });
  }

  // Leaflet map instance
  private map: L.Map | null = null;

  showMap() {
    console.log(this.event?.location);

    if (!this.event?.location?.latitude || !this.event?.location?.longitude) {
      console.warn('Coordinates not available');
      return;
    }
    const lat = Number(this.event.location.latitude);
    const lng = Number(this.event.location.longitude);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates:', lat, lng);
      return;
    }

    // Remove existing map safely
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const redIcon = L.icon({
      iconUrl: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
      iconSize: [27, 43],
      iconAnchor: [13, 43],
    });

    this.map = L.map('map', {
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([lat, lng], { icon: redIcon }).addTo(this.map);

    // Zoom only when CTRL is pressed
    this.map?.getContainer().addEventListener(
      'wheel',
      (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          this.map?.scrollWheelZoom.enable();
        } else {
          this.map?.scrollWheelZoom.disable();
        }
      },
      { passive: false }
    );
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

  createPurchase() {
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
        return this.purchaseService.createPreference(purchase.id)
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

    // Check authentication specifically at the Ticket selection step
    if (this.state === PurchaseStep.Tickets && !this.authService.isAuthenticated()) {
      this.loginRequired = true;
      this.modalService.openLogin();
      return;
    }
    this.addState();
  }

  addState(): void {
    if (this.state < PurchaseStep.Payment) {
      this.state++;
      this.navbarState.setPurchaseStep(this.state);
      if (this.state === PurchaseStep.Payment) {
        this.startTimer();
      }
    }
    else {
      this.createPurchase();
    }
  }

  removeState(): void {
    if (this.state > PurchaseStep.Tickets) {
      if (this.state === PurchaseStep.Payment) {
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
