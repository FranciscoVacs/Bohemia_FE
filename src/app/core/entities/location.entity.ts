import { City } from './city.entity'

export interface Location {
  location_name: string;
  address: string;
  max_capacity: number;
  city: City;
  event: Event[];
}