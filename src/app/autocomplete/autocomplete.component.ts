import { Component, Input, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Router } from '@angular/router';
import { CityService } from '../core/services/city.service.js';
import { City, Location } from '../core/entities';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, MatButtonModule, MatIconModule, AsyncPipe],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent {
  constructor(private router: Router, private cityService: CityService){}

  @Input() locationList: Location[] = [];
  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions?: Observable<string[]>;
  cityList: City[] = [];
  optionName: string = '';
  targetRoute: string ='';
  foundLocation: Location | undefined;
  foundCity: City | undefined;
  targetID: number | undefined = 0;

  ngOnInit() {
    this.cityService.getCities().subscribe( cities => {
      this.cityList = cities;
      this.options = this.cityList.map((city: City) => city.city_name)
      .concat(this.locationList.map((location: Location) => location.location_name));
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

  onOptionSelected(event:MatAutocompleteSelectedEvent){
    console.log(event)
    this.optionName = event.option.value;
    this.foundLocation = this.locationList.find((loc:Location) => loc.location_name === this.optionName)
    if (this.foundLocation) {
      this.targetRoute = 'location';
      this.targetID = this.foundLocation.id
    }
    else {
      this.foundCity = this.cityList.find((city:City) => city.city_name === this.optionName)
      if (this.foundCity) {
        this.targetRoute = 'city';
        this.targetID = this.foundCity.id
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
