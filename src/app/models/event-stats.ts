// Interfaces para las estadísticas de eventos

export interface TicketTypeStats {
  id: number;
  name: string;
  sold: number;
  capacity: number;
  percentageSold: number;
  revenue: number;
  price: number;
}

export interface RecentTransaction {
  id: number;
  userName: string;
  userInitials: string;
  ticketTypeName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export interface LastSale {
  userName: string;
  ticketTypeName: string;
  timeAgo: string;
  createdAt: string;
}

export interface EventStatsSummary {
  totalTicketsSold: number;
  totalCapacity: number;
  percentageSold: number;
  totalRevenue: number;
  averageTicketPrice: number;
}

export interface EventStats {
  eventId: number;
  eventName: string;
  eventStatus: 'upcoming' | 'active' | 'past';
  saleStatus: 'active' | 'inactive';
  lastUpdated: string;
  summary: EventStatsSummary;
  byTicketType: TicketTypeStats[];
  recentTransactions: RecentTransaction[];
  lastSale: LastSale | null;
}

// Para manejar el estado de carga y errores
export interface EventStatsState {
  stats: EventStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}