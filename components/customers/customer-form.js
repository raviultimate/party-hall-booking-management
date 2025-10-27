"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => /^[0-9+\-\s()]*$/.test(val), {
      message: "Phone number can only contain digits, +, -, spaces, and parentheses",
    }),
});

export default function CustomerForm({ customerId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!customerId);
  const isEditing = !!customerId;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Fetch customer data if editing
  useEffect(() => {
    if (customerId) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${customerId}`);
          if (!response.ok) throw new Error("Failed to fetch customer");
          const customer = await response.json();
          
          // Set form values
          form.reset({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          });
        } catch (error) {
          console.error("Error fetching customer:", error);
          toast({
            title: "Error",
            description: "Failed to load customer data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [customerId, form, toast]);

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/customers/${customerId}` : "/api/customers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save customer");
      }

      toast({
        title: "Success",
        description: `Customer ${isEditing ? "updated" : "created"} successfully`,
      });

      router.push("/dashboard/customers");
      router.refresh();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} customer. Please try again.`,
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
        <CardTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update customer information"
            : "Add a new customer to your database"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Customer's full name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Customer's contact email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 9876543210"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Customer's contact phone number
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
              onClick={() => router.push("/dashboard/customers")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Customer" : "Add Customer"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
