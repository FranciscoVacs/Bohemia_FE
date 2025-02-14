import { Component } from '@angular/core';
import { JsonPipe, CommonModule } from '@angular/common';
import { EventPreviewComponent } from '../event-comps/event-preview/event-preview.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { ListOfEventsComponent } from '../event-comps/list-of-events/list-of-events.component.js';
import { EventService } from '../core/services/event.service.js';
import { LocationService } from '../core/services/location.service.js';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, EventPreviewComponent, AutocompleteComponent, ListOfEventsComponent, JsonPipe, NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private eventService: EventService, private locationService: LocationService){}
  
  eventsLoaded: boolean = false;
  eventList: any = [];
  locationList: any = [];

  images = [
    'assets/@dolciraw-034.jpg',    'assets/@dolciraw-037.jpg',    'assets/@dolciraw-216.jpg',    'assets/@dolciraw-228.jpg',
    'assets/@dolciraw-038.jpg',    'assets/@dolciraw-048.jpg',    'assets/@dolciraw-050.jpg',    'assets/@dolciraw-051.jpg',
    'assets/@dolciraw-055.jpg',    'assets/@dolciraw-060.jpg',    'assets/@dolciraw-065.jpg',    'assets/@dolciraw-066.jpg',
    'assets/@dolciraw-166.jpg',    'assets/@dolciraw-167.jpg',    'assets/@dolciraw-168.jpg',    'assets/@dolciraw-172.jpg',
    'assets/@dolciraw-174.jpg',    'assets/@dolciraw-179.jpg',    'assets/@dolciraw-181.jpg',    'assets/@dolciraw-185.jpg',
    'assets/@dolciraw-186.jpg',    'assets/@dolciraw-197.jpg',    'assets/@dolciraw-198.jpg',    'assets/@dolciraw-201.jpg',
    'assets/@dolciraw-202.jpg',    'assets/@dolciraw-209.jpg',    'assets/@dolciraw-210.jpg',    'assets/@dolciraw-211.jpg',
    'assets/@dolciraw-212.jpg',    'assets/@dolciraw-215.jpg'
  ]
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
