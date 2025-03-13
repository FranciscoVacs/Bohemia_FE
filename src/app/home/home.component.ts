import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { JsonPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { EventPreviewComponent } from '../event-comps/event-preview/event-preview.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { ListOfEventsComponent } from '../event-comps/list-of-events/list-of-events.component.js';
import { SwiperComponent } from '../swiper/swiper.component.js';
import { EventService } from '../core/services/event.service.js';
import { LocationService } from '../core/services/location.service.js';
import { NgFor } from '@angular/common';
import { Event, Location } from '../core/entities';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, EventPreviewComponent, AutocompleteComponent, ListOfEventsComponent, JsonPipe, NgFor, SwiperComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

export class HomeComponent {
  isBrowser: boolean = false;
  constructor(private eventService: EventService, private locationService: LocationService, @Inject(PLATFORM_ID) private platformId: object)
  {this.isBrowser = isPlatformBrowser(platformId)}
  
  eventsLoaded: boolean = false;
  eventList: Event[] = [];
  locationList: Location[] = [];
  position = 1;
  intervalId!: number;

  ngOnInit(){
      this.loadEvents();
    }

    loadEvents(){
      this.eventService.getEvents()
      .subscribe(events => {
      this.eventList = events
      })
      this.locationService.getLocations()
      .subscribe(locations => {
      this.locationList = locations
      })
    }
}
