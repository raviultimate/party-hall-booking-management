import { Suspense } from "react";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RevenueChart from "@/components/dashboard/revenue-chart";
import ExpensesChart from "@/components/dashboard/expenses-chart";
import TopHalls from "@/components/dashboard/top-halls";
import UpcomingBookings from "@/components/dashboard/upcoming-bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoading />}>
              <RevenueChart />
            </Suspense>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoading />}>
              <ExpensesChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Halls</CardTitle>
            <CardDescription>Halls with highest revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableLoading />}>
              <TopHalls />
            </Suspense>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Next 5 bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableLoading />}>
              <UpcomingBookings />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(null).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartLoading() {
  return <Skeleton className="h-[200px] w-full" />;
}

function TableLoading() {
  return (
    <div className="space-y-2">
      {Array(5).fill(null).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
