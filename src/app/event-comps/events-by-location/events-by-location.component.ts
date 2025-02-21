import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListOfEventsComponent } from '../list-of-events/list-of-events.component.js';
import { LocationService } from '../../core/services/location.service.js';
import { Location } from '../../core/entities';

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
  location!: Location;

  ngOnInit(){
  this.route.params.subscribe(params => {
    this.locationID = params['ID'];
  })

  this.locationService.getLocationById(this.locationID)
  .subscribe((location:Location) => 
    {
      this.location = location
    })
  }
}
