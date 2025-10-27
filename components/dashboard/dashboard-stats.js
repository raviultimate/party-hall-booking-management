"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, DollarSign, TrendingUp, BarChart } from "lucide-react";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    profit: 0,
    occupancyRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats({
          totalBookings: data.totalBookings || 0,
          totalRevenue: data.totalRevenue || 0,
          profit: data.profit || 0,
          occupancyRate: data.occupancyRate || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <CalendarDays className="h-8 w-8 text-blue-500" />,
      formatter: (value) => value
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      formatter: formatCurrency
    },
    {
      title: "Net Profit",
      value: stats.profit,
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      formatter: formatCurrency
    },
    {
      title: "Occupancy Rate",
      value: stats.occupancyRate,
      icon: <BarChart className="h-8 w-8 text-orange-500" />,
      formatter: (value) => `${value.toFixed(1)}%`
    }
  ];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        Error loading dashboard stats: {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : stat.formatter(stat.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
