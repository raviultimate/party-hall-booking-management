"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Clock,
  Building2,
  User,
  IndianRupee,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function BookingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Fetch bookings, halls, and customers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await fetch("/api/bookings");
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
        const bookingsData = await bookingsResponse.json();
        
        // Fetch halls
        const hallsResponse = await fetch("/api/halls");
        if (!hallsResponse.ok) throw new Error("Failed to fetch halls");
        const hallsData = await hallsResponse.json();
        
        // Fetch customers
        const customersResponse = await fetch("/api/customers");
        if (!customersResponse.ok) throw new Error("Failed to fetch customers");
        const customersData = await customersResponse.json();
        
        // Create a map for quick lookup
        const hallsMap = hallsData.reduce((acc, hall) => {
          acc[hall._id] = hall;
          return acc;
        }, {});
        
        const customersMap = customersData.reduce((acc, customer) => {
          acc[customer._id] = customer;
          return acc;
        }, {});
        
        // Enrich bookings with hall and customer data
        const enrichedBookings = bookingsData.map(booking => ({
          ...booking,
          hall: hallsMap[booking.hallId] || { name: "Unknown Hall" },
          customer: customersMap[booking.customerId] || { name: "Unknown Customer" }
        }));
        
        setBookings(enrichedBookings);
        setHalls(hallsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.hall.name.toLowerCase().includes(searchLower) ||
      booking.customer.name.toLowerCase().includes(searchLower) ||
      (booking.notes && booking.notes.toLowerCase().includes(searchLower))
    );
  });

  // Handle booking deletion
  const handleDelete = async () => {
    if (!bookingToDelete) return;

    try {
      const response = await fetch(`/api/bookings/${bookingToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      setBookings(bookings.filter((b) => b._id !== bookingToDelete._id));
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "PPP");
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <Button onClick={() => router.push("/dashboard/bookings/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            <span>All Bookings</span>
          </CardTitle>
          <CardDescription>
            Manage hall bookings, schedules, and payments
          </CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex items-center flex-1">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === "all" ? "All Statuses" : 
                   statusFilter === "confirmed" ? "Confirmed" :
                   statusFilter === "pending" ? "Pending" : "Cancelled"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-10 w-10 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No bookings found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No bookings match your search criteria"
                  : "Get started by creating your first booking"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hall</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    
                    return (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{booking.hall.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{booking.customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{format(bookingDate, "PPP")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-400" />
                            <Badge variant="outline">
                              {booking.timeSlot}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{booking.attendeesCount || 'N/A'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-6 px-1"
                              onClick={() => {
                                toast({
                                  title: "Catering Menu",
                                  description: booking.cateringMenu || "No catering menu specified",
                                });
                              }}
                            >
                              <span className="text-xs">Menu</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <IndianRupee className="mr-1 h-3 w-3 text-gray-400" />
                              <span>{booking.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.advanceAmount > 0 ? (
                                <span>
                                  Advance: ₹{booking.advanceAmount.toLocaleString()}
                                </span>
                              ) : (
                                <span>No advance paid</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/dashboard/bookings/${booking._id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setBookingToDelete(booking);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the booking for{" "}
              <strong>{bookingToDelete?.customer?.name}</strong> at{" "}
              <strong>{bookingToDelete?.hall?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
