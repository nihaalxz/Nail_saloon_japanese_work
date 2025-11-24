import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import TimeTab from "../../../components/tabs/TimeTab";
import OneColorTab from "../../../components/tabs/OneColorTab";
import type { Database } from "@/lib/database.types";

// Define the types
type SkillCheckRow = Database["public"]["Tables"]["skill_checks"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

interface SkillCheckWithCustomer extends SkillCheckRow {
  customers?: CustomerRow | CustomerRow[] | null;
}

export default function SkillCheckPage({ params }: { params: { id: string } }) {
  const [currentCheck, setCurrentCheck] =
    useState<SkillCheckWithCustomer | null>(null);
  const [previousCheck, setPreviousCheck] =
    useState<SkillCheckWithCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const checkId = Number(params.id);

        if (isNaN(checkId)) {
          console.error("Invalid ID");
          return;
        }

        // 1. Fetch Current Check
        const { data: currentData, error: currentError } = await supabase
          .from("skill_checks")
          .select("*, customers(*)")
          .eq("id", checkId)
          .single();

        if (currentError) throw currentError;

        const currentRecord = currentData as unknown as SkillCheckWithCustomer;
        setCurrentCheck(currentRecord);

        // 2. Fetch Previous Check
        if (currentRecord) {
          const { data: prevData, error: prevError } = await supabase
            .from("skill_checks")
            .select("*, customers(*)")
            .eq("customer_id", currentRecord.customer_id)
            .lt("imported_at", currentRecord.imported_at)
            .order("imported_at", { ascending: false })
            .limit(1)
            .single();

          if (prevError && prevError.code !== "PGRST116") {
            console.error("Error fetching previous:", prevError);
          } else if (prevData) {
            setPreviousCheck(prevData as unknown as SkillCheckWithCustomer);
          } else {
            setPreviousCheck(null);
          }
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

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading analysis...</div>
    );
  if (!currentCheck)
    return (
      <div className="p-10 text-center text-red-500">Record not found.</div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 min-h-screen space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-800">
          Skill Check Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Viewing results for{" "}
          {Array.isArray(currentCheck.customers)
            ? currentCheck.customers[0]?.name
            : currentCheck.customers?.name}
        </p>
      </div>

      {/* 1. Time Tab */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          Time Efficiency
        </h2>
        <TimeTab currentCheck={currentCheck} previousCheck={previousCheck} />
      </div>

      {/* 2. One Color Tab */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
          One Color Details
        </h2>
        {/* FIX: Used 'unknown' then 'SkillCheckRow' to satisfy Typescript without using 'any' */}
        <OneColorTab
          currentCheck={currentCheck as unknown as SkillCheckRow}
          previousCheck={previousCheck as unknown as SkillCheckRow}
        />
      </div>
    </div>
  );
}
