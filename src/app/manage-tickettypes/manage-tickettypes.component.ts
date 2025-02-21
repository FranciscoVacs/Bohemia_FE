import { Component, signal, Output, Input, EventEmitter } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, CommonModule } from '@angular/common';
import { Ticket, TicketType } from '../core/entities';



@Component({
  selector: 'app-manage-tickettypes',
  standalone: true,
  imports: [NgIf, CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatExpansionModule, MatButtonModule, MatFormFieldModule, MatDatepickerModule, MatInputModule],
  templateUrl: './manage-tickettypes.component.html',
  styleUrl: './manage-tickettypes.component.scss'
})
export class ManageTickettypesComponent {
  
  readonly panelOpenState = signal(false);
  @Input() tickettypes: TicketType[] = [];
  newTicketTypes: TicketType[] = []
  isFormActivated: boolean = false;
  @Input() isEditable: boolean = true;
  @Output() ticketListEvent = new EventEmitter<TicketType[]>();

  tickettypeForm = new FormGroup ({
    ticketType_name: new FormControl('', {nonNullable:true, validators: Validators.required}),  
    begin_datetime: new FormControl('', {nonNullable:true, validators: Validators.required}),
    finish_datetime: new FormControl('', {nonNullable:true, validators: Validators.required}),
    price: new FormControl('', {nonNullable:true, validators: [Validators.required, Validators.min(0)]}),
    max_quantity: new FormControl(0, {nonNullable:true, validators: [Validators.required, Validators.min(0)]}),
  })


  toggleForm(){
    this.isFormActivated = !this.isFormActivated
  }


  onSubmitTickettype() {
    let price: number = 0;
    if (this.tickettypeForm.value.price) {
      price = +this.tickettypeForm.value.price
    }
    let formValues = this.tickettypeForm.getRawValue()
    let ticketType = {
      "ticketType_name": formValues.ticketType_name,
      "begin_datetime": formValues.begin_datetime,
      "finish_datetime": formValues.finish_datetime,
      "price": price,
      "max_quantity": formValues.max_quantity,
      "available_tickets": 0,
      "purchase": []
    }
    this.newTicketTypes.push(ticketType)
    if (this.tickettypes){
    this.tickettypes.push(ticketType)}
    this.sendTicketList()
  }

  sendTicketList(){
    this.ticketListEvent.emit(this.newTicketTypes)
  }
}
