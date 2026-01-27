import { Dj } from "./dj";
import { TicketType, AdminTicketType } from "./ticket-type";
import { Location } from "./location";

export interface Event {
    id: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    eventDescription: string;
    minAge: number;
    coverPhoto: string;
    ticketsOnSale: number;
    location?: Location;
    dj?: Dj;
    ticketTypes?: TicketType[];
}

// Interface para el Admin Panel
export interface AdminEvent {
    id: number;
    eventName: string;
    beginDatetime: string;
    finishDatetime: string;
    eventDescription: string;
    minAge: number;
    coverPhoto: string;
    location: {
        id: number;
        locationName: string;
        address: string;
        city: {
            cityName: string;
        };
    };
    dj: {
        id: number;
        djApodo: string;
    };
    ticketTypes: AdminTicketType[];
    isGalleryPublished: boolean;
    isPublished: boolean;
}