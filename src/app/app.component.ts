import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { JsonPipe, CommonModule } from '@angular/common';
import { EventPreviewComponent } from './event-comps/event-preview/event-preview.component';
import { HomeComponent } from './home/home.component.js';
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {LoginComponent} from './login/login.component.js';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { JWTService } from './core/services/jwt.service.js';
import { jwtDecode } from 'jwt-decode';
import { UserService } from './core/services/user.service.js';
import { UserComponent } from './user/user.component.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterOutlet, CommonModule, EventPreviewComponent, JsonPipe, HomeComponent, RouterLink, MatTabsModule, MatButtonModule, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public jwtService: JWTService) {}

  readonly dialog = inject(MatDialog)

  arr = [
    {link: "Eventos", route: ""},
    {link: "Mis entradas", route: "/purchases"},
    {link: "Crear evento", route: "/manageevent"}
  ]
  activeLink = this.arr[0].link;
  title = 'QRera-FE';

  ngOnInit(){
    let token = this.jwtService.getToken()
    if(token){
      let decodedToken: any = jwtDecode(token)
      let isTokenExpired: boolean = decodedToken.exp * 1000 < Date.now()
      if (!isTokenExpired){
        this.jwtService.setCurrentUser(decodedToken)
      }
      else {
        this.jwtService.unloadUser()
      }
    }
  }

    openLogin() {
      const dialogRef = this.dialog.open(LoginComponent, {height: '100%', width: '50%',});

      dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
    }

    openUser(){
      const dialogRef = this.dialog.open(UserComponent, {height: '80%', width: '50%',});

      dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      });
    }

}