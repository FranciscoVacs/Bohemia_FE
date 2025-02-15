import { Purchase } from './'
import { BaseEntity } from './';

export interface Ticket extends BaseEntity {
  qr_code: string;
  number_in_purchase: number;
  number_in_ticket_type: number;
  purchase: Purchase;
}