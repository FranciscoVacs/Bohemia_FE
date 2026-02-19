import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventService } from '../services/event.service';
import { Event } from '../models/event';

@Component({
    selector: 'app-home',
    imports: [CommonModule, HeroComponent, EventCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  nextEvent: Event | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadNextEvent();
  }

  loadNextEvent() {
    this.eventService.getFutureEvents().subscribe({
      next: (event) => {
        this.nextEvent = event;
      },
      error: (err) => {
        console.error('Error cargando evento:', err);
      }
    });
  }
}
