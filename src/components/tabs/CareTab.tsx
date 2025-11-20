import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Minus, Star, MoveRight } from "lucide-react";

import type { Database } from "./../../lib/database.types";

// Allow dynamic access to scores via string keys
type SkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"] & {
  [key: string]: number | string | boolean | null | undefined;
};

interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

// --- DATA STRUCTURE ---
// UPDATED: Each row now has a unique 'key' corresponding to a specific data point.
// Ensure your CSV/DB columns match these keys (e.g., care_1_1, care_1_2).
const CARE_TABLE_STRUCTURE = [
  // --- CATEGORY: FILE / FILE (Shearling) ---
  {
    category: "file / file",
    catSpan: 7,
    item: "1. off sharpening",
    itemSpan: 2,
    id: "1-1",
    label: "Too much scrap",
    allocation: 10,
    key: "care_1_1",
  },
  {
    id: "1-2",
    label: "Insufficient cut",
    allocation: 20,
    key: "care_1_2",
  },
  // --- CATEGORY: FILE / FILE (Off Finish) ---
  {
    item: "2. off finish",
    itemSpan: 1,
    id: "2-1",
    label: "remaining gel",
    allocation: 20,
    key: "care_2_1",
  },
  // --- CATEGORY: FILE / FILE (File Finish) ---
  {
    item: "3. Fill-in Finish",
    itemSpan: 4,
    id: "3-1",
    label: "root step",
    allocation: 10,
    key: "care_3_1",
  },
  {
    id: "3-2",
    label: "Surface unevenness",
    allocation: 10,
    key: "care_3_2",
  },
  {
    id: "3-3",
    label: "side shaving",
    allocation: 20,
    key: "care_3_3",
  },
  {
    id: "3-4",
    label: "Thickness",
    allocation: 10,
    key: "care_3_4",
  },

  // --- CATEGORY: FILE (Shape) ---
  {
    category: "file / file",
    catSpan: 8,
    item: "4. length/shape",
    itemSpan: 3,
    id: "4-1",
    label: "rattling",
    allocation: 20,
    required: true,
    key: "care_4_1",
  },
  { id: "4-2", label: "balance", allocation: 20, key: "care_4_2" },
  {
    id: "4-3",
    label: "unity of form",
    allocation: 30,
    required: true,
    key: "care_4_3",
  },
  // --- CATEGORY: FILE (Side) ---
  {
    item: "5. side straight",
    itemSpan: 3,
    id: "5-1",
    label: "Side drop",
    allocation: 10,
    key: "care_5_1",
  },
  { id: "5-2", label: "side rise", allocation: 20, key: "care_5_2" },
  {
    id: "5-3",
    label: "remaining corner",
    allocation: 20,
    key: "care_5_3",
  },
  // --- CATEGORY: FILE (Symmetry) ---
  {
    item: "6. symmetrical",
    itemSpan: 2,
    id: "6-1",
    label: "center",
    allocation: 10,
    key: "care_6_1",
  },
  {
    id: "6-2",
    label: "symmetrical",
    allocation: 20,
    key: "care_6_2",
  },

  // --- CATEGORY: CUTICLE CARE ---
  {
    category: "cuticle care",
    catSpan: 11,
    item: "7. Right corner",
    itemSpan: 1,
    id: "7-1",
    label: "Loose cuticle",
    allocation: 20,
    key: "care_7_1",
  },
  {
    item: "8. Left corner",
    itemSpan: 1,
    id: "8-1",
    label: "Loose cuticle",
    allocation: 20,
    key: "care_8_1",
  },
  {
    item: "9. Right side",
    itemSpan: 1,
    id: "9-1",
    label: "Loose cuticle",
    allocation: 30,
    required: true,
    key: "care_9_1",
  },
  {
    item: "10. Left side",
    itemSpan: 1,
    id: "10-1",
    label: "Loose cuticle",
    allocation: 30,
    required: true,
    key: "care_10_1",
  },
  // --- CATEGORY: CUTICLE CARE (Loose Cuticle) ---
  {
    item: "11. side wall",
    itemSpan: 2,
    id: "11-1",
    label: "small nail",
    allocation: 10,
    key: "care_11_1",
  },
  {
    id: "11-2",
    label: "hard skin",
    allocation: 10,
    key: "care_11_2",
  },
  {
    item: "12. Cuticle line",
    itemSpan: 2,
    id: "12-1",
    label: "Loose cuticle",
    allocation: 20,
    required: true,
    key: "care_12_1",
  },
  {
    id: "12-2",
    label: "rattling",
    allocation: 20,
    key: "care_12_2",
  },
  // --- CATEGORY: CUTICLE CARE (Nipper) ---
  {
    item: "13. Nipper processing",
    itemSpan: 3,
    id: "13-1",
    label: "rattling",
    allocation: 20,
    key: "care_13_1",
  },
  {
    id: "13-2",
    label: "Cut too much",
    allocation: 20,
    key: "care_13_2",
  },
  { id: "13-3", label: "Hangnail", allocation: 10, key: "care_13_3" },
];

