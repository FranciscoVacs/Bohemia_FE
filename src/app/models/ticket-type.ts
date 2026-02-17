import { Event } from "./event";

export interface TicketType {
  id: number;
  ticketTypeName: string;
  price: number;
  availableTickets: number;
  isSaleActive: boolean;
  event?: Event;
}

// Interface para el Admin Panel
export interface AdminTicketType {
  id: number;
  ticketTypeName: string;
  price: number;
  maxQuantity: number;
  availableTickets: number;
  sortOrder: number;
  status: 'pending' | 'active' | 'sold_out' | 'closed';
  activatedAt?: string;
  closedAt?: string;
  isSaleActive: boolean;
  event: number;
}

export interface AdminCreateTicketType {
  ticketTypeName: string;
  price: number;
  maxQuantity: number;
  event: number | null;
  sortOrder: number;
}
