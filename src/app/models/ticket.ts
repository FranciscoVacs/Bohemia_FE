import { Purchase } from "./purchase";

export interface Ticket {
  id: number;
  qrCode: string;
  numberInPurchase: number;
  numberInTicketType: number;
  purchase?: Purchase;
}
