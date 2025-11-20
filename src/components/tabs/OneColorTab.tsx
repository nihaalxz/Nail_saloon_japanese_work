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

type SkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"] & {
  color_base_score?: number | null;
  color_cuticle_score?: number | null;
  color_apex_score?: number | null;
  color_saturation_score?: number | null;
  color_edge_score?: number | null;
};

interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

const ONE_COLOR_TABLE_STRUCTURE = [
  // === CATEGORY: BASE (12 Rows) ===
  {
    category: "base",
    catSpan: 12,
    item: "14. protrusion",
    itemSpan: 2,
    id: "14-1",
    label: "Too much scraping",
    allocation: 10,
    required: true,
    dbKey: "color_base_score",
  },
  {
    id: "14-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    dbKey: "color_base_score",
  },

  {
    item: "15. Cuticle line",
    itemSpan: 2,
    id: "15-1",
    label: "remaining gel",
    allocation: 20,
    dbKey: "color_cuticle_score",
  },
  {
    id: "15-2",
    label: "root step",
    allocation: 10,
    required: true,
    dbKey: "color_cuticle_score",
  },

  {
    item: "16. corner",
    itemSpan: 2,
    id: "16-1",
    label: "Too much scraping",
    allocation: 10,
    dbKey: "color_base_score",
  },
  {
    id: "16-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    dbKey: "color_base_score",
  },

  {
    item: "17. side",
    itemSpan: 2,
    id: "17-1",
    label: "remaining gel",
    allocation: 10,
    dbKey: "color_base_score",
  },
  {
    id: "17-2",
    label: "root step",
    allocation: 20,
    required: true,
    dbKey: "color_base_score",
  },

  {
    item: "18. High Point",
    itemSpan: 2,
    id: "18-1",
    label: "Too much scraping",
    allocation: 20,
    dbKey: "color_base_score",
  },
  {
    id: "18-2",
    label: "Insufficient cutting",
    allocation: 30,
    required: true,
    dbKey: "color_base_score",
  },

  {
    item: "19. Tamari dent",
    itemSpan: 2,
    id: "19-1",
    label: "remaining gel",
    allocation: 10,
    dbKey: "color_base_score",
  },
  { id: "19-2", label: "root step", allocation: 20, dbKey: "color_base_score" },

  // === CATEGORY: COLOR (13 Rows) ===
  {
    category: "color",
    catSpan: 13,
    item: "20. cuticle line",
    itemSpan: 2,
    id: "20-1",
    label: "Too much scraping",
    allocation: 20,
    dbKey: "color_cuticle_score",
  },
  {
    id: "20-2",
    label: "Insufficient cutting",
    allocation: 30,
    required: true,
    dbKey: "color_cuticle_score",
  },

  {
    item: "21. Right corner",
    itemSpan: 2,
    id: "21-1",
    label: "remaining gel",
    allocation: 30,
    dbKey: "color_saturation_score",
  },
  {
    id: "21-2",
    label: "root step",
    allocation: 10,
    required: true,
    dbKey: "color_saturation_score",
  },

  {
    item: "22. left corner",
    itemSpan: 2,
    id: "22-1",
    label: "Too much scraping",
    allocation: 10,
    dbKey: "color_saturation_score",
  },
  {
    id: "22-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    dbKey: "color_saturation_score",
  },

  {
    item: "23. Right side",
    itemSpan: 2,
    id: "23-1",
    label: "remaining gel",
    allocation: 20,
    dbKey: "color_saturation_score",
  },
  {
    id: "23-2",
    label: "root step",
    allocation: 20,
    required: true,
    dbKey: "color_saturation_score",
  },

  {
    item: "24. left side",
    itemSpan: 2,
    id: "24-1",
    label: "Too much scraping",
    allocation: 20,
    dbKey: "color_saturation_score",
  },
  {
    id: "24-2",
    label: "Insufficient cutting",
    allocation: 10,
    required: true,
    dbKey: "color_saturation_score",
  },

  {
    item: "25. edge",
    itemSpan: 3,
    id: "25-1",
    label: "remaining gel",
    allocation: 10,
    dbKey: "color_edge_score",
  },
  { id: "25-2", label: "root step", allocation: 10, dbKey: "color_edge_score" },
  { id: "25-3", label: "underflow", allocation: 20, dbKey: "color_edge_score" },

  // === CATEGORY: TOP (8 Rows) ===
  {
    category: "top",
    catSpan: 8,
    item: "26. High Point",
    itemSpan: 2,
    id: "26-1",
    label: "Too much scraping",
    allocation: 10,
    dbKey: "color_apex_score",
  },
  {
    id: "26-2",
    label: "Insufficient cutting",
    allocation: 20,
    dbKey: "color_apex_score",
  },

  {
    item: "27. Tamari dent",
    itemSpan: 4,
    id: "27-1",
    label: "remaining gel",
    allocation: 10,
    dbKey: "color_apex_score",
  },
  { id: "27-2", label: "root step", allocation: 10, dbKey: "color_apex_score" },
  {
    id: "27-3",
    label: "Too much scraping",
    allocation: 10,
    dbKey: "color_apex_score",
  },
  {
    id: "27-4",
    label: "Insufficient cutting",
    allocation: 10,
    dbKey: "color_apex_score",
  },

  {
    item: "28. protrusion",
    itemSpan: 2,
    id: "28-1",
    label: "cuticle line",
    allocation: 10,
    required: true,
    dbKey: "color_apex_score",
  },
  {
    id: "28-2",
    label: "corner side",
    allocation: 20,
    required: true,
    dbKey: "color_apex_score",
  },
];

