import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all payments
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
    const bookingId = searchParams.get('bookingId');
    const method = searchParams.get('method');
    const status = searchParams.get('status');
    
    const query = {};
    
    if (bookingId) query.bookingId = bookingId;
    if (method) query.method = method;
    if (status) query.status = status;
    
    await connectToDatabase();
    const payments = await Payment.find(query)
      .populate('bookingId')
      .sort({ paymentDate: -1 });
    
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching payments", error },
      { status: 500 }
    );
  }
}

// POST a new payment
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
    const payment = await Payment.create(body);
    
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating payment", error },
      { status: 500 }
    );
  }
}
