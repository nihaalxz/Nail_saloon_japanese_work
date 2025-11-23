import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient"; // Adjust to your client path
import OneColorTab from "../../../components/tabs/OneColorTab"; // Import your component
import type { Database } from "@/lib/database.types";

type SkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"];

export default function SkillCheckPage({ params }: { params: { id: string } }) {
  const [currentCheck, setCurrentCheck] = useState<SkillCheck | null>(null);
  const [previousCheck, setPreviousCheck] = useState<SkillCheck | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ); // Call createClient with no arguments

  useEffect(() => {
    const fetchData = async () => {
      try {
        const checkId = Number(params.id);

        // 1. Fetch Current Check
        const { data: currentData, error: currentError } = await supabase
          .from("skill_checks")
          .select("*")
          .eq("id", checkId)
          .single();

        if (currentError) throw currentError;
        setCurrentCheck(currentData);

        // 2. Fetch Previous Check using the SQL RPC we created
        // Note: returns an array, we take the first item
        const { data: prevData, error: prevError } = await supabase.rpc(
          "get_previous_skill_check",
          { lookup_id: checkId }
        );

        if (prevError) {
          console.error("Error fetching previous:", prevError);
        } else if (prevData && prevData.length > 0) {
          setPreviousCheck(prevData[0]);
        } else {
          setPreviousCheck(null);
        }
      } catch (error) {
        console.error("Error loading skill checks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, supabase]);

  if (loading) return <div>Loading analysis...</div>;
  if (!currentCheck) return <div>Record not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-teal-800 mb-6">
        Skill Check Analysis
      </h1>

      {/* Render the Tab with dynamic data */}
      <OneColorTab currentCheck={currentCheck} previousCheck={previousCheck} />
    </div>
  );
}
