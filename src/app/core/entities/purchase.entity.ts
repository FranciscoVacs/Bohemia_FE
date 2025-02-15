import { User } from './'
import { TicketType } from './'
import { Ticket } from './';
import { BaseEntity } from './';

export interface Purchase extends BaseEntity {
  ticket_numbers: number;
  payment_status: PaymentStatus;
  discount_applied: number;
  total_price: number;
  user: User;
  ticket_type: TicketType;
  ticket: Ticket[];
}

export enum PaymentStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}