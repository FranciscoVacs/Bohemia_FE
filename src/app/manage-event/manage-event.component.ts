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
import { Event, Dj, TicketType, Location, Ticket } from '../core/entities';

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
  event!: Event;
  newEvent!:Event;
  ticketTypeList: TicketType[] = [];
  locationList!: Location[];
  djList!: Dj[];
  selectedFile: any;
  
  eventForm = new FormGroup ({
    event_name: new FormControl<string>('', {nonNullable:true,validators:Validators.required}),  
    begin_datetime: new FormControl<Date>(new Date("0000-00-00T00:00:00"), {nonNullable:true,validators:Validators.required}),
    finish_datetime: new FormControl<Date>(new Date("0000-00-00T00:00:00"), {nonNullable:true,validators:Validators.required}),
    event_description: new FormControl<string>('', {nonNullable:true,validators:Validators.required}),
    min_age: new FormControl<number>(1),
    location: new FormControl(),
    dj: new FormControl<Dj|undefined>(undefined, {nonNullable:true, validators:Validators.required}),
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
        this.eventForm.patchValue({
          event_name: this.event.event_name, 
          event_description: this.event.event_description, 
          min_age: this.event.min_age, 
          location: null, 
          ticketType: 'Value'})
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

  updateTicketList(ticketList: TicketType[]){
    this.ticketTypeList = ticketList
    if (this.ticketTypeList){
      this.eventForm.patchValue({ticketType: 'Value'})
    }
  }

  onSubmitEvent() {
    let minage: number = 1
    let formValues = this.eventForm.getRawValue()
    if (formValues.min_age) {
      minage = +formValues.min_age
    }

    this.event = 
    {
     "event_name": formValues.event_name,
     "begin_datetime": this.dateService.formatDateTime(formValues.begin_datetime, this.selectedStartHour, this.selectedStartMinute),
     "finish_datetime":this.dateService.formatDateTime(formValues.finish_datetime, this.selectedFinishHour, this.selectedFinishMinute),
     "event_description": formValues.event_description,
     "min_age": minage,
     "location": formValues.location,
     "dj": formValues.dj,
     "cover_photo": '',
     "tickets_on_sale": 0,
     "ticketType": []
    }
    console.log(this.event.begin_datetime)
    console.log(typeof this.event.begin_datetime)
    
    let formdata = new FormData();
    formdata.append('event_name', this.event.event_name)
    formdata.append('begin_datetime',this.event.begin_datetime)
    formdata.append('finish_datetime',this.event.finish_datetime)
    formdata.append('event_description',this.event.event_description)
    formdata.append('min_age', String(this.event.min_age))
    formdata.append('cover_photo', this.selectedFile, this.selectedFile.name);
    formdata.append('location', String(this.event.location))
    formdata.append('dj', String(this.event.dj))

    formdata.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    if (this.updating){
      this.eventService.updateEvent(formdata, this.eventID).subscribe
      (updatedEvent => {
        this.postTicketTypes('actualizado', this.eventID)  
      }) 
    }
    else {
      this.eventService.postEvent(formdata).subscribe
      ((postedEvent: Event)=> 
        {
        this.postTicketTypes('cargado', postedEvent.id?? 0)
      }) 
    } 
  }

  postTicketTypes(loadOrUpdate:string, id: number){
      
      this.ticketTypeList.forEach((ticketType: TicketType, index: number) => {
      ticketType.event = id; 
      this.ticketTypeService.postTicketType(ticketType, id).subscribe
      (ticketType => 
        { 
          if (index+1===this.ticketTypeList.length){if(loadOrUpdate){alert(`Evento ${loadOrUpdate} con éxito`)}}
        })
      });
  }
}
