import { Location } from './'
import { Dj } from './'
import { TicketType } from './';
import { BaseEntity } from './';

export interface Event extends BaseEntity {
  event_name: string;
  begin_datetime: string;
  finish_datetime: string;
  event_description: string;
  min_age: number;
  cover_photo: string;
  tickets_on_sale: number;
  location?: Location;
  dj?: Dj;
  ticketType: TicketType[];
}