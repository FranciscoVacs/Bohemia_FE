import { Component, Input, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Router } from '@angular/router';
import { CityService } from '../core/services/city.service.js';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent {
  constructor(private router: Router, private cityService: CityService){}

  @Input() locationList: any;
  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions?: Observable<string[]>;
  cityList: any;
  optionName: string = '';
  targetRoute: string ='';
  foundValue: any;
  targetID: number = 0;

  ngOnInit() {
    this.cityService.getCities().subscribe( cities => {
      this.cityList = cities;
      this.options = this.cityList.map((city: any) => city.city_name)
      .concat(this.locationList.map((location: any) => location.location_name));
    }) 

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onOptionSelected(event:any){
    this.optionName = event.option.value;
    this.foundValue = this.locationList.find((loc:any) => loc.location_name === this.optionName)
    if (this.foundValue) {
      this.targetRoute = 'location';
      this.targetID = this.foundValue.id
    }
    else {
      this.foundValue = this.cityList.find((city:any) => city.city_name === this.optionName)
      if (this.foundValue) {
        this.targetRoute = 'city';
        this.targetID = this.foundValue.id
       }
      else {
        this.targetRoute = '';
       }    
    }
    this.onSearchPrompted()
  }

  onSearchPrompted(){
    if (this.targetRoute === '')
    setTimeout(()=> this.router.navigate([`${this.targetRoute}`]), 1000);
    else 
    setTimeout(()=> this.router.navigate([`${this.targetRoute}`, {ID: this.targetID}]), 1000);
  }

}
