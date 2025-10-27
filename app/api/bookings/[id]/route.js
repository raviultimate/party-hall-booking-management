import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

// GET a single booking by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const booking = await Booking.findById(id)
      .populate('hallId', 'name capacity basePrice')
      .populate('customerId', 'name email phone');
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching booking", error },
      { status: 500 }
    );
  }
}

// PUT (update) a booking by ID
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin or staff role
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Calculate balance amount based on total cost and advance amount
    if (body.totalCost !== undefined && body.advanceAmount !== undefined) {
      body.balanceAmount = body.totalCost - body.advanceAmount;
    }
    
    await connectToDatabase();
    const booking = await Booking.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    if (error.message === 'Hall is already booked for this time period') {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating booking", error },
      { status: 500 }
    );
  }
}

// DELETE a booking by ID
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const booking = await Booking.findByIdAndDelete(id);
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting booking", error },
      { status: 500 }
    );
  }
}
