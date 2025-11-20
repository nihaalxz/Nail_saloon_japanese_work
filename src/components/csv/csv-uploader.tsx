import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
// Ensure this path points to your actual supabase client instance
import { supabase } from "@/lib/supabaseClient";
import Papa from "papaparse";
import type { Database } from "../../lib/database.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming you have shadcn/ui table components

// Get the specific TS types from our generated Database types
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type SkillCheckInsert = Database["public"]["Tables"]["skill_checks"]["Insert"];

interface CsvUploaderProps {
  onUploadComplete: () => void;
  closeDialog: () => void;
}

// Define the shape of a row from the CSV file.
interface CsvRow {
  customer_number?: string;
  name?: string;
  age?: string;
  nail_technician_experience?: string;
  occupation?: string;
  prefecture?: string;
  application_date?: string;
  total_score?: string;
  rank?: string;
  counseling_comment?: string;
  counseling_score?: string;
  filing_score?: string;
  care_score?: string;
  color_score?: string;
  art_score?: string;
  total_time?: string;
}

// Helper: Safely parse integers. Returns null if the value is empty or not a number.
// This prevents "NaN" errors in the database.
const safeParseInt = (value: string | undefined | null): number | null => {
  if (!value || value.trim() === "") return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

export function CsvUploader({
  onUploadComplete,
  closeDialog,
}: CsvUploaderProps) {
  const session = useSession();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Parse immediately for preview (Show first 5 rows)
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5, // Limit to 5 rows for the preview UI
        complete: (results) => {
          // Clean up rows just like we do in the upload
          const rows = (results.data as CsvRow[]).filter((row) =>
            Object.values(row).some((val) => val !== null && val !== "")
          );
          setPreviewData(rows);
        },
        error: (error) => {
          toast({
            title: "Error reading file",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const processUpload = async () => {
    if (!file) return;
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Parse the FULL file for upload
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = (results.data as CsvRow[]).filter((row) =>
          Object.values(row).some((val) => val !== null && val !== "")
        );

        let processedCount = 0;

        if (rows.length === 0) {
          toast({
            title: "No Data Found",
            description: "The CSV file is empty or contains no valid data.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }

        for (const row of rows) {
          try {
            if (!row.customer_number) {
              console.warn("Skipped row missing customer_number", row);
              continue;
            }

            // 1. Prepare Customer Data
            const customerData: CustomerInsert = {
              customer_number: row.customer_number,
              name: row.name,
              age: safeParseInt(row.age),
              nail_technician_experience: row.nail_technician_experience,
              occupation: row.occupation,
              prefecture: row.prefecture,
              application_date:
                row.application_date || new Date().toISOString().split("T")[0],
              status: "New",
            };

            // 2. Upsert Customer
            const { data: customer, error: customerError } = await supabase
              .from("customers")
              .upsert(customerData, {
                onConflict: "customer_number",
              })
              .select("id")
              .single();

            if (customerError) throw new Error(customerError.message);
            if (!customer) throw new Error("RLS blocked customer creation.");

            // 3. Prepare Skill Check Data
            const skillCheckData: SkillCheckInsert = {
              customer_id: customer.id,
              imported_by: session.user.id,
              imported_at: new Date().toISOString(),
              total_score: safeParseInt(row.total_score),
              rank: row.rank,
              counseling_comment: row.counseling_comment,
              counseling_score: safeParseInt(row.counseling_score),
              filing_score: safeParseInt(row.filing_score),
              care_score: safeParseInt(row.care_score),
              color_score: safeParseInt(row.color_score),
              art_score: safeParseInt(row.art_score),
              total_time: row.total_time,
            };

            // 4. Insert Skill Check
            const { error: skillError } = await supabase
              .from("skill_checks")
              .insert([skillCheckData]);

            if (skillError) throw new Error(skillError.message);
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.error(`Row error (${row.name}):`, errorMessage);
            // Optional: Toast for individual errors, or just log to console to prevent spam
          }

          processedCount++;
          setProgress((processedCount / rows.length) * 100);
        }

        setIsUploading(false);
        toast({
          title: "Upload Complete",
          description: `Successfully processed ${processedCount} records.`,
        });
        onUploadComplete();
        closeDialog();
      },
      error: (error) => {
        setIsUploading(false);
        toast({
          title: "Parsing Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="grid gap-6 p-4 max-h-[80vh] overflow-y-auto">
      <div className="space-y-1">
        <h4 className="font-medium">Upload CSV</h4>
        <p className="text-sm text-gray-500">
          Select a CSV file to import. Verify the preview data below before
          uploading.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* PREVIEW TABLE */}
      {previewData.length > 0 && (
        <div className="border rounded-md p-2 bg-slate-50">
          <p className="text-xs font-semibold mb-2 text-muted-foreground">
            Preview (First 5 rows):
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {row.customer_number}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell className="text-right">
                      {row.total_score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-center text-muted-foreground">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}

      <Button
        onClick={processUpload}
        disabled={!file || isUploading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isUploading ? "Uploading..." : "Confirm Upload"}
      </Button>
    </div>
  );
}
