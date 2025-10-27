"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2 
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function HallsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState(null);

  // Fetch halls on component mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch("/api/halls");
        if (!response.ok) throw new Error("Failed to fetch halls");
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error("Error fetching halls:", error);
        toast({
          title: "Error",
          description: "Failed to load halls. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [toast]);

  // Filter halls based on search term
  const filteredHalls = halls.filter(
    (hall) =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.features.some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle hall deletion
  const handleDelete = async () => {
    if (!hallToDelete) return;

    try {
      const response = await fetch(`/api/halls/${hallToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete hall");

      setHalls(halls.filter((hall) => hall._id !== hallToDelete._id));
      toast({
        title: "Success",
        description: "Hall deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting hall:", error);
      toast({
        title: "Error",
        description: "Failed to delete hall. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setHallToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Halls Management</h1>
        <Button onClick={() => router.push("/dashboard/halls/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Hall
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            <span>All Halls</span>
          </CardTitle>
          <CardDescription>
            Manage your function halls, their pricing, and features
          </CardDescription>
          <div className="flex items-center mt-2">
            <Search className="mr-2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search halls by name or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHalls.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-10 w-10 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No halls found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm
                  ? "No halls match your search criteria"
                  : "Get started by adding your first hall"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHalls.map((hall) => (
                  <TableRow key={hall._id}>
                    <TableCell className="font-medium">{hall.name}</TableCell>
                    <TableCell>₹{hall.basePrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hall.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                        {hall.features.length > 3 && (
                          <Badge variant="outline">
                            +{hall.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={hall.available ? "success" : "destructive"}
                      >
                        {hall.available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/dashboard/halls/${hall._id}/edit`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setHallToDelete(hall);
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
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the hall "{hallToDelete?.name}"?
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
