export type TicketStatus = 'waiting' | 'calling' | 'servicing' | 'completed' | 'cancelled';
export type ServiceType = 'repair' | 'maintenance' | 'inspection' | 'custom';
export type StationStatus = 'idle' | 'busy' | 'offline';

export interface QueueTicket {
  id: string;
  ticketNumber: number;
  customerName: string;
  phone: string;
  bikeModel: string;
  serviceType: ServiceType;
  description: string;
  status: TicketStatus;
  stationId: string | null;
  createdAt: Date;
  calledAt?: Date;
  completedAt?: Date;
  estimatedMinutes?: number;
}

export interface RepairStation {
  id: string;
  name: string;
  status: StationStatus;
  currentLoad: number;
  completedToday: number;
  technician: string;
  avgServiceTime: number;
  waitingCount: number;
}

export interface PartBatch {
  id: string;
  batchNumber: string;
  partName: string;
  partCode: string;
  category: string;
  totalQuantity: number;
  remainingQuantity: number;
  unit: string;
  receivedDate: Date;
  supplier: string;
  pricePerUnit: number;
  location: string;
}

export interface OutboundRecord {
  id: string;
  batchId: string;
  quantity: number;
  destination: string;
  operator: string;
  outboundDate: Date;
  remark: string;
  ticketId?: string;
  stationId?: string;
}

export interface LoadBalanceResult {
  stationId: string;
  score: number;
  reason: string;
}

export type NotificationType = 'pickup' | 'low_stock' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  stationId?: string;
  customerName?: string;
  bikeModel?: string;
  read: boolean;
  createdAt: Date;
}

export type TabKey = 'dashboard' | 'queue' | 'dispatch' | 'parts' | 'outbound';
