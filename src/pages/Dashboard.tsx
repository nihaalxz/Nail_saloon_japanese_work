import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { CsvUploader } from "@/components/csv/csv-uploader";
import CustomerDetails from "../pages/Customer/CustomerDetails";
type Customer = Database["public"]["Tables"]["customers"]["Row"];

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "in progress":
      return "bg-teal-100 text-teal-800 hover:bg-teal-100";
    case "new":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "completion":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default function Dashboard() {
  const [artists, setArtists] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("application_date", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      setError(error.message);
    } else if (data) {
      setArtists(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleUploadComplete = () => {
    fetchCustomers(); // Refresh the table after upload
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleRowClick = (customerId: number) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
  };

  // If a customer is selected, show the details page
  if (selectedCustomerId) {
    return (
      <CustomerDetails
        customerId={selectedCustomerId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nail artist list</h1>
          <p className="text-sm text-gray-500">Naillist list</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              <Upload className="h-4 w-4 mr-2" />
              CSV upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import CSV File</DialogTitle>
            </DialogHeader>
            <CsvUploader
              onUploadComplete={handleUploadComplete}
              closeDialog={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-gray-600">customer number</TableHead>
              <TableHead className="text-gray-600">name</TableHead>
              <TableHead className="text-gray-600">status</TableHead>
              <TableHead className="text-gray-600">age</TableHead>
              <TableHead className="text-gray-600">
                Nail artist history
              </TableHead>
              <TableHead className="text-gray-600">Occupation</TableHead>
              <TableHead className="text-gray-600">prefectures</TableHead>
              <TableHead className="text-gray-600">Application date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-red-600">
                  Error fetching data: {error}
                </TableCell>
              </TableRow>
            ) : artists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No customers found. Upload a CSV to get started.
                </TableCell>
              </TableRow>
            ) : (
              artists.map((artist) => (
                <TableRow
                  key={artist.id}
                  onClick={() => handleRowClick(artist.id)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell>{artist.customer_number}</TableCell>
                  <TableCell className="font-medium">{artist.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={`capitalize ${getStatusBadge(
                        artist.status || "unknown"
                      )}`}
                    >
                      {artist.status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{artist.age}</TableCell>
                  <TableCell>{artist.nail_technician_experience}</TableCell>
                  <TableCell>{artist.occupation}</TableCell>
                  <TableCell>{artist.prefecture}</TableCell>
                  <TableCell>{artist.application_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
