import { Purchase } from './purchase.entity'

export interface Ticket {
  qr_code: string;
  number_in_purchase: number;
  number_in_ticket_type: number;
  purchase: Purchase;
}