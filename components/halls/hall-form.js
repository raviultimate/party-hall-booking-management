"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
const hallFormSchema = z.object({
  name: z.string().min(3, "Hall name must be at least 3 characters"),
  basePrice: z.coerce.number().min(1, "Base price must be at least 1"),
  features: z.array(z.string()).optional(),
  available: z.boolean().default(true),
});

export default function HallForm({ hallId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!hallId);
  const [featureInput, setFeatureInput] = useState("");
  const isEditing = !!hallId;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(hallFormSchema),
    defaultValues: {
      name: "",
      basePrice: 0,
      features: [],
      available: true,
    },
  });

  // Fetch hall data if editing
  useEffect(() => {
    if (hallId) {
      const fetchHall = async () => {
        try {
          const response = await fetch(`/api/halls/${hallId}`);
          if (!response.ok) throw new Error("Failed to fetch hall");
          const hall = await response.json();
          
          // Set form values
          form.reset({
            name: hall.name,
            basePrice: hall.basePrice,
            features: hall.features || [],
            available: hall.available,
          });
        } catch (error) {
          console.error("Error fetching hall:", error);
          toast({
            title: "Error",
            description: "Failed to load hall data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchHall();
    }
  }, [hallId, form, toast]);

  // Add feature to the list
  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues("features") || [];
      if (!currentFeatures.includes(featureInput.trim())) {
        form.setValue("features", [...currentFeatures, featureInput.trim()]);
      }
      setFeatureInput("");
    }
  };

  // Remove feature from the list
  const removeFeature = (feature) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((f) => f !== feature)
    );
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/halls/${hallId}` : "/api/halls";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save hall");

      toast({
        title: "Success",
        description: `Hall ${isEditing ? "updated" : "created"} successfully`,
      });

      router.push("/dashboard/halls");
      router.refresh();
    } catch (error) {
      console.error("Error saving hall:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} hall. Please try again.`,
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
        <CardTitle>{isEditing ? "Edit Hall" : "Create New Hall"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the details of your function hall"
            : "Add a new function hall to your venue"}
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
                  <FormLabel>Hall Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Grand Ballroom" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your function hall
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="15000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Base price for morning slot (Evening slot costs more)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature (e.g., 'Air Conditioning')"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <Button type="button" onClick={addFeature}>
                      Add
                    </Button>
                  </div>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1"
                            onClick={() => removeFeature(feature)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add features and amenities available in this hall
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for Booking</FormLabel>
                    <FormDescription>
                      Uncheck this if the hall is temporarily unavailable
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/halls")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Hall" : "Create Hall"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