// --- HELPERS ---
const renderTrend = (current: number, target: number) => {
  if (current === undefined || target === undefined)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (current > target)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />;
  if (current < target)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />;
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

// Helper to sum scores based on ranges in the config
const calculateSum = (
  data: SkillCheck | null,
  rangeStart: number,
  rangeEnd: number
) => {
  if (!data) return 0;

  let sum = 0;
  CARE_TABLE_STRUCTURE.forEach((row) => {
    const mainId = parseInt(row.id.split("-")[0], 10);

    if (mainId >= rangeStart && mainId <= rangeEnd) {
      const raw = data[row.key];
      const n = raw == null ? 0 : Number(raw);
      sum += Number.isFinite(n) ? n : 0;
    }
  });

  return sum;
};

// Helper for full total
const calculateTotal = (data: SkillCheck | null) => {
  if (!data) return 0;

  // 1. Use DB aggregate total if available
  if (typeof data.total_score === "number") return data.total_score;
  if (typeof data.care_score === "number") return data.care_score;

  // 2. Fallback: manually calculate from structure
  let sum = 0;
  CARE_TABLE_STRUCTURE.forEach((row) => {
    const raw = data[row.key];
    const n = raw == null ? 0 : Number(raw);
    sum += Number.isFinite(n) ? n : 0;
  });

  return sum;
};

// --- CUSTOM CHART COMPONENTS ---
interface CustomTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
}

