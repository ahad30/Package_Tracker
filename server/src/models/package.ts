export enum PackageStatus {
  CREATED = 'CREATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED',
}

export interface PackageEventInput {
  package_id: string;
  status: PackageStatus;
  lat?: number;
  lon?: number;
  timestamp: string;
  note?: string;
  eta?: string;
}

export interface Package {
  package_id: string;
  current_status: PackageStatus;
  last_updated: Date;
  lat?: number;
  lon?: number;
  note?: string;
  eta?: Date;
}