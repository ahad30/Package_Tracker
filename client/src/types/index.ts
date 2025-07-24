export enum PackageStatus {
  CREATED = 'CREATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED',
}

export interface Package {
  id: string;
  package_id: string;
  current_status: PackageStatus;
  last_updated: string;
  lat?: number;
  lon?: number;
  note?: string;
  eta?: string;
}

export interface PackageEvent {
  id: string;
  package_id: string;
  status: PackageStatus;
  event_timestamp: string;
  received_at: string;
  lat?: number;
  lon?: number;
  note?: string;
  eta?: string;
}

export interface Alert {
  id: string;
  package_id: string;
  message: string;
  created_at: string;
  updated_at?: string;
  resolved: boolean;
}