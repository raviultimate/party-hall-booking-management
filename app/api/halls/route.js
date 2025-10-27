import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Hall from "@/models/Hall";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all halls
export async function GET() {
  try {
    await connectToDatabase();
    const halls = await Hall.find({}).sort({ createdAt: -1 });
    return NextResponse.json(halls, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching halls", error },
      { status: 500 }
    );
  }
}

// POST a new hall
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    await connectToDatabase();
    const hall = await Hall.create(body);
    
    return NextResponse.json(hall, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A hall with this name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating hall", error },
      { status: 500 }
    );
  }
}
