import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Event } from '../models/event.js';
import { CapitalizePipe } from '../pipes/capitalize.pipe.js';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, CapitalizePipe, RouterModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent {
  // El evento viene del componente padre
  @Input() event!: Event;

  // Formatear fecha para mostrar
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