// --- HELPERS ---
const renderTrend = (current: number, target: number) => {
  if (!current || !target)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (current > target)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />;
  if (current < target)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />;
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

// --- CUSTOM TICK COMPONENT ---
interface CustomTickProps {
  x?: number | string;
  y?: number | string;
  payload?: {
    value: string;
  };
}

const CustomAxisTick = ({ x, y, payload }: CustomTickProps) => {
  if (!payload) return <g />;
  const { value } = payload;
  const absX = Number(x) || 0;
  const absY = Number(y) || 0;

  let textAnchor: "middle" | "start" | "end" = "middle";
  let dy = 0;
  let dx = 0;

  // Axes Positioning Logic
  if (value === "comprehensive") {
    dy = -25; // Push Up
  } else if (value === "One color (color)") {
    dy = 25; // Push Down
  } else if (value === "One color (top)") {
    textAnchor = "end";
    dx = -30; // Push Left
  } else {
    // "One color (base)"
    textAnchor = "start";
    dx = 30; // Push Right
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
        {value}
      </text>
    </g>
  );
};

export default function OneColorTab({ currentCheck, previousCheck }: TabProps) {
  const chartData = useMemo(() => {
    if (!currentCheck) return [];
    const val = (key: keyof SkillCheck) => (currentCheck[key] as number) || 0;

    // --- 1. Top Axis: Comprehensive (Total) ---
    // Total One Color Score Max is approx 610
    const totalScore = currentCheck.color_score || 0;

    // --- 2. Right Axis: Base ---
    // Sum of all 'base' category rows ~ 200 points
    const baseScore = val("color_base_score") + val("color_cuticle_score");

    // --- 3. Bottom Axis: Color ---
    // Sum of all 'color' category rows ~ 230 points
    const colorScore = val("color_saturation_score") + val("color_edge_score");

    // --- 4. Left Axis: Top ---
    // Sum of all 'top' category rows ~ 180 points
    const topScore = val("color_apex_score");

    return [
      { subject: "comprehensive", A: (totalScore / 610) * 100, fullMark: 100 },
      {
        subject: "One color (base)",
        A: (baseScore / 200) * 100,
        fullMark: 100,
      },
      {
        subject: "One color (color)",
        A: (colorScore / 230) * 100,
        fullMark: 100,
      },
      { subject: "One color (top)", A: (topScore / 180) * 100, fullMark: 100 },
    ];
  }, [currentCheck]);

  // --- CUSTOM GRID LABELS (EXACT NUMBERS) ---
  const CustomGridLabels = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[80%] h-[80%]">
          {/* TOP AXIS (610 Scale) */}
          <span className="absolute top-[37%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            250
          </span>
          <span className="absolute top-[25%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            400
          </span>
          <span className="absolute top-[12%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            550
          </span>
          <span className="absolute top-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            610
          </span>

          {/* RIGHT AXIS (Base - 200 Scale) */}
          <span className="absolute top-1/2 left-[62%] text-[9px] text-gray-500 bg-white px-0.5">
            50
          </span>
          <span className="absolute top-1/2 left-[74%] text-[9px] text-gray-500 bg-white px-0.5">
            100
          </span>
          <span className="absolute top-1/2 left-[87%] text-[9px] text-gray-500 bg-white px-0.5">
            150
          </span>
          <span className="absolute top-1/2 right-[0%] text-[9px] text-gray-500 bg-white px-0.5">
            200
          </span>

          {/* BOTTOM AXIS (Color - 230 Scale) */}
          <span className="absolute bottom-[37%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            60
          </span>
          <span className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            120
          </span>
          <span className="absolute bottom-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            230
          </span>

          {/* LEFT AXIS (Top - 180 Scale) */}
          <span className="absolute top-1/2 right-[62%] text-[9px] text-gray-500 bg-white px-0.5">
            45
          </span>
          <span className="absolute top-1/2 right-[74%] text-[9px] text-gray-500 bg-white px-0.5">
            90
          </span>
          <span className="absolute top-1/2 right-[87%] text-[9px] text-gray-500 bg-white px-0.5">
            135
          </span>
          <span className="absolute top-1/2 left-[0%] text-[9px] text-gray-500 bg-white px-0.5">
            180
          </span>

          {/* CENTER */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-gray-500">
            0
          </span>
        </div>
      </div>
    );
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
              <td className="bg-[#6AC2DB] text-white py-4">one color</td>
              <td className="text-teal-600">A</td>
              <td className="text-teal-600">
                267
                <span className="text-gray-400 text-xs font-normal">/610</span>
              </td>
              <td className="bg-[#D9D9D9] text-gray-400 border-r border-white"></td>
              <td className="bg-[#D9D9D9] text-gray-400 border-r border-white"></td>
              <td className="text-red-500">A.A.</td>
              <td className="text-red-500">
                {currentCheck?.color_score || 0}
                <span className="text-gray-400 text-xs font-normal">/610</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Table - Fixed Layout */}
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
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[6%]"
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

              {/* Average */}
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[10%]"
              >
                average
              </th>
              {/* Last Time */}
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[10%]"
              >
                last time
              </th>
              {/* This Time */}
              <th className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[5%]">
                this time
              </th>

              {/* Graph */}
              <th colSpan={4} className="bg-[#6AC2DB] p-1 w-[20%]">
                Evaluation graph
              </th>
            </tr>

            <tr className="text-white text-[9px]">
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                comparison
              </th>
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                Score
              </th>
              <th className="bg-[#6AC2DB] border-r border-white/30 font-normal">
                comparison
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
            {ONE_COLOR_TABLE_STRUCTURE.map((row, idx) => {
              const currentVal = currentCheck
                ? (currentCheck[row.dbKey as keyof SkillCheck] as number)
                : 0;
              const prevVal = previousCheck
                ? (previousCheck[row.dbKey as keyof SkillCheck] as number)
                : 0;
              const natVal = Math.floor(row.allocation * 0.75);

              const rowScore = Math.min(currentVal, row.allocation);
              const rowPrev = Math.min(prevVal, row.allocation);
              const percentage =
                row.allocation > 0 ? (rowScore / row.allocation) * 100 : 0;

              // Dynamic Color logic for Category column
              let catColor = "bg-[#D6EAF0] text-teal-800";
              if (row.category === "color")
                catColor = "bg-[#D0F0F0] text-teal-700";
              if (row.category === "top")
                catColor = "bg-[#E0F4F9] text-cyan-800";

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 h-9"
                >
                  {row.catSpan && (
                    <td
                      rowSpan={row.catSpan}
                      className={`${catColor} font-bold p-1 border-r border-white align-middle text-[10px] leading-tight`}
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

                  <td
                    className={`text-left px-2 text-[9px] border-r border-gray-100 font-medium truncate align-middle ${
                      row.label.includes("Too much scraping")
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
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
                    {renderTrend(rowScore, rowPrev)}
                  </td>
                  <td className="text-blue-600 font-bold border-r border-gray-100 bg-[#F2F6FA] align-middle">
                    {rowPrev || 0}
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
          graph name
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

          <ResponsiveContainer width="100%" height="85%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
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
