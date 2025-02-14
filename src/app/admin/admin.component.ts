import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DjService } from '../core/services/dj.service.js';
import { CityService } from '../core/services/city.service.js';
import { NgIf, NgFor } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, MatFormField, MatLabel, MatButton, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  constructor(private djService: DjService, private cityService: CityService){}

  cityOption:number = 0
  djOption: number = 0

  actualCity:any
  actualdj:any

  citiesIDs: number[] = []
  djIDs: number[] = []

  
  cityFormGroup  = new FormGroup ({
    city_name: new FormControl('', Validators.required),
    province: new FormControl('', Validators.required),
    zip_code: new FormControl('', [Validators.required, Validators.min(0)]),
    })  

  djFormGroup  = new FormGroup ({
    dj_name: new FormControl('', Validators.required),
    dj_surname: new FormControl('', Validators.required),
    dj_apodo: new FormControl('', Validators.required),
    })  

  getcitybyid = new FormControl('', [Validators.required, Validators.min(0)]);
  getdjbyid = new FormControl('', [Validators.required, Validators.min(0)]);
  
  ngOnInit(){
    this.cityService.getCities().subscribe(res => {console.log(res)
      res.forEach((city:any) => {
        this.citiesIDs.push(city.id)        
      });
    })
    this.djService.getDJs().subscribe(res=>{console.log(res)
      res.forEach((dj:any) => {
        this.djIDs.push(dj.id)        
      });
    })
  }

  loadCity(){
    let city = {
      city_name: this.cityFormGroup.value.city_name,
      province: this.cityFormGroup.value.province,
      zip_code: this.cityFormGroup.value.zip_code
    }     
    this.cityService.postCity(city).subscribe(res=>{ this.citiesIDs.push(res.data.id)})
  }

  loaddj(){
    let dj = {
      dj_name: this.djFormGroup.value.dj_name,
      dj_surname: this.djFormGroup.value.dj_surname,
      dj_apodo: this.djFormGroup.value.dj_apodo
    }   
    this.djService.postDJ(dj).subscribe(res=>{this.djIDs.push(res.data.id)})
  }
  
  getcity(){
    let id = this.inputNumber(this.getcitybyid.value)
    this.cityService.getCityById(id).subscribe(res => {this.actualCity = res})
  }

  getdj(){
    let id = this.inputNumber(this.getdjbyid.value)
    this.djService.getDJById(id).subscribe(res => {this.actualdj = res})
  }

  updatecity(){
    let id = this.inputNumber(this.getcitybyid.value)
    let city = {
      city_name: this.cityFormGroup.value.city_name,
      province: this.cityFormGroup.value.province,
      zip_code: this.cityFormGroup.value.zip_code
    }     
    this.cityService.updateCityById(city, id).subscribe(res=>{})
  }

  updatedj(){
    let id = this.inputNumber(this.getdjbyid.value)
    let dj = {
      dj_name: this.djFormGroup.value.dj_name,
      dj_surname: this.djFormGroup.value.dj_surname,
      dj_apodo: this.djFormGroup.value.dj_apodo
    }   
    this.djService.updateDJById(dj, id).subscribe(res=>{})
  }

  deletecity(){
    let id = this.inputNumber(this.getcitybyid.value)
    this.cityService.deleteCity(id).subscribe(res=>{ this.citiesIDs.splice(id as number,1)})
  }

  deletedj(){
    let id = this.inputNumber(this.getdjbyid.value)
    this.djService.deleteDJ(id).subscribe(res=>{ this.djIDs.splice(id as number,1)})
  }

  check(opt:number){
    return (opt !== 0);
  }
  
  inputNumber(value: any){
    let id
    if (value) {
      id = +value
    }     
    return id
  }
}