const CustomAxisTick = ({ x, y, payload }: CustomTickProps) => {
  if (!payload) return <g />;
  const { value } = payload;
  const absX = Number(x) || 0;
  const absY = Number(y) || 0;

  let textAnchor: "middle" | "start" | "end" = "middle";
  let dy = 0;
  let dx = 0;

  if (value === "comprehensive care") {
    dy = -20;
  } else if (value === "file") {
    dy = 20;
  } else if (value.includes("re\nre")) {
    textAnchor = "end";
    dx = -25;
    dy = 0;
  } else {
    textAnchor = "start";
    dx = 25;
    dy = 0;
  }

  return (
    <g transform={`translate(${absX},${absY})`}>
      <text
        x={dx}
        y={dy}
        textAnchor={textAnchor}
        fill="#115e59"
        fontSize={12}
        fontWeight="bold"
      >
        {value.split("\n").map((line, i) => (
          <tspan x={dx} dy={i === 0 ? 0 : 14} key={i}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const CustomGridLabels = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-[80%] h-[80%]">
        {/* Top Axis (Care) */}
        <span className="absolute top-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
          410
        </span>
        {/* Right Axis (File 1-3) */}
        <span className="absolute top-1/2 right-[0%] text-[9px] text-gray-500 bg-white px-0.5">
          100
        </span>
        {/* Bottom Axis (File 4-6) */}
        <span className="absolute bottom-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
          150
        </span>
        {/* Left Axis (Cuticle) */}
        <span className="absolute top-1/2 left-[0%] text-[9px] text-gray-500 bg-white px-0.5">
          210
        </span>
        {/* Center */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-gray-500">
          0
        </span>
      </div>
    </div>
  );
};

export default function CareTab({ currentCheck, previousCheck }: TabProps) {
  // 1. Dynamically calculate totals for the Chart
  const careChartData = useMemo(() => {
    // Group 1: 1-3 (File 1) Max 100
    const fileGroupRight = calculateSum(currentCheck, 1, 3);
    // Group 2: 4-6 (File 2) Max 150
    const fileGroupBottom = calculateSum(currentCheck, 4, 6);
    // Group 3: 7-13 (Cuticle) Max 210
    const cuticleGroup = calculateSum(currentCheck, 7, 13);
    // Total Care Max 410 (Calculated sum of all items)
    const totalCare = fileGroupRight + fileGroupBottom + cuticleGroup;

    return [
      {
        subject: "comprehensive care",
        A: (totalCare / 410) * 100,
        fullMark: 100,
      },
      {
        subject: "file\n/\nfile\nfile",
        A: (fileGroupRight / 100) * 100,
        fullMark: 100,
      },
      {
        subject: "file",
        A: (fileGroupBottom / 150) * 100,
        fullMark: 100,
      },
      {
        subject: "re\nre\nre\n-",
        A: (cuticleGroup / 210) * 100,
        fullMark: 100,
      },
    ];
  }, [currentCheck]);

  // 2. Calculate Summary Table Data
  const thisTotal = useMemo(() => calculateTotal(currentCheck), [currentCheck]);
  const prevTotal = useMemo(
    () => calculateTotal(previousCheck),
    [previousCheck]
  );

  // Helper to get national average rank (Hardcoded logic based on total)
  const getRank = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return "AAA";
    if (pct >= 80) return "A.A.";
    if (pct >= 70) return "A";
    return "B";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Summary Table */}
      <div className="overflow-hidden rounded-sm border border-teal-500/20 shadow-sm">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-white text-xs">
              <th
                rowSpan={2}
                className="bg-[#E5E5E5] text-gray-700 font-bold w-32 border-r border-white"
              >
                Category
              </th>
              <th
                colSpan={2}
                className="bg-[#6AC2DB] py-2 border-r border-white font-medium"
              >
                National average
              </th>
              <th
                colSpan={2}
                className="bg-[#5B92CA] py-2 border-r border-white font-medium"
              >
                last time
              </th>
              <th colSpan={2} className="bg-[#FF9EAF] py-2 font-medium">
                this time
              </th>
            </tr>
            <tr className="text-white text-[11px]">
              <th className="bg-[#8ED4E8] py-1">Evaluation rank</th>
              <th className="bg-[#8ED4E8] py-1">Score</th>
              <th className="bg-[#7BAAD6] py-1">Evaluation rank</th>
              <th className="bg-[#7BAAD6] py-1">Score</th>
              <th className="bg-[#FFB7C3] py-1">Evaluation rank</th>
              <th className="bg-[#FFB7C3] py-1">Score</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            <tr className="bg-white">
              <td className="bg-[#6AC2DB] text-white py-4">care</td>
              <td className="text-teal-600">A</td>
              <td className="text-teal-600">
                267
                <span className="text-gray-400 text-xs font-normal">/410</span>
              </td>
              <td className="text-blue-600 bg-[#F2F6FA] border-r border-white">
                {getRank(prevTotal, 410)}
              </td>
              <td className="text-blue-600 bg-[#F2F6FA] border-r border-white">
                {prevTotal}
                <span className="text-gray-400 text-xs font-normal">/410</span>
              </td>
              <td className="text-red-500 bg-[#FFF5F7]">
                {getRank(thisTotal, 410)}
              </td>
              <td className="text-red-500 bg-[#FFF5F7]">
                {thisTotal}
                <span className="text-gray-400 text-xs font-normal">/410</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Table */}
      <div className="rounded-sm border border-teal-100 shadow-sm bg-white">
        <table className="w-full table-fixed text-[10px] text-center border-collapse">
          <thead>
            <tr className="text-white text-[10px]">
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[8%]"
              >
                Category
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 text-left w-[12%]"
              >
                Evaluation items
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[4%]"
              >
                Req
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[5%]"
              >
                Check pts
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 text-left w-[14%]"
              >
                Point allocation
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[5%]"
              >
                Alloc
              </th>
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[10%]"
              >
                average
              </th>
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[10%]"
              >
                last time
              </th>
              <th className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[5%]">
                this time
              </th>
              <th colSpan={4} className="bg-[#6AC2DB] p-1 w-[20%]">
                Evaluation graph
              </th>
            </tr>
            <tr className="text-white text-[9px]">
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                Trend
              </th>
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                Score
              </th>
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                Trend
              </th>
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                Score
              </th>
              <th className="bg-[#FF9EAF] border-r border-white/30 font-normal">
                Score
              </th>
              <th className="bg-[#FCEE9C] text-yellow-700 border-r border-white">
                B
              </th>
              <th className="bg-[#6AC2DB] border-r border-white">A</th>
              <th className="bg-[#6AC2DB] border-r border-white">A.A.</th>
              <th className="bg-[#6AC2DB]">AAA</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {CARE_TABLE_STRUCTURE.map((row) => {
              // Dynamic access using unique keys
              const currentVal = currentCheck
                ? (currentCheck[row.key] as number) || 0
                : 0;
              const prevVal = previousCheck
                ? (previousCheck[row.key] as number) || 0
                : 0;

              const natVal = Math.floor(row.allocation * 0.75);
              const rowScore = Math.min(currentVal, row.allocation);
              const percentage =
                row.allocation > 0 ? (rowScore / row.allocation) * 100 : 0;

              return (
                <tr
                  key={row.key}
                  className="border-b border-gray-100 hover:bg-gray-50 h-9"
                >
                  {row.catSpan && (
                    <td
                      rowSpan={row.catSpan}
                      className="bg-[#D6EAF0] text-teal-800 font-bold p-1 border-r border-white align-middle text-[9px] leading-tight"
                    >
                      <div className="whitespace-pre-line">{row.category}</div>
                    </td>
                  )}
                  {row.itemSpan && (
                    <td
                      rowSpan={row.itemSpan}
                      className="text-left p-1 border-r border-gray-100 bg-[#F9FAFB] font-medium align-middle border-b border-white leading-tight"
                    >
                      {row.item}
                    </td>
                  )}
                  <td className="border-r border-gray-100 bg-white align-middle">
                    {row.required && (
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400 mx-auto" />
                    )}
                  </td>
                  <td className="border-r border-gray-100 text-center text-[9px] text-gray-400 align-middle">
                    {row.id}
                  </td>
                  <td className="text-left px-2 text-[9px] border-r border-gray-100 font-medium truncate align-middle">
                    {row.label}
                  </td>
                  <td className="font-bold border-r border-gray-100 align-middle text-sm text-black">
                    {row.allocation}
                  </td>
                  <td className="border-r border-gray-100 bg-[#F0FAFC] align-middle">
                    {renderTrend(rowScore, natVal)}
                  </td>
                  <td className="text-teal-600 font-bold border-r border-gray-100 bg-[#F0FAFC] align-middle">
                    {natVal}
                  </td>
                  <td className="border-r border-gray-100 bg-[#F2F6FA] align-middle">
                    {renderTrend(rowScore, prevVal)}
                  </td>
                  <td className="text-blue-600 font-bold border-r border-gray-100 bg-[#F2F6FA] align-middle">
                    {prevVal}
                  </td>
                  <td className="text-red-500 font-bold border-r border-gray-100 bg-[#FFF5F7] align-middle">
                    {rowScore}
                  </td>
                  <td
                    colSpan={4}
                    className="relative p-0 h-full align-middle bg-white"
                  >
                    <div className="absolute inset-0 flex w-full h-full">
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full bg-yellow-50/20"></div>
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full"></div>
                      <div className="w-1/4 border-r border-dashed border-gray-200 h-full"></div>
                      <div className="w-1/4 h-full"></div>
                    </div>
                    {row.required && (
                      <div
                        className="absolute top-1/2 left-1 h-1.5 bg-red-400 rounded-full opacity-80"
                        style={{ width: "25%", marginTop: "-3px" }}
                      ></div>
                    )}
                    <div
                      className="absolute top-1/2 w-2.5 h-2.5 bg-teal-500 rounded-full shadow-sm z-10 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
                      style={{ left: `${percentage}%` }}
                    ></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative h-[600px]">
        <h3 className="text-left text-gray-600 font-bold absolute top-6 left-6">
          Care Skill Balance
        </h3>

        <div className="absolute top-6 right-6 flex flex-col gap-2 text-[10px] font-bold z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-teal-400"></div> National average
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-800"></div> last time
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500"></div> this time
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center relative">
          <CustomGridLabels />

          <ResponsiveContainer width="100%" height="90%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="75%"
              data={careChartData}
            >
              <PolarGrid
                gridType="polygon"
                stroke="#e5e7eb"
                strokeWidth={1.5}
              />
              <PolarAngleAxis dataKey="subject" tick={CustomAxisTick} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="National average"
                dataKey="fullMark"
                stroke="#56B8D4"
                strokeWidth={2}
                fill="transparent"
                isAnimationActive={false}
              />
              <Radar
                name="last time"
                dataKey="A"
                stroke="#1e40af"
                strokeWidth={2}
                fill="transparent"
              />
              <Radar
                name="this time"
                dataKey="A"
                stroke="#FF5E5E"
                strokeWidth={2}
                fill="transparent"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
