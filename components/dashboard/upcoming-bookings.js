"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

const UpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch upcoming bookings
        const response = await fetch(`/api/bookings?status=confirmed`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming bookings');
        }
        
        const data = await response.json();
        
        // Filter for upcoming bookings and sort by date
        const upcomingBookings = data
          .filter(booking => new Date(booking.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5); // Get only the next 5 bookings
        
        setBookings(upcomingBookings);
      } catch (err) {
        console.error('Error fetching upcoming bookings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading upcoming bookings...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading bookings: {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-md">
        No upcoming bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Date</th>
            <th className="py-2 text-left font-medium">Hall</th>
            <th className="py-2 text-left font-medium">Customer</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="border-b">
              <td className="py-3">
                {formatDate(new Date(booking.date))} ({booking.timeSlot})
              </td>
              <td className="py-3">
                {booking.hallId?.name || "Unknown Hall"}
              </td>
              <td className="py-3">
                {booking.customerId?.name || "Unknown Customer"}
              </td>
              <td className="py-3 text-right">
                {formatCurrency(booking.totalCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-right">
        <Link 
          href="/dashboard/bookings" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View all bookings →
        </Link>
      </div>
    </div>
  );
};

export default UpcomingBookings;
