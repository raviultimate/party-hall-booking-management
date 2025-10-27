"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomerForm from "@/components/customers/customer-form";

export default function EditCustomerPage({ params }) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/customers"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Edit Customer</h1>
        <p className="text-muted-foreground">
          Update customer information in your database
        </p>
      </div>

      <CustomerForm customerId={id} />
    </div>
  );
}
