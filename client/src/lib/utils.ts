import { Package } from "@/types";
import { type ClassValue, clsx } from "clsx"
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//Time difference utility
export function getTimeDifferenceText(timestamp: string) {
  const now = moment();
  const updated = moment.utc(timestamp).local();
  const diffMinutes = now.diff(updated, 'minutes');

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = now.diff(updated, 'hours');
  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
}

// Utility to get display status with stuck indicator
export  const getStatusAbbreviation = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'CREATED',
      'PICKED_UP': 'PICKED_UP',
      'IN_TRANSIT': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DEL.',
      'DELIVERED': 'DELIVERED',
      'EXCEPTION': 'EXCEPTION',
      'CANCELLED': 'CANCELLED'
    };
    return statusMap[status] || status;
  };


  
  // Get display status with stuck indicator
export  const getDisplayStatus = (pkg: Package): string => {
    if (isPackageStuck(pkg.last_updated) && 
        !['DELIVERED', 'CANCELLED'].includes(pkg.current_status.toLowerCase())) {
      return 'STUCK!*';
    }
    return getStatusAbbreviation(pkg.current_status);
  };


// Utility to check if a package is stuck
export  const isPackageStuck = (lastUpdated: string): boolean => {
    return new Date().getTime() - new Date(lastUpdated).getTime() > 30 * 60 * 1000;
  };  

