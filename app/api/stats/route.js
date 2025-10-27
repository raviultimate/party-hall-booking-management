import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Expense from "@/models/Expense";
import Hall from "@/models/Hall";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";

// GET dashboard statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Default to current month if no date range provided
    const today = new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Query for total bookings in the date range
    const totalBookings = await Booking.countDocuments({
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Query for total revenue in the date range
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalCost" },
          advanceTotal: { $sum: "$advanceAmount" },
          balanceTotal: { $sum: "$balanceAmount" }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const advanceTotal = revenueResult.length > 0 ? revenueResult[0].advanceTotal : 0;
    const balanceTotal = revenueResult.length > 0 ? revenueResult[0].balanceTotal : 0;
    
    // Query for total expenses in the date range
    const expenseResult = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" }
        }
      }
    ]);
    
    const totalExpenses = expenseResult.length > 0 ? expenseResult[0].totalExpenses : 0;
    
    // Calculate profit
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Get expense breakdown by category
    const expenseByCategory = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          category: "$_id",
          amount: 1,
          _id: 0
        }
      }
    ]);
    
    // Get top halls by revenue
    const topHallsByRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: "$hallId",
          totalRevenue: { $sum: "$totalCost" },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "halls",
          localField: "_id",
          foreignField: "_id",
          as: "hallDetails"
        }
      },
      {
        $project: {
          hallId: "$_id",
          hallName: { $arrayElemAt: ["$hallDetails.name", 0] },
          totalRevenue: 1,
          bookingCount: 1,
          _id: 0
        }
      }
    ]);
    
    // Calculate occupancy rate
    // Get total number of days in the date range
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get total number of halls
    const totalHalls = await Hall.countDocuments();
    
    // Calculate total available hall-days
    const totalAvailableHallDays = totalDays * totalHalls;
    
    // Get total booked hall-days
    const bookedDaysResult = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $project: {
          hallId: 1,
          // Each booking is for a half day (Morning or Evening)
          bookingDays: { $literal: 0.5 }
        }
      },
      {
        $group: {
          _id: null,
          totalBookedDays: { $sum: "$bookingDays" }
        }
      }
    ]);
    
    const totalBookedDays = bookedDaysResult.length > 0 ? bookedDaysResult[0].totalBookedDays : 0;
    
    // Calculate occupancy rate
    const occupancyRate = totalAvailableHallDays > 0 
      ? (totalBookedDays / totalAvailableHallDays) * 100 
      : 0;
    
    // Get monthly booking trends
    const monthlyBookingTrends = await Booking.aggregate([
      {
        $match: {
          date: { 
            $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1),
            $lte: endDate
          },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $project: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          totalCost: 1
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$totalCost" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          bookingCount: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);
    
    // Prepare and return the stats
    const stats = {
      totalBookings,
      totalRevenue,
      advanceTotal,
      balanceTotal,
      totalExpenses,
      profit,
      profitMargin,
      occupancyRate,
      expenseByCategory,
      topHallsByRevenue,
      monthlyBookingTrends
    };
    
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { message: "Error fetching statistics", error },
      { status: 500 }
    );
  }
}
