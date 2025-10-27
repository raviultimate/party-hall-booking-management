import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all customers
export async function GET() {
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
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching customers", error },
      { status: 500 }
    );
  }
}

// POST a new customer
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
    const customer = await Customer.create(body);
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A customer with this email already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating customer", error },
      { status: 500 }
    );
  }
}
