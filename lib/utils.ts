import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with tailwind-merge to handle conflicting Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Australian currency
 * @param amount - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (amount === null || amount === undefined) return "$0.00";
  
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format a number as a tonnage value
 * @param tonnes - Number to format
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted tonnage string
 */
export function formatTonnage(
  tonnes: number | null | undefined,
  decimalPlaces: number = 2
): string {
  if (tonnes === null || tonnes === undefined) return "0 tonnes";
  
  return `${tonnes.toFixed(decimalPlaces)} tonnes`;
}

/**
 * Format an Australian ABN (remove spaces for storage or add spaces for display)
 * @param abn - ABN string
 * @param format - Whether to format with spaces or remove spaces
 * @returns Formatted ABN string
 */
export function formatABN(abn: string, format: "display" | "storage" = "display"): string {
  if (!abn) return "";
  
  // Remove all non-digit characters
  const cleanAbn = abn.replace(/[^0-9]/g, "");
  
  // Return clean digits for storage
  if (format === "storage") return cleanAbn;
  
  // Format as XX XXX XXX XXX for display
  if (cleanAbn.length !== 11) return abn; // Return original if not valid length
  
  return `${cleanAbn.substring(0, 2)} ${cleanAbn.substring(2, 5)} ${cleanAbn.substring(5, 8)} ${cleanAbn.substring(8, 11)}`;
}

/**
 * Validate an Australian ABN using the checksum algorithm
 * @param abn - ABN string (with or without spaces)
 * @returns Boolean indicating if ABN is valid
 */
export function validateABN(abn: string): boolean {
  // Remove all non-digit characters
  const cleanAbn = abn.replace(/[^0-9]/g, "");
  
  // ABN must be 11 digits
  if (cleanAbn.length !== 11) return false;
  
  // Weights for the ABN checksum calculation
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Calculate weighted sum
  let sum = 0;
  
  // Subtract 1 from the first digit (special case in ABN algorithm)
  sum += (parseInt(cleanAbn[0]) - 1) * weights[0];
  
  // Add the rest of the weighted digits
  for (let i = 1; i < 11; i++) {
    sum += parseInt(cleanAbn[i]) * weights[i];
  }
  
  // Valid ABN must be divisible by 89
  return sum % 89 === 0;
}

/**
 * Calculate GST amount (10% in Australia)
 * @param amountExGST - Amount excluding GST
 * @returns GST amount
 */
export function calculateGST(amountExGST: number): number {
  return amountExGST * 0.1; // 10% GST in Australia
}

/**
 * Add GST to an amount
 * @param amountExGST - Amount excluding GST
 * @returns Amount including GST
 */
export function addGST(amountExGST: number): number {
  return amountExGST * 1.1; // Add 10% GST
}

/**
 * Remove GST from an amount
 * @param amountIncGST - Amount including GST
 * @returns Amount excluding GST
 */
export function removeGST(amountIncGST: number): number {
  return amountIncGST / 1.1; // Remove 10% GST
}

/**
 * Calculate asphalt tonnage based on area, depth and density
 * @param areaSqm - Area in square meters
 * @param depthMm - Depth in millimeters
 * @param density - Density factor (default 2.4 for asphalt)
 * @param wasteFactor - Waste factor percentage (default 5%)
 * @returns Tonnage calculation
 */
export function calculateTonnage(
  areaSqm: number,
  depthMm: number,
  density: number = 2.4,
  wasteFactor: number = 5
): number {
  // Formula: area (m²) × depth (mm) × density ÷ 1000 × (1 + waste_factor/100)
  return (areaSqm * depthMm * density / 1000) * (1 + wasteFactor / 100);
}

/**
 * Generate a slug from a string
 * @param str - String to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Check if the current environment is a browser
 * @returns Boolean indicating if code is running in browser
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Check if the device is likely a mobile device
 * @returns Boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (!isBrowser) return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
