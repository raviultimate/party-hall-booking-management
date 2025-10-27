"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

const TopHalls = () => {
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopHalls = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch top halls data');
        }
        
        const data = await response.json();
        
        if (data.topHallsByRevenue && Array.isArray(data.topHallsByRevenue)) {
          setHalls(data.topHallsByRevenue);
        }
      } catch (err) {
        console.error('Error fetching top halls:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopHalls();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading top halls data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading top halls: {error}
      </div>
    );
  }

  if (halls.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-md">
        No hall data available for the selected period.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Hall Name</th>
            <th className="py-2 text-right font-medium">Revenue</th>
            <th className="py-2 text-right font-medium">Bookings</th>
          </tr>
        </thead>
        <tbody>
          {halls.map((hall, index) => (
            <tr key={hall.hallId} className={index !== halls.length - 1 ? "border-b" : ""}>
              <td className="py-3">{hall.hallName}</td>
              <td className="py-3 text-right">{formatCurrency(hall.totalRevenue)}</td>
              <td className="py-3 text-right">{hall.bookingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopHalls;
