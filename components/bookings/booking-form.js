"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Clock, PlusCircle } from "lucide-react";
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

// Form validation schema
const bookingFormSchema = z.object({
  hallId: z.string().min(1, "Please select a hall"),
  customerId: z.string().min(1, "Please select a customer"),
  date: z.date({
    required_error: "Please select a date",
  }),
  timeSlot: z.enum(["Morning", "Evening"], {
    required_error: "Please select a time slot",
  }),
  totalCost: z.coerce.number().min(1, "Total cost must be at least 1"),
  advanceAmount: z.coerce.number().min(0, "Advance amount cannot be negative"),
  status: z.enum(["pending", "confirmed", "cancelled"], {
    required_error: "Please select a status",
  }),
  notes: z.string().optional(),
  attendeesCount: z.coerce.number().min(1, "Number of attendees must be at least 1"),
  cateringMenu: z.string().min(5, "Catering menu details are required"),
});

export default function BookingForm({ bookingId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!bookingId);
  const [halls, setHalls] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const isEditing = !!bookingId;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      hallId: "",
      customerId: "",
      date: new Date(),
      timeSlot: "Morning",
      totalCost: 0,
      advanceAmount: 0,
      status: "pending",
      notes: "",
      attendeesCount: 0,
      cateringMenu: "",
    },
  });

  // Fetch halls and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch halls
        const hallsResponse = await fetch("/api/halls");
        if (!hallsResponse.ok) throw new Error("Failed to fetch halls");
        const hallsData = await hallsResponse.json();
        setHalls(hallsData);
        
        // Fetch customers
        const customersResponse = await fetch("/api/customers");
        if (!customersResponse.ok) throw new Error("Failed to fetch customers");
        const customersData = await customersResponse.json();
        setCustomers(customersData);
        
        // If editing, fetch booking data
        if (bookingId) {
          const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
          if (!bookingResponse.ok) throw new Error("Failed to fetch booking");
          const booking = await bookingResponse.json();
          
          // Find the selected hall
          const hall = hallsData.find(h => h._id === booking.hallId);
          setSelectedHall(hall);
          
          // Set form values
          form.reset({
            hallId: booking.hallId,
            customerId: booking.customerId,
            date: new Date(booking.date),
            timeSlot: booking.timeSlot,
            totalCost: booking.totalCost,
            advanceAmount: booking.advanceAmount,
            status: booking.status,
            notes: booking.notes || "",
            attendeesCount: booking.attendeesCount || 0,
            cateringMenu: booking.cateringMenu || "",
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
  }, [bookingId, form, toast]);

  // Calculate total cost when hall or time slot changes
  useEffect(() => {
    const calculateTotalCost = () => {
      const hall = halls.find(h => h._id === form.watch("hallId"));
      const timeSlot = form.watch("timeSlot");
      
      if (hall && timeSlot) {
        // Base price plus additional for evening slots
        const cost = hall.basePrice + (timeSlot === "Evening" ? 5000 : 0);
        setTotalCost(cost);
        form.setValue("totalCost", cost);
      } else {
        setTotalCost(0);
        form.setValue("totalCost", 0);
      }
    };
    
    calculateTotalCost();
  }, [form, form.watch("hallId"), form.watch("timeSlot"), halls]);

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convert form data to booking object
      const bookingData = {
        hallId: data.hallId,
        customerId: data.customerId,
        date: data.date.toISOString(),
        timeSlot: data.timeSlot,
        totalCost,
        advanceAmount: data.advanceAmount,
        balanceAmount: totalCost - data.advanceAmount,
        status: data.status,
        notes: data.notes,
      };
      
      const url = isEditing ? `/api/bookings/${bookingId}` : "/api/bookings";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save booking");
      }

      toast({
        title: "Success",
        description: `Booking ${isEditing ? "updated" : "created"} successfully`,
      });

      router.push("/dashboard/bookings");
      router.refresh();
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} booking. Please try again.`,
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
        <CardTitle>{isEditing ? "Edit Booking" : "Create New Booking"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update booking details"
            : "Schedule a new hall booking"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hallId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hall</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hall" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {halls.map((hall) => (
                          <SelectItem key={hall._id} value={hall._id}>
                            {hall.name} ({hall.capacity} people)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the hall for this booking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Customer</FormLabel>
                  <Link 
                    href="/dashboard/customers/new"
                    className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add New Customer
                  </Link>
                </div>
                
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name} ({customer.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Customer making the booking
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                        disabled={(date) => isBefore(date, new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date of the booking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Morning">Morning (8:00 AM - 2:00 PM)</SelectItem>
                      <SelectItem value="Evening">Evening (4:00 PM - 10:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose between morning or evening slot
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="advanceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Amount paid in advance
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the booking
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="attendeesCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Total number of people attending the event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Total cost for the booking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cateringMenu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catering Menu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="starter: alu,mushroom, rumali roti, panner curry, Rice biryani"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter catering menu items separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Booking Summary</h3>
                  <p className="text-sm text-gray-500">
                    {selectedHall ? (
                      <>Hall: {selectedHall.name} ({form.watch("timeSlot")} slot)</>
                    ) : (
                      <>Select a hall to see details</>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Attendees: {form.watch("attendeesCount") || 0}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">Total Cost</div>
                  <div className="text-2xl font-bold">₹{form.watch("totalCost").toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    Balance: ₹{(form.watch("totalCost") - form.watch("advanceAmount")).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or additional information"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about this booking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/bookings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Booking" : "Create Booking"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
