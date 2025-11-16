import { useState } from 'react';
// 1. Remove `useSupabaseClient` from this import
import { useSession } from '@supabase/auth-helpers-react';
// 2. Add the direct import to our typed client
import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import type { Database } from '../../lib/database.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast'; 

// Get the specific TS types from our generated Database types
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type SkillCheckInsert = Database['public']['Tables']['skill_checks']['Insert'];

// This prop will be a function passed from Dashboard to refresh the table
interface CsvUploaderProps {
  onUploadComplete: () => void;
  closeDialog: () => void;
}

export function CsvUploader({ onUploadComplete, closeDialog }: CsvUploaderProps) {
  // 3. Remove this line. The `supabase` variable now comes from the import.
  // const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const { toast } = useToast(); 

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let processedCount = 0;

        for (const row of rows) {
          try {
            // Check for required data
            if (!row.customer_number) {
              toast({
                title: "Skipped Row",
                description: `Skipped row with name "${row.name || 'N/A'}" due to missing 'customer_number'.`,
                variant: "destructive",
              });
              continue; // Skip this row
            }

            // 1. Prepare Customer Data (from Request #8)
            const customerData: CustomerInsert = {
              customer_number: row.customer_number,
              name: row.name,
              age: row.age ? parseInt(row.age, 10) : null,
              nail_technician_experience: row.nail_technician_experience,
              occupation: row.occupation,
              prefecture: row.prefecture,
              application_date: row.application_date || new Date().toISOString().split('T')[0],
              status: 'New', // Default status
            };

            // 2. Find or Create Customer (Upsert)
            const { data: customer, error: customerError } = await supabase
              .from('customers')
              .upsert(customerData, { onConflict: 'customer_number' })
              .select('id')
              .single();

            if (customerError) throw new Error(`Customer upsert error: ${customerError.message}`);
            if (!customer) throw new Error("Failed to find or create customer.");

            // 3. Prepare Skill Check Data (from Request #21/22)
            const skillCheckData: SkillCheckInsert = {
              customer_id: customer.id, // Link to the customer
              imported_by: session.user.id, // Link to admin (Request #14)
              imported_at: new Date().toISOString(),
              
              // === Assumed CSV headers for scores ===
              total_score: row.total_score ? parseInt(row.total_score, 10) : null,
              rank: row.rank,
              counseling_comment: row.counseling_comment,
              counseling_score: row.counseling_score ? parseInt(row.counseling_score, 10) : null,
              filing_score: row.filing_score ? parseInt(row.filing_score, 10) : null,
              care_score: row.care_score ? parseInt(row.care_score, 10) : null,
              color_score: row.color_score ? parseInt(row.color_score, 10) : null,
              art_score: row.art_score ? parseInt(row.art_score, 10) : null,
              total_time: row.total_time,
            };

            // 4. Insert the new Skill Check
            const { error: skillError } = await supabase
              .from('skill_checks')
              .insert(skillCheckData); // This error will be gone
              
            if (skillError) throw new Error(`Skill check insert error: ${skillError.message}`);

          } catch (error: any) {
            toast({
              title: "Upload Error",
              description: `Failed to process row for ${row.name || 'N/A'}: ${error.message}`,
              variant: "destructive",
            });
            // Continue processing other rows
          }

          processedCount++;
          setProgress((processedCount / rows.length) * 100);
        }

        // 5. All done
        setIsUploading(false);
        toast({
          title: "Upload Complete",
          description: `Successfully processed ${processedCount} records.`,
        });
        onUploadComplete(); // Refresh the dashboard table
        closeDialog(); // Close the modal
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
    <div className="grid gap-4 p-4">
      <div className="space-y-1">
        <h4 className="font-medium">Upload CSV</h4>
        <p className="text-sm text-gray-500">
          Select a CSV file to import. This will create new skill check records.
        </p>
      </div>
      <Input
        id="csv-file"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && <Progress value={progress} className="w-full" />}
      <Button
        onClick={processUpload}
        disabled={!file || isUploading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isUploading ? 'Uploading...' : 'Start Upload'}
      </Button>
    </div>
  );
}