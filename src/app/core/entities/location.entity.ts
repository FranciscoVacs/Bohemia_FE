import { City } from './'
import { BaseEntity } from './';

export interface Location extends BaseEntity {
  location_name: string;
  address: string;
  max_capacity: number;
  city: City;
  event: Event[];
}