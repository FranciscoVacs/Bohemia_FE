import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { JsonPipe, CommonModule } from '@angular/common';
import { EventPreviewComponent } from './event-comps/event-preview/event-preview.component';
import { HomeComponent } from './home/home.component.js';
import {MatButtonModule} from '@angular/material/button'; 
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {LoginComponent} from './login/login.component.js';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { JWTService } from './core/services/jwt.service.js';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { UserComponent } from './user/user.component.js';
import { AutocompleteComponent } from './autocomplete/autocomplete.component.js';
import { LocationService } from './core/services/location.service.js';
import { Location } from './core/entities';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, AutocompleteComponent, RouterOutlet, CommonModule, EventPreviewComponent, JsonPipe, HomeComponent, RouterLink, MatButtonModule, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public jwtService: JWTService, public locationService: LocationService) {}

  locationList: Location[] = [];
  readonly dialog = inject(MatDialog)

  arr = [
    {name: "Eventos", route: ""},
    {name: "Mis Compras", route: "/purchases"},
    {name: "Crear evento", route: "/manageevent"}
  ]
  title = 'QRera-FE';

  ngOnInit(){
    let token: string | null = this.jwtService.getToken()

    this.locationService.getLocations()
    .subscribe(locations => {
    this.locationList = locations
    })
    
    if(token){
      let decodedToken: JwtPayload = jwtDecode(token)
      let isTokenExpired: boolean = (decodedToken.exp?? 0) * 1000 < Date.now()
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

      dialogRef.afterClosed().subscribe(result => {});
    }

    openUser(){
      const dialogRef = this.dialog.open(UserComponent, {height: '80%', width: '50%',});

      dialogRef.afterClosed().subscribe(result => {});
    }

}