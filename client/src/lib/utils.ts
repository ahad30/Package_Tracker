import { type ClassValue, clsx } from "clsx"
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getTimeDifferenceText(timestamp: string) {
  const now = moment();
  const updated = moment.utc(timestamp).local();
  const diffMinutes = now.diff(updated, 'minutes');

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = now.diff(updated, 'hours');
  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
}