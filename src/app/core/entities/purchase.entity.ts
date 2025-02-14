import { User } from './user.entity'
import { TicketType } from './ticketType.entity'
import { Ticket } from './ticket.entity';

export interface Purchase {
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