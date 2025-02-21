import { Event } from './'
import { Purchase } from './';
import { BaseEntity } from './';

export interface TicketType extends BaseEntity {
  ticketType_name: string;
  begin_datetime: string;
  finish_datetime: string;  
  price: number;
  max_quantity: number;
  available_tickets: number;
  event?: Event;
  purchase: Purchase[];
}