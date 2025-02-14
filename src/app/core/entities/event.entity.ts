import { Location } from './location.entity'
import { Dj } from './dj.entity'
import { TicketType } from './ticketType.entity';

export interface Event {
  event_name: string;
  begin_datetime: string;
  finish_datetime: string;
  event_description: string;
  min_age: number;
  cover_photo: string;
  tickets_on_sale: number;
  location: Location;
  dj: Dj;
  ticketType: TicketType[];
}