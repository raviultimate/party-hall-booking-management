"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BookingForm from "@/components/bookings/booking-form";

export default function EditBookingPage({ params }) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/bookings"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Edit Booking</h1>
        <p className="text-muted-foreground">
          Update booking details and status
        </p>
      </div>

      <BookingForm bookingId={id} />
    </div>
  );
}
