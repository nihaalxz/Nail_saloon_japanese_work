import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, User } from "lucide-react";
import type { Customer, SkillCheck } from "@/types";

// Import components
import ComprehensiveTab from "@/components/tabs/ComprehensiveTab";
import CareTab from "@/components/tabs/CareTab";
import OneColorTab from "@/components/tabs/OneColorTab";
import TimeTab from "@/components/tabs/TimeTab";

interface CustomerDetailsProps {
  customerId: number;
  onBack: () => void;
}

export default function CustomerDetails({
  customerId,
  onBack,
}: CustomerDetailsProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [skillChecks, setSkillChecks] = useState<SkillCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "comprehensive" | "care" | "one color" | "time"
  >("comprehensive");

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();
      if (customerError) throw customerError;
      setCustomer(customerData);

      const { data: checksData, error: checksError } = await supabase
        .from("skill_checks")
        .select("*")
        .eq("customer_id", customerId)
        .order("imported_at", { ascending: false });
      if (checksError) throw checksError;
      setSkillChecks(checksData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PUPPETEER DOWNLOAD LOGIC ---
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch from the SEPARATE Backend Server (Port 3001)
      const response = await fetch(
        `http://localhost:3001/generate-pdf?customerId=${customerId}`,
        {
          method: "GET",
        }
      );

      // 2. Check for server errors (non-200 status)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      // 3. Handle the Binary PDF Data (Blob)
      const blob = await response.blob();

      // 4. Validate Blob size (prevents downloading empty error files)
      if (blob.size < 1000) {
        throw new Error("Received empty or corrupt PDF file from server.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Filename fallback
      const fileName = `${customer?.name || "Customer"}_Report.pdf`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      // <--- FIXED: Changed 'any' to 'unknown'
      console.error("PDF Download Error:", error);

      // Safe error message extraction
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      alert(`Failed to download PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };
  // -------------------------------

  const currentCheck = skillChecks[0] || null;
  const previousCheck = skillChecks[1] || null;

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-white h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-gray-500">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-red-500">
        Customer not found. Please check the ID.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FFF5F5] min-h-screen font-sans text-slate-600 pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-white/50 px-8 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm border-b border-pink-100 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-500 hover:bg-white hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="font-bold text-gray-700">Basic skill check</h1>
        </div>
        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-300">
          <User size={16} />
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2 w-full lg:w-auto">
            <p className="text-teal-500 font-medium text-xs tracking-wider uppercase">
              Basic Nail Skills Check
            </p>
            <h2 className="text-4xl font-bold text-gray-800">
              {customer.name || "Unknown Name"}
            </h2>
            <div className="flex items-center gap-6 text-xs text-gray-500 font-mono pt-1">
              <span>ID: {customer.customer_number || "---"}</span>
              <span>
                Scoring date:{" "}
                {currentCheck?.imported_at
                  ? new Date(currentCheck.imported_at).toLocaleDateString(
                      "ja-JP"
                    )
                  : "N/A"}
              </span>
            </div>
            <div className="pt-4 print:hidden">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="bg-teal-600 hover:bg-teal-700 text-white h-9 text-xs shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-2" /> Save as PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-[#FFB7B2] bg-opacity-30 border border-[#FFB7B2] rounded-xl p-1.5 min-w-[220px] shadow-sm">
              <div className="bg-[#FF9E9E] text-white text-center py-1 rounded-t-lg text-xs font-bold uppercase tracking-wider">
                Score
              </div>
              <div className="bg-white h-24 flex items-center justify-center rounded-b-lg">
                <div className="flex items-baseline gap-1">
                  <span className="text-[#FF8FA3] text-4xl font-bold tracking-tighter">
                    {currentCheck?.total_score || 0}
                  </span>
                  <span className="text-gray-300 text-sm font-medium">
                    /1320
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#FFB7B2] bg-opacity-30 border border-[#FFB7B2] rounded-xl p-1.5 min-w-[180px] shadow-sm">
              <div className="bg-[#FF9E9E] text-white text-center py-1 rounded-t-lg text-xs font-bold uppercase tracking-wider">
                Evaluation Rank
              </div>
              <div className="bg-white h-24 flex items-center justify-center rounded-b-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF8FA3] text-2xl">♕</span>
                  <span className="text-[#FF8FA3] text-4xl font-bold">
                    {currentCheck?.rank || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-10 relative overflow-hidden">
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 print:hidden">
            {(["comprehensive", "care", "one color", "time"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-1.5 rounded-sm text-xs font-bold transition-colors uppercase tracking-wide 
                  ${
                    activeTab === tab
                      ? "bg-white text-teal-500 border-b-2 border-teal-400 shadow-sm"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 border-b-2 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {activeTab === "comprehensive" && (
            <ComprehensiveTab
              currentCheck={currentCheck}
              previousCheck={previousCheck}
            />
          )}
          {activeTab === "care" && (
            <CareTab
              currentCheck={currentCheck}
              previousCheck={previousCheck}
            />
          )}
          {activeTab === "one color" && (
            <OneColorTab
              currentCheck={currentCheck}
              previousCheck={previousCheck}
            />
          )}
          {activeTab === "time" && (
            <TimeTab
              currentCheck={currentCheck}
              previousCheck={previousCheck}
            />
          )}
        </div>

        {/* Footer Explainer Tables */}
        <div className="space-y-8 pb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-600 text-sm mb-3">
              Evaluation rank explanation
            </h3>
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#E5E5E5] text-gray-600">
                  <tr>
                    <th className="py-2 px-4 text-center w-32 border-r border-gray-300">
                      Evaluation rank
                    </th>
                    <th className="py-2 px-4 text-center">explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 text-center">
                  <tr>
                    <td className="py-3 font-bold bg-gray-50 border-r">AAA</td>
                    <td>There will be an explanation</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold bg-gray-50 border-r">A.A.</td>
                    <td>There will be an explanation</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold bg-gray-50 border-r">A</td>
                    <td>There will be an explanation</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold bg-gray-50 border-r">B</td>
                    <td>There will be an explanation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-600 text-sm mb-3">
              Evaluation rank criteria table
            </h3>
            <div className="border border-gray-200 rounded-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-center text-gray-600">
                <thead className="bg-[#E5E5E5]">
                  <tr>
                    <th className="py-2 px-4 border-r border-gray-300">
                      Evaluation rank
                    </th>
                    <th className="py-2 px-4 border-r border-gray-300 bg-[#D8D8D8]">
                      comprehensive
                    </th>
                    <th className="py-2 px-4 border-r border-gray-300 bg-[#D8D8D8]">
                      care
                    </th>
                    <th className="py-2 px-4 border-r border-gray-300 bg-[#D8D8D8]">
                      one color
                    </th>
                    <th className="py-2 px-4 bg-[#D8D8D8]">time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 font-bold border-r">AAA</td>
                    <td className="border-r">1123 ~ 1320</td>
                    <td className="border-r">349 ~ 410</td>
                    <td className="border-r">519 ~ 610</td>
                    <td>~ 60 min</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 font-bold border-r">A.A.</td>
                    <td className="border-r">958 ~ 1122</td>
                    <td className="border-r">298 ~ 348</td>
                    <td className="border-r">443 ~ 518</td>
                    <td>60 ~ 75 min</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold border-r">A</td>
                    <td className="border-r">793 ~ 957</td>
                    <td className="border-r">246 ~ 297</td>
                    <td className="border-r">367 ~ 442</td>
                    <td>75 ~ 90 min</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 font-bold border-r">B</td>
                    <td className="border-r">~ 792</td>
                    <td className="border-r">~ 245</td>
                    <td className="border-r">~ 366</td>
                    <td>90 min ~</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
