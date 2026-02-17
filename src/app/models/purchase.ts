import { User } from "./user.js";
import { TicketType } from "./ticket-type.js";
import { Ticket } from "./ticket.js";

export interface Purchase {
  id: number;
  ticketNumbers: number;
  paymentStatus: PaymentStatus;
  discountApplied: number;
  serviceFee: number;
  totalPrice: number;
  user?: User;
  ticketType?: TicketType;
  ticket?: Ticket[];
}

export interface PurchaseDetails  {
  ticketTypeName?: string;
  ticketId?: number;
  locationName?: string;
  eventDate?: string;
}

export enum PaymentStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}
