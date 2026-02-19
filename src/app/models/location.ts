import { City } from "./city";

export interface Location {
    id?: number;
    locationName: string;
    address: string;
    maxCapacity: number;
    city: City;
    latitude: number;
    longitude: number;
}
