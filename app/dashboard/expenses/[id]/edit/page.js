"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/expenses/expense-form";

export default function EditExpensePage({ params }) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/expenses"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Edit Expense</h1>
        <p className="text-muted-foreground">
          Update expense details
        </p>
      </div>

      <ExpenseForm expenseId={id} />
    </div>
  );
}
