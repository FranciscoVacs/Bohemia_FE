import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgFor } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { ManageTickettypesComponent } from '../../manage-tickettypes/manage-tickettypes.component.js';
import { MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/select';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { EventService } from '../../core/services/event.service.js';
import { JWTService } from '../../core/services/jwt.service.js';
import { PurchaseService } from '../../core/services/purchase.service.js';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../login/login.component.js';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatStepperModule, MatOption, MatLabel, MatSelect, MatFormField, MatListModule, ManageTickettypesComponent, NgIf, NgSwitch, NgSwitchCase, NgFor],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {
  constructor(
    private route: ActivatedRoute, 
    private eventService: EventService,
    private purchaseService: PurchaseService, 
    public jwtService: JWTService){}

  readonly dialog = inject(MatDialog)

    event: any;
  eventID: any;
  ticketAmount: any;
  selectedTicketType: any;
  amounts: number[] = [1,2,3,4,5];
  state: number = 0;

  firstFormGroup  = new FormGroup ({
    firstCtrl: new FormControl('', Validators.required)
    })  
  secondFormGroup   = new FormGroup ({
    secondCtrl: new FormControl('', Validators.required)
    })

  ngOnInit(){
  this.route.params.subscribe( params => {
    this.eventID = params['eventID'];
   })

  this.eventService.getEventById(this.eventID)
  .subscribe(event => {
    this.event = event
  });
  }

  optSelected() {
    this.selectedTicketType = this.firstFormGroup.value.firstCtrl
  }

  amountSelected(){
    this.ticketAmount = this.secondFormGroup.value.secondCtrl
  }

  checkUserData(){
    if (this.jwtService.getToken()){
      this.postThePurchase()
    }
    else {
      this.openLogin()
    }
  }

  openLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {height: '80%', width: '50%',});
    dialogRef.afterClosed().subscribe(result => {
    if (this.jwtService.getToken()) {this.postThePurchase()}
  });
  }

  postThePurchase(){
    this.purchaseService.postPurchase(
    {
      ticketType_id: this.selectedTicketType.id, 
      ticket_quantity: this.ticketAmount, 
      user_id: this.jwtService.currentUserSig().id
    }).subscribe((res:any) => {alert('Compra realizada. Cantidad de tickets: ' + res.data.ticket_numbers)})
  }

}
