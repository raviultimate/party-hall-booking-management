import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Hall from "@/models/Hall";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

// GET a single hall by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid hall ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const hall = await Hall.findById(id);
    
    if (!hall) {
      return NextResponse.json(
        { message: "Hall not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hall, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching hall", error },
      { status: 500 }
    );
  }
}

// PUT (update) a hall by ID
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
        { message: "Invalid hall ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    await connectToDatabase();
    const hall = await Hall.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!hall) {
      return NextResponse.json(
        { message: "Hall not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hall, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A hall with this name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating hall", error },
      { status: 500 }
    );
  }
}

// DELETE a hall by ID
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
        { message: "Invalid hall ID" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const hall = await Hall.findByIdAndDelete(id);
    
    if (!hall) {
      return NextResponse.json(
        { message: "Hall not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Hall deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting hall", error },
      { status: 500 }
    );
  }
}
