import { useMemo, useState, useRef, useLayoutEffect } from "react";
import { ArrowUp, ArrowDown, Minus, MoveRight } from "lucide-react";
import type { Database } from "./../../lib/database.types";

// --- TYPES ---
type SkillCheckRow = Database["public"]["Tables"]["skill_checks"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

// EXTENDED TYPE: Matches .select('*, customers(*)')
interface SkillCheckWithCustomer extends SkillCheckRow {
  customers?: CustomerRow | CustomerRow[] | null; // Handle object or array
}

interface TabProps {
  currentCheck: SkillCheckWithCustomer | null;
  previousCheck?: SkillCheckWithCustomer | null;
}

interface TimeTableItem {
  id: string;
  label: string;
  category: string;
  catSpan: number;
  allocation: number;
  keyScore: keyof SkillCheckRow;
  keyValue?: keyof SkillCheckRow;
  keyTime?: keyof SkillCheckRow | keyof CustomerRow;
  source: "skill" | "customer" | "calculated"; // Added 'calculated' for 29-7
}

// --- DATA CONFIGURATION ---
const TIME_TABLE_STRUCTURE: TimeTableItem[] = [
  {
    id: "29",
    label: "29. Total Time",
    category: "Total",
    catSpan: 1,
    allocation: 10,
    keyScore: "time_score",
    keyValue: "total_time",
    keyTime: "total_time",
    source: "skill",
  },
  {
    id: "29-1",
    label: "29-1. Time Off",
    category: "Breakdown",
    catSpan: 3,
    allocation: 20,
    keyScore: "care_off_finish_score",
    keyTime: "time_off_fill",
    source: "customer",
  },
  {
    id: "29-2",
    label: "29-2. Time Fill",
    category: "Breakdown",
    catSpan: 0,
    allocation: 10,
    keyScore: "care_file_finish_score",
    keyTime: "time_off_fill",
    source: "customer",
  },
  {
    id: "29-3",
    label: "29-3. Time Care",
    category: "Breakdown",
    catSpan: 0,
    allocation: 10,
    keyScore: "care_score",
    keyTime: "time_preparation",
    source: "customer",
  },
  {
    id: "29-4",
    label: "29-4. Base",
    category: "One Color",
    catSpan: 4,
    allocation: 20,
    keyScore: "color_base_score",
    keyTime: "time_one_color",
    source: "customer",
  },
  {
    id: "29-5",
    label: "29-5. Color",
    category: "One Color",
    catSpan: 0,
    allocation: 10,
    keyScore: "color_score",
    keyTime: "time_one_color",
    source: "customer",
  },
  {
    id: "29-6",
    label: "29-6. Top",
    category: "One Color",
    catSpan: 0,
    allocation: 20,
    keyScore: "color_apex_score",
    keyTime: "time_top_finish",
    source: "customer",
  },
  {
    id: "29-7",
    label: "29-7. Total",
    category: "One Color",
    catSpan: 0,
    allocation: 20,
    keyScore: "total_score",
    source: "calculated", // Special handling
  },
];

// --- HELPERS ---

// Helper to safely extract the customer object whether it's an array or object
const getCustomerData = (data: SkillCheckWithCustomer) => {
  if (!data.customers) return null;
  if (Array.isArray(data.customers)) {
    return data.customers.length > 0 ? data.customers[0] : null;
  }
  return data.customers;
};

const getRowData = (
  data: SkillCheckWithCustomer | null | undefined,
  row: TimeTableItem
) => {
  if (!data) return { score: 0, timeValue: null };

  const score = (data[row.keyScore] as number) || 0;
  let timeValue: string | number | null = null;

  // 1. Handle Calculated Row (29-7)
  if (row.source === "calculated" && row.id === "29-7") {
    const cust = getCustomerData(data);
    if (cust) {
      // Sum of one_color and top_finish
      const t1 = (cust.time_one_color as number) || 0;
      const t2 = (cust.time_top_finish as number) || 0;
      timeValue = t1 + t2;
    }
  }
  // 2. Handle Customer Data
  else if (row.source === "customer" && row.keyTime) {
    const cust = getCustomerData(data);
    if (cust) {
      timeValue = cust[row.keyTime as keyof CustomerRow] as number | null;
    }
  }
  // 3. Handle Skill Check Data
  else if (row.source === "skill" && row.keyTime) {
    timeValue = data[row.keyTime as keyof SkillCheckRow] as string | null;
  }

  return { score, timeValue };
};

const formatTimeDisplay = (val: string | number | null): string => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "number") {
    // Check if 0 to avoid returning "-" for valid 0 minutes
    return `${val} minutes`;
  }
  return String(val);
};

