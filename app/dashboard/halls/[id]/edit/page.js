"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HallForm from "@/components/halls/hall-form";

export default function EditHallPage({ params }) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/halls"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Halls
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Edit Hall</h1>
        <p className="text-muted-foreground">
          Update the details of your function hall
        </p>
      </div>

      <HallForm hallId={id} />
    </div>
  );
}
