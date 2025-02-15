import { Component, Input } from '@angular/core';
import {Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { EventService } from '../../core/services/event.service.js';
import { NgIf } from '@angular/common';
import { JWTService } from '../../core/services/jwt.service.js';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Event } from '../../core/entities';

@Component({
  selector: 'app-event-preview',
  standalone: true,
  imports: [NgIf, MatIconModule, MatButtonModule, MatCardModule, MatIcon],
  templateUrl: './event-preview.component.html',
  styleUrl: './event-preview.component.scss'
})
export class EventPreviewComponent {
  constructor(private router: Router, private eventService: EventService, public jwtService: JWTService ){}
 @Input() eventInput!: Event;

  onClicked(){
    setTimeout(()=> this.router.navigate([`event`, {eventID: this.eventInput.id}]));
  }

  onDelete(event: MouseEvent){
    console.log(typeof event)
    event.stopPropagation()
    this.eventService.deleteEvent(this.eventInput.id ?? 0)
    .subscribe({
        next: (value) => {alert("Evento eliminado")},
        error: (err) => {if(err.status===500)alert('Este evento tiene compras asociadas y no puede ser eliminado directamente.')}
  })
  }

  onUpdate(event: MouseEvent){
    console.log(typeof event)
    event.stopPropagation()
    setTimeout(()=> this.router.navigate([`manageevent`, {updating: true, eventID: this.eventInput.id}]));
  }
}
