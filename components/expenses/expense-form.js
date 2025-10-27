"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Custom styles for form validation
const formStyles = {
  input: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  error: "border-red-500 focus-visible:ring-red-500",
};

// Form validation schema
const expenseFormSchema = z.object({
  // Made bookingId optional
  bookingId: z.string().optional(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.enum(["decor", "catering", "labor", "misc"], {
    required_error: "Please select a category",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  addedBy: z.string().min(2, "Added by must be at least 2 characters"),
});

export default function ExpenseForm({ expenseId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!expenseId);
  const [bookings, setBookings] = useState([]);
  const isEditing = !!expenseId;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      bookingId: "",
      description: "",
      amount: 0,
      category: "misc",
      date: new Date(),
      addedBy: "",
    },
    // Add mode to show validation errors on all fields when form is submitted
    mode: "onSubmit",
  });

  // Fetch bookings and expense data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await fetch("/api/bookings");
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        
        // If editing, fetch expense data
        if (expenseId) {
          const expenseResponse = await fetch(`/api/expenses/${expenseId}`);
          if (!expenseResponse.ok) throw new Error("Failed to fetch expense");
          const expense = await expenseResponse.json();
          
          // Set form values
          form.reset({
            bookingId: expense.bookingId,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date),
            addedBy: expense.addedBy,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load necessary data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [expenseId, form, toast]);

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/expenses/${expenseId}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save expense");
      }

      toast({
        title: "Success",
        description: `Expense ${isEditing ? "updated" : "created"} successfully`,
      });

      router.push("/dashboard/expenses");
      router.refresh();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} expense. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update expense details"
            : "Record a new expense for a booking"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bookingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Booking</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a booking" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookings.map((booking) => {
                        const startDate = new Date(booking.startTime);
                        const hallName = booking.hall?.name || "Unknown Hall";
                        const customerName = booking.customer?.name || "Unknown Customer";
                        
                        return (
                          <SelectItem key={booking._id} value={booking._id}>
                            {format(startDate, "PPP")} - {hallName} ({customerName})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the booking this expense is for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Flower arrangements" {...field} />
                  </FormControl>
                  <FormDescription>
                    Brief description of the expense
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cost of the expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="decor">Decoration</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="misc">Miscellaneous</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the expense was incurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Added By</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Person who added this expense
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/expenses")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Expense" : "Add Expense"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
