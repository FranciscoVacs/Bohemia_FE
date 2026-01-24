import { Event } from "./event";

export interface TicketType {
  id: number;
  ticketTypeName: string;
  beginDatetime: string;
  finishDatetime: string;
  price: number;
  maxQuantity: number;
  availableTickets: number;
  event?: Event;
}

// Interface para el Admin Panel
export interface AdminTicketType {
  id: number;
  ticketTypeName: string;
  beginDatetime: string;
  finishDatetime: string;
  price: number;
  maxQuantity: number;
  availableTickets: number;
  event: number;
}

export interface AdminCreateTicketType {
  ticketTypeName: string;
  beginDatetime: string | null;
  finishDatetime: string | null;
  price: number;
  maxQuantity: number;
  event: number | null;
  saleMode?: string;
  isManuallyActivated?: boolean;
}
