import { City } from './'
import { BaseEntity } from './';
import { Event } from './';

export interface Location extends BaseEntity {
  location_name: string;
  address: string;
  max_capacity: number;
  city: City;
  event: Event[];
}