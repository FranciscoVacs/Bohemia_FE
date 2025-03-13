import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogActions, MatDialogContent, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';  
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { UserService } from '../core/services/user.service.js';
import { DateService } from '../core/services/date.service.js';
import { catchError, EMPTY, of } from 'rxjs';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import {jwtDecode} from 'jwt-decode';
import { JWTService } from '../core/services/jwt.service.js';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [   NgIf,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatIcon, 
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor( 
    private jwtService: JWTService,
    private userService: UserService, 
    private dateService: DateService, 
    public dialogRef: MatDialogRef<LoginComponent>){}

  email: string = ''
  password: string = ''
  loginBool: boolean = true
  feedback: string = ''

  registerForm = new FormGroup({
    user_name: new FormControl<string>('', {nonNullable:true}),  
    user_surname: new FormControl<string>('', {nonNullable:true}),
    birth_date: new FormControl<Date>(new Date("0000-00-00T00:00:00"), {nonNullable:true}),
    email: new FormControl<string>('', {nonNullable:true}),
    password: new FormControl<string>('', {nonNullable:true})
  })

  register(){
    let formValues = this.registerForm.getRawValue()
    let formattedDate: string = this.dateService.formatDateTime(formValues.birth_date as Date,'00','00')
    let newUser = {
      "email" : formValues.email,
      "user_name" : formValues.user_name,
      "user_surname" : formValues.user_surname,
      "password" : formValues.password,
      "birth_date" : formattedDate
    }
    this.userService.registerUser(newUser).pipe(
      catchError(err => 
        {
          let error = err.error
          if (error[0]){this.feedback = error[0].message}
          else {this.feedback = error.message}
          return EMPTY}
        ))
      .subscribe((res:any) => {
          let token: string = res.headers.get('token')
          let decodedToken = jwtDecode(token)
          this.jwtService.setCurrentUser(decodedToken)
          this.jwtService.setToken(token)
          this.feedback = res.body.message + '!'
          setTimeout(()=>this.dialogRef.close(''), 1000)          
    })
  }

  login(){
    this.userService.logUser({"email": this.email, "password": this.password}).pipe(
      catchError(err => 
        {
          let error = err.error
          if (error[0]){this.feedback = error[0].message}
          else {this.feedback = error.message}
          return EMPTY}
        ))
      .subscribe((res:any) => {
          let token: string = res.headers.get('token')
          let decodedToken = jwtDecode(token)
          this.jwtService.setCurrentUser(decodedToken)
          this.jwtService.setToken(token)
          this.feedback = res.body.message + '!'
          setTimeout(()=>this.dialogRef.close(''), 1000)          
      })
  }
}
