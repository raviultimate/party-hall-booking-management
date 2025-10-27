import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateDuration(startTime, endTime) {
  const diff = endTime.getTime() - startTime.getTime();
  return Math.ceil(diff / (1000 * 60 * 60)); // Return hours
}

export function calculateTotalCost(hours, rate) {
  return hours * rate;
}

export function calculateBalanceAmount(totalCost, advanceAmount) {
  return totalCost - advanceAmount;
}

export function calculateOccupancyRate(bookedDays, totalDays) {
  return (bookedDays / totalDays) * 100;
}
