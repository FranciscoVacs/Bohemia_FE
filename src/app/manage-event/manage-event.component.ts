import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { ManageTickettypesComponent } from '../manage-tickettypes/manage-tickettypes.component.js';
import { TicketTypeService } from '../core/services/ticket-type.service.js';
import { EventService } from '../core/services/event.service.js';
import { LocationService } from '../core/services/location.service.js';
import { DjService } from '../core/services/dj.service.js';
import { DateService } from '../core/services/date.service.js';

@Component({
  selector: 'app-manage-event',
  standalone: true,
  imports: [ReactiveFormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, FormsModule, ManageTickettypesComponent],
  templateUrl: './manage-event.component.html',
  styleUrl: './manage-event.component.scss',

})
export class ManageEventComponent {
  constructor
  (
    private route: ActivatedRoute, 
    private ticketTypeService: TicketTypeService, 
    private locationService: LocationService, 
    private djService: DjService, 
    private eventService: EventService,
    private dateService: DateService,
  ){}

  selectedStartHour: string = '00'
  selectedStartMinute: string = '00'
  selectedFinishHour: string = '00'
  selectedFinishMinute: string = '00'
  atLeastOneticket: boolean = true;
  updating: boolean = false;
  eventID: number = 0;
  hours: string[] = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
  minutes: string[] = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
  event: any;
  newEvent:any;
  ticketList: any;
  locationList: any;
  djList: any;
  selectedFile: any;
  
  eventForm = new FormGroup ({
    event_name: new FormControl('', Validators.required),  
    begin_datetime: new FormControl('', Validators.required),
    finish_datetime: new FormControl('', Validators.required),
    event_description: new FormControl(''),
    min_age: new FormControl(''),
    location: new FormControl('', Validators.required),
    dj: new FormControl('', Validators.required),
    ticketType: new FormControl('', Validators.required),
  })

  ngOnInit(){
    this.setDefaultFile()

    this.route.params.subscribe( params => {
      this.updating = params['updating'];
      this.eventID = params['eventID']
    })
    if (this.updating){
      this.eventService.getEventById(this.eventID)
      .subscribe( (event) => {
        this.event = event
        this.eventForm
          .patchValue({event_name: this.event.event_name, event_description: this.event.event_description, 
          min_age: this.event.min_age, location: this.event.location.location_name, ticketType: 'Value'})
      })}
    this.locationService.getLocations()
    .subscribe(locations => {
    this.locationList = locations
    })
    this.djService.getDJs()
    .subscribe(DJs => {
    this.djList = DJs
    })
  }

  async setDefaultFile(){
    try {
      const response = await fetch('../../assets/no-image-icon.png');
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      this.selectedFile = new File([blob], 'no-image-icon.png', { type: blob.type });
    } catch (error) {
        throw error;
    }
}

  onFileSelected(event: any){
    if (event.target.files[0]) 
    this.selectedFile = event.target.files[0] 
  }

  updateTicketList(ticketList: any){
    this.ticketList = ticketList
    if (this.ticketList){
      this.eventForm.patchValue({ticketType: 'Value'})
    }
  }

  onSubmitEvent() {
    let minage: number = 1

    if (this.eventForm.value.min_age) {
      minage = +this.eventForm.value.min_age
    }
    
    this.event = 
    {
     "event_name": this.eventForm.value.event_name,
     "begin_datetime": this.dateService.formatDateTime(this.eventForm.value.begin_datetime, this.selectedStartHour, this.selectedStartMinute),
     "finish_datetime":this.dateService.formatDateTime(this.eventForm.value.finish_datetime, this.selectedFinishHour, this.selectedFinishMinute),
     "event_description": this.eventForm.value.event_description,
     "min_age": minage,
     "location": this.eventForm.value.location,
     "dj": this.eventForm.value.dj,
    }
    let formdata = new FormData();
    formdata.append('event_name', this.event.event_name)
    formdata.append('begin_datetime',this.event.begin_datetime)
    formdata.append('finish_datetime',this.event.finish_datetime)
    formdata.append('event_description',this.event.event_description)
    formdata.append('min_age',this.event.min_age)
    formdata.append('cover_photo', this.selectedFile, this.selectedFile.name);
    formdata.append('location',this.event.location)
    formdata.append('dj',this.event.dj)

    if (this.updating){
      this.eventService.updateEvent(formdata, this.eventID).subscribe
      (updatedEvent => {
        this.postTicketTypes('actualizado', this.eventID)  
      }) 
    }
    else {
      this.eventService.postEvent(formdata).subscribe
      (postedEvent=> 
        {
        this.postTicketTypes('cargado', postedEvent.id)

      }) 
    } 
  }

  postTicketTypes(loadOrUpdate:string, id: number){
      
      this.ticketList.forEach((ticket: any, index: number) => {
      ticket.begin_datetime = this.dateService.formatDateTime(ticket.begin_datetime, '00', '00')
      ticket.finish_datetime = this.dateService.formatDateTime(ticket.finish_datetime, '00', '00')
      ticket.event = id;
      this.ticketTypeService.postTicketType(ticket, id).subscribe
      (ticketType => 
        { 
          if (index+1===this.ticketList.length){if(loadOrUpdate){alert(`Evento ${loadOrUpdate} con éxito`)}}
        })
      });
  }
}
