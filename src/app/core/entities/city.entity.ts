import {Location} from './location.entity'

export interface City {
  city_name: string;
  province: string;
  zip_code: number;
  location: Location[];
}