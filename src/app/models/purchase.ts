import { User } from "./user";
import { TicketType } from "./ticket-type";
import { Ticket } from "./ticket";

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
