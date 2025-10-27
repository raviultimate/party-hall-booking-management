"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Receipt, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Calendar,
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

export default function ExpensesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Fetch expenses and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses
        const expensesResponse = await fetch("/api/expenses");
        if (!expensesResponse.ok) throw new Error("Failed to fetch expenses");
        const expensesData = await expensesResponse.json();
        
        // Fetch bookings
        const bookingsResponse = await fetch("/api/bookings");
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
        const bookingsData = await bookingsResponse.json();
        
        // Create a map for quick lookup
        const bookingsMap = bookingsData.reduce((acc, booking) => {
          acc[booking._id] = booking;
          return acc;
        }, {});
        
        // Enrich expenses with booking data
        const enrichedExpenses = expensesData.map(expense => ({
          ...expense,
          booking: bookingsMap[expense.bookingId] || { notes: "Unknown Booking" }
        }));
        
        setExpenses(enrichedExpenses);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load expenses data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter expenses based on search term and category filter
  const filteredExpenses = expenses.filter(expense => {
    // Category filter
    if (categoryFilter !== "all" && expense.category !== categoryFilter) {
      return false;
    }
    
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      expense.addedBy.toLowerCase().includes(searchLower) ||
      (expense.booking?.notes && expense.booking.notes.toLowerCase().includes(searchLower))
    );
  });

  // Handle expense deletion
  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await fetch(`/api/expenses/${expenseToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete expense");

      setExpenses(expenses.filter((e) => e._id !== expenseToDelete._id));
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Get category badge variant
  const getCategoryBadge = (category) => {
    switch (category) {
      case "decor":
        return "pink";
      case "catering":
        return "orange";
      case "labor":
        return "blue";
      case "misc":
        return "purple";
      default:
        return "secondary";
    }
  };

  // Format category name
  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses Management</h1>
        <Button onClick={() => router.push("/dashboard/expenses/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            <span>All Expenses</span>
          </CardTitle>
          <CardDescription>
            Track and manage expenses for all bookings
          </CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex items-center flex-1">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {categoryFilter === "all" ? "All Categories" : formatCategory(categoryFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("decor")}>
                    Decoration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("catering")}>
                    Catering
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("labor")}>
                    Labor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter("misc")}>
                    Miscellaneous
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
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-10">
              <Receipt className="h-10 w-10 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No expenses found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || categoryFilter !== "all"
                  ? "No expenses match your search criteria"
                  : "Get started by adding your first expense"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadge(expense.category)}>
                          {formatCategory(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IndianRupee className="mr-1 h-3 w-3 text-gray-400" />
                          <span>{expense.amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                          <span>{format(new Date(expense.date), "PPP")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{expense.addedBy}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/bookings/${expense.bookingId}`)}
                        >
                          View Booking
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/dashboard/expenses/${expense._id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setExpenseToDelete(expense);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Are you sure you want to delete the expense "{expenseToDelete?.description}"?
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