const renderTrend = (current: number, target: number) => {
  if (current == null || target == null)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (current > target)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />;
  if (current < target)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />;
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

// --- GRAPH HELPERS ---
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const makePath = (
  dataPoints: number[],
  maxValues: number[],
  radius: number,
  cx: number,
  cy: number
) => {
  const totalAxes = 6;
  return (
    dataPoints
      .map((val, i) => {
        const max = maxValues[i] || 1;
        const normalized = Math.min(val / max, 1);
        const r = radius * normalized;
        const angle = (360 / totalAxes) * i;
        const { x, y } = polarToCartesian(cx, cy, r, angle);
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ") + " Z"
  );
};

// --- MAIN COMPONENT ---
export default function TimeTab({ currentCheck, previousCheck }: TabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPath, setSvgPath] = useState("");

  // 1. Calculate percentages
  const allPercentages = useMemo(() => {
    return TIME_TABLE_STRUCTURE.map((row) => {
      const { score } = getRowData(currentCheck, row);
      return (Math.min(score, row.allocation) / row.allocation) * 100;
    });
  }, [currentCheck]);

  // 2. Dynamic Line Calculation
  useLayoutEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const dots = containerRef.current.querySelectorAll(".graph-dot-marker");
      if (dots.length === 0) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const points: { x: number; y: number }[] = [];

      dots.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;
        points.push({ x, y });
      });

      const path = points.reduce(
        (acc, p, index) =>
          index === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`,
        ""
      );
      setSvgPath(path);
    };

    const timeoutId = setTimeout(updatePath, 50);
    window.addEventListener("resize", updatePath);
    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timeoutId);
    };
  }, [allPercentages]);

  // 3. Radar Data
  const radarData = useMemo(() => {
    const safeGet = (key: keyof SkillCheckRow) =>
      (currentCheck?.[key] as number) || 0;

    return [
      { label: "Total Time", value: safeGet("time_score"), max: 10 },
      { label: "Off/Fill", value: safeGet("care_off_finish_score"), max: 20 },
      { label: "Care", value: safeGet("care_score"), max: 10 },
      {
        label: "One Color (Base)",
        value: safeGet("color_base_score"),
        max: 20,
      },
      { label: "One Color (Color)", value: safeGet("color_score"), max: 10 },
      { label: "One Color (Top)", value: safeGet("color_apex_score"), max: 20 },
    ];
  }, [currentCheck]);

  // --- SUMMARY CONSTANTS ---
  const NATIONAL_AVG = {
    rank: "B",
    score: 267,
    time: "104 minutes 54 seconds",
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* --- SUMMARY TABLE --- */}
      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-center text-sm border-collapse">
          <thead>
            <tr className="text-white">
              <th className="bg-[#E5E7EB] text-gray-600 font-bold w-[15%] border-r border-white">
                Category
              </th>
              <th
                colSpan={2}
                className="bg-[#56B8D4] py-2 font-medium border-r border-white w-[28%]"
              >
                National average
              </th>
              <th
                colSpan={2}
                className="bg-[#4682B4] py-2 font-medium border-r border-white w-[28%]"
              >
                last time
              </th>
              <th colSpan={2} className="bg-[#FF9B9B] py-2 font-medium w-[29%]">
                this time
              </th>
            </tr>
            <tr className="text-white text-xs">
              <th className="bg-[#56B8D4] border-r border-white"></th>
              <th className="bg-[#8ED0E0] py-1 font-normal border-r border-white">
                Evaluation rank
              </th>
              <th className="bg-[#8ED0E0] py-1 font-normal border-r border-white">
                Score
              </th>
              <th className="bg-[#7DAED4] py-1 font-normal border-r border-white">
                Evaluation rank
              </th>
              <th className="bg-[#7DAED4] py-1 font-normal border-r border-white">
                Score
              </th>
              <th className="bg-[#FFBDBD] py-1 font-normal border-r border-white">
                Evaluation rank
              </th>
              <th className="bg-[#FFBDBD] py-1 font-normal">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white h-12">
              <td
                rowSpan={2}
                className="bg-[#56B8D4] text-white font-bold align-middle border-r border-white border-t-0"
              >
                time
              </td>
              <td className="text-[#56B8D4] font-bold border-r border-gray-200">
                {NATIONAL_AVG.rank}
              </td>
              <td className="text-[#56B8D4] font-bold border-r border-gray-200">
                {NATIONAL_AVG.score}
                <span className="text-gray-400 text-xs font-normal">/300</span>
              </td>
              <td className="text-gray-400 bg-gray-100 border-r border-gray-200 font-bold">
                {previousCheck?.rank || ""}
              </td>
              <td className="text-gray-400 bg-gray-100 border-r border-gray-200 font-bold">
                {previousCheck?.total_score}
              </td>
              <td className="text-[#FF4520] font-bold border-r border-gray-200">
                {currentCheck?.rank || "-"}
              </td>
              <td className="text-[#FF4520] font-bold">
                {currentCheck?.total_score || "-"}
                <span className="text-gray-400 text-xs font-normal">/300</span>
              </td>
            </tr>
            <tr className="bg-white h-10">
              <td
                colSpan={2}
                className="text-[#56B8D4] font-bold text-sm border-t border-gray-100 border-r border-gray-200"
              >
                {NATIONAL_AVG.time}
              </td>
              <td
                colSpan={2}
                className="text-gray-400 bg-gray-100 font-bold text-sm border-t border-gray-100 border-r border-gray-200"
              >
                {previousCheck?.total_time || ""}
              </td>
              <td
                colSpan={2}
                className="text-[#FF4520] font-bold text-sm border-t border-gray-100"
              >
                {currentCheck?.total_time || "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- BREAKDOWN TABLE --- */}
      <div
        ref={containerRef}
        className="relative rounded-sm border border-teal-100 shadow-sm bg-white"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ overflow: "visible" }}
        >
          <path
            d={svgPath}
            fill="none"
            stroke="#56B8D4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <table className="w-full table-fixed text-[10px] text-center border-collapse relative z-10">
          <thead>
            <tr className="text-white text-xs h-10">
              <th
                colSpan={2}
                className="bg-[#56B8D4] p-1 border-r border-white/30 w-[20%]"
              >
                Category
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[6%]">
                Points
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[5%]">
                Trend
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[12%]">
                Average
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[5%]">
                Trend
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[12%]">
                Last Time
              </th>
              <th className="bg-[#56B8D4] p-1 border-r border-white/30 w-[15%]">
                This Time
              </th>
              <th colSpan={4} className="bg-[#56B8D4] p-1 w-[25%]">
                Evaluation Graph
              </th>
            </tr>
            <tr className="text-white text-[9px] h-6">
              <th
                colSpan={8}
                className="bg-gray-100 border-r border-white"
              ></th>
              <th className="bg-[#FCEE9C] text-yellow-700 border-r border-white w-[6.25%]">
                B
              </th>
              <th className="bg-[#56B8D4] border-r border-white w-[6.25%]">
                A
              </th>
              <th className="bg-[#56B8D4] border-r border-white w-[6.25%]">
                AA
              </th>
              <th className="bg-[#56B8D4] w-[6.25%]">AAA</th>
            </tr>
          </thead>

          <tbody className="text-gray-600">
            {TIME_TABLE_STRUCTURE.map((row, index) => {
              // 1. Get Current Data
              const { score: currentScore, timeValue: currentTimeVal } =
                getRowData(currentCheck, row);
              const currentDisplay = formatTimeDisplay(currentTimeVal);

              // 2. Get Previous Data
              const { score: prevScore, timeValue: prevTimeVal } = getRowData(
                previousCheck,
                row
              );
              const prevDisplay = formatTimeDisplay(prevTimeVal);

              const avgScore = Math.floor(row.allocation * 0.8);
              const percentage =
                (Math.min(currentScore, row.allocation) / row.allocation) * 100;
              const isTotalRow = row.id === "29";
              const rowClass = isTotalRow ? "bg-[#D6EAF0]" : "hover:bg-gray-50";

              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 ${rowClass} h-11`}
                >
                  {isTotalRow ? (
                    <td
                      colSpan={2}
                      className="text-teal-700 font-bold p-2 border-r border-white align-middle text-left pl-4 text-xs"
                    >
                      {row.label}
                    </td>
                  ) : (
                    <>
                      {row.catSpan > 0 && (
                        <td
                          rowSpan={row.catSpan}
                          className="bg-[#D6EAF0] text-teal-700 font-bold p-2 border-r border-white align-middle text-center text-xs w-[8%]"
                        >
                          {row.category}
                        </td>
                      )}
                      <td className="bg-[#F9FAFB] text-gray-700 font-medium border-r border-gray-100 text-left px-2 w-[12%]">
                        {row.label}
                      </td>
                    </>
                  )}

                  <td className="font-bold border-r border-gray-100 align-middle text-sm text-black">
                    {row.allocation}
                  </td>

                  <td className="border-r border-gray-100 bg-[#F0FAFC] align-middle">
                    {renderTrend(currentScore, avgScore)}
                  </td>
                  <td className="text-teal-600 font-bold border-r border-gray-100 bg-[#F0FAFC] align-middle">
                    30m 54s
                  </td>

                  <td className="border-r border-gray-100 bg-[#D9D9D9] align-middle">
                    {renderTrend(currentScore, prevScore)}
                  </td>
                  <td className="text-gray-500 font-bold border-r border-gray-100 bg-[#D9D9D9] align-middle text-[10px]">
                    {prevDisplay !== "-" ? prevDisplay : "-"}
                  </td>

                  <td className="text-[#FF4520] font-bold border-r border-gray-100 bg-white align-middle text-sm">
                    {currentDisplay}
                  </td>

                  {/* Graph */}
                  <td
                    colSpan={4}
                    className="relative p-0 h-full align-middle bg-white"
                  >
                    <div className="absolute inset-0 flex w-full h-full pointer-events-none">
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full bg-yellow-50/20"></div>
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full"></div>
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full"></div>
                      <div className="w-1/4 h-full"></div>
                    </div>
                    <div
                      className="absolute top-1/2 left-0 h-2.5 bg-[#FFDACD] transform -translate-y-1/2 rounded-r-full z-0 opacity-90"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div
                      className="graph-dot-marker absolute top-1/2 w-2 h-2 bg-[#56B8D4] rounded-full shadow-sm z-30 transform -translate-y-1/2 -translate-x-1/2 border border-white"
                      style={{ left: `${percentage}%` }}
                      data-index={index}
                    ></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- RADAR CHART --- */}
      <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center">
        <h3 className="w-full text-left text-gray-700 font-semibold border-b pb-2 mb-6 text-sm">
          Graph Name
        </h3>
        <div className="relative w-[400px] h-[400px]">
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
            {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
              <path
                key={i}
                d={makePath(
                  radarData.map(() => 100),
                  radarData.map(() => 100),
                  140 * scale,
                  200,
                  200
                )}
                fill="none"
                stroke="#E5E7EB"
                strokeDasharray={i === 4 ? "" : "4 4"}
                strokeWidth="1"
              />
            ))}
            {radarData.map((_, i) => {
              const { x, y } = polarToCartesian(200, 200, 140, (360 / 6) * i);
              return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              );
            })}
            {radarData.map((item, i) => {
              const { x, y } = polarToCartesian(200, 200, 165, (360 / 6) * i);
              let anchor: "start" | "middle" | "end" = "middle";
              if (x < 180) anchor = "end";
              if (x > 220) anchor = "start";

              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  className="text-[10px] fill-teal-600 font-medium uppercase"
                  textAnchor={anchor}
                  dominantBaseline="middle"
                >
                  {item.label}
                </text>
              );
            })}
            <path
              d={makePath(
                radarData.map((d) => d.value),
                radarData.map((d) => d.max),
                140,
                200,
                200
              )}
              fill="rgba(255, 69, 32, 0.1)"
              stroke="#FF4520"
              strokeWidth="2"
            />
            <path
              d={makePath(
                [8, 15, 7, 14, 8, 16],
                radarData.map((d) => d.max),
                140,
                200,
                200
              )}
              fill="none"
              stroke="#56B8D4"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
