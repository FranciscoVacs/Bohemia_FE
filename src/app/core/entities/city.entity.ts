import {Location} from './'
import { BaseEntity } from './';

export interface City extends BaseEntity {
  city_name: string;
  province: string;
  zip_code: number;
  location: Location[];
}