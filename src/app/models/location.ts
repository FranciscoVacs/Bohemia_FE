import { City } from "./city";

export interface Location {
    id?: number;
    locationName: string;
    address: string;
    maxCapacity: number;
    latitude?: number;
    longitude?: number;
    city: City;
}
