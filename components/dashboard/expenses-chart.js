"use client";

import { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ExpensesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch expense data');
        }
        
        const data = await response.json();
        
        if (data.expenseByCategory && Array.isArray(data.expenseByCategory)) {
          // Format the data for the pie chart
          const formattedData = data.expenseByCategory.map(item => {
            // Capitalize first letter of category
            const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
            
            return {
              name: categoryName,
              value: item.amount
            };
          });
          
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching expense chart data:', err);
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
        No expense data available for the selected period.
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensesChart;
