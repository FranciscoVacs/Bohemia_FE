import { Event } from './'
import { Purchase } from './';
import { BaseEntity } from './';

export interface TicketType extends BaseEntity {
  ticketType_name: string;
  begin_datetime: Date;
  finish_datetime: Date;  
  price: number;
  max_quantity: number;
  available_tickets: number;
  event: Event;
  purchase: Purchase[];
}