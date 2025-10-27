import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

// GET a single payment by ID
export async function GET(
  request,
  { params }
) {
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
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const payment = await Payment.findById(id).populate('bookingId');
    
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching payment", error },
      { status: 500 }
    );
  }
}

// PUT (update) a payment by ID
export async function PUT(
  request,
  { params }
) {
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
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    await connectToDatabase();
    const payment = await Payment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating payment", error },
      { status: 500 }
    );
  }
}

// DELETE a payment by ID
export async function DELETE(
  request,
  { params }
) {
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
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const payment = await Payment.findByIdAndDelete(id);
    
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Payment deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting payment", error },
      { status: 500 }
    );
  }
}
