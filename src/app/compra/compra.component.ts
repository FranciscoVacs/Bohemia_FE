import { Component } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../models/event';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})
export class CompraComponent {
  constructor(private eventService: EventService, private route: ActivatedRoute) {}
  event!: Event | null;

  ngOnInit(){
  this.eventService.getEventById(Number(this.route.snapshot.paramMap.get('id'))).subscribe({
      next: (event) => {
        this.event = event;
        console.log(event.location)
      }})
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long'
    });
  }

  // Formatear hora
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
