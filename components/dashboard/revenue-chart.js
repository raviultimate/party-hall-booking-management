"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const RevenueChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        
        const data = await response.json();
        
        if (data.monthlyBookingTrends && Array.isArray(data.monthlyBookingTrends)) {
          // Format the data for the chart
          const formattedData = data.monthlyBookingTrends.map(item => {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return {
              name: `${monthNames[item.month - 1]} ${item.year}`,
              revenue: item.revenue,
              bookings: item.bookingCount
            };
          });
          
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching revenue chart data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading chart data...</div>;
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-red-50 p-4 rounded-md text-red-700">
        Error loading chart: {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-50 p-4 rounded-md text-gray-500">
        No revenue data available for the selected period.
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            yAxisId="left"
            orientation="left" 
            tickFormatter={(value) => `$${value}`} 
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === "revenue") return [formatCurrency(value), "Revenue"];
              return [value, "Bookings"];
            }} 
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
          <Bar yAxisId="right" dataKey="bookings" fill="#82ca9d" name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
