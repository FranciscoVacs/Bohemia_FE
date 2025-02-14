import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListOfEventsComponent } from '../list-of-events/list-of-events.component.js';
import { LocationService } from '../../core/services/location.service.js';

@Component({
  selector: 'app-events-by-location',
  standalone: true,
  imports: [ListOfEventsComponent],
  templateUrl: './events-by-location.component.html',
  styleUrl: './events-by-location.component.scss'
})
export class EventsByLocationComponent {
  constructor(private route: ActivatedRoute, private locationService: LocationService){}

  locationID: number = 0;
  location: any;
  eventList: any[] = [];

  ngOnInit(){
  this.route.params.subscribe(params => {
    this.locationID = params['ID'];
  })

  this.locationService.getLocationById(this.locationID)
  .subscribe((location:any) => 
    {
      this.location = location
      this.eventList = location.event
    })
  }
}
