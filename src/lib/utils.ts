import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures the APP_URL always has a valid protocol (http/https).
 * This prevents OAuth redirect_uri errors when NEXT_PUBLIC_APP_URL is misconfigured.
 */
export function getAppUrl(): string {
  let url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  if (!url.startsWith('http')) {
    // Default to https, except for localhost
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }
  // Remove trailing slash if present
  return url.replace(/\/+$/, '');
}
