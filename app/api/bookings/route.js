import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all bookings
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
    
    const searchParams = request.nextUrl.searchParams;
    const hallId = searchParams.get('hallId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    
    const query = {};
    
    if (hallId) query.hallId = hallId;
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    
    await connectToDatabase();
    const bookings = await Booking.find(query)
      .populate('hallId', 'name capacity basePrice')
      .populate('customerId', 'name email phone')
      .sort({ date: 1, timeSlot: 1 });
    
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching bookings", error },
      { status: 500 }
    );
  }
}

// POST a new booking
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin or staff role
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    await connectToDatabase();
    
    // Calculate balance amount based on total cost and advance amount
    if (body.totalCost && body.advanceAmount) {
      body.balanceAmount = body.totalCost - body.advanceAmount;
    }
    
    const booking = await Booking.create(body);
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error.message === 'Hall is already booked for this time period') {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating booking", error },
      { status: 500 }
    );
  }
}
