import { Component, inject } from '@angular/core';
import { UserService } from '../core/services/user.service.js';
import { JWTService } from '../core/services/jwt.service.js';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { LoginComponent } from '../login/login.component.js';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-purchases',
  standalone: true,
  imports: [NgIf, NgFor, MatDivider],
  templateUrl: './user-purchases.component.html',
  styleUrl: './user-purchases.component.scss'
})
export class UserPurchasesComponent {
  constructor(private router: Router,private userService: UserService, public jwtService: JWTService){}

  readonly dialog = inject(MatDialog)
  
  loginPrompt: boolean = false
  purchases : { cover_photo: string, event_name: string, event_date: string, ticketAmount: string, ticketTypeName: string, purchaseId: number}[] = []

  ngOnInit(){
    if(this.jwtService.getToken() !== null){
      this.loginPrompt = false
      this.userService.getUserPurchases(this.jwtService.currentUserSig().id)
      .subscribe(res => {
        res.purchase.forEach((purchase: any) => {
          this.purchases.push({
            event_name: purchase.ticket_type.event.event_name,
            cover_photo : purchase.ticket_type.event.cover_photo, 
            event_date : purchase.ticket_type.event.begin_datetime,
            ticketAmount : purchase.ticket_numbers,
            ticketTypeName : purchase.ticket_type.ticketType_name,
            purchaseId: purchase.id
          })
        })
      })
    }
    else {
      this.loginPrompt = true
    }
  }

  onPurchaseClicked(id: number){
    setTimeout(()=> this.router.navigate([`tickets`, {purchaseID: id}]));
  }

  openLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {height: '80%', width: '50%',});
    dialogRef.afterClosed().subscribe(result => {
    console.log(`Dialog result: ${result}`);
    });
  }
}
