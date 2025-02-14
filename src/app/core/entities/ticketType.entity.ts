import { Event } from './event.entity'
import { Purchase } from './purchase.entity';

export interface TicketType {
  ticketType_name: string;
  begin_datetime: Date;
  finish_datetime: Date;  
  price: number;
  max_quantity: number;
  available_tickets: number;
  event: Event;
  purchase: Purchase[];
}