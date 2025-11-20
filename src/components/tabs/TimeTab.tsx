import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Minus, MoveRight } from "lucide-react";

import type { Database } from "./../../lib/database.types";

// 1. TYPES
type SkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"] & {
  time_total?: number | null;
  time_off?: number | null;
  time_fillin?: number | null;
  time_preparation?: number | null;
  time_base?: number | null;
  time_color_apply?: number | null;
  time_top?: number | null;
  total_time?: string | null;
};

interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

// --- TABLE STRUCTURE FOR DYNAMIC DATA ---
const TIME_TABLE_STRUCTURE = [
  {
    id: "29",
    label: "total time",
    category: "Total",
    catSpan: 0,
    allocation: 10,
    dbKey: "time_total",
  },
  {
    id: "29-1",
    label: "off",
    category: "breakdown",
    catSpan: 3,
    allocation: 20,
    dbKey: "time_off",
  },
  {
    id: "29-2",
    label: "fill-in",
    category: "breakdown",
    catSpan: 0,
    allocation: 10,
    dbKey: "time_fillin",
  },
  {
    id: "29-3",
    label: "Preparation",
    category: "breakdown",
    catSpan: 0,
    allocation: 20,
    dbKey: "time_preparation",
  },
  {
    id: "29-4",
    label: "base",
    category: "one color",
    catSpan: 3,
    allocation: 10,
    dbKey: "time_base",
  },
  {
    id: "29-5",
    label: "color",
    category: "one color",
    catSpan: 0,
    allocation: 20,
    dbKey: "time_color_apply",
  },
  {
    id: "29-6",
    label: "Top",
    category: "one color",
    catSpan: 0,
    allocation: 20,
    dbKey: "time_top",
  },
];

// --- HELPERS ---
const formatTime = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined || minutes === 0)
    return "0 minutes 00 seconds";
  return `${minutes} minutes 00 seconds`;
};

const renderTimeTrend = (current: number, prev: number) => {
  if (!current || !prev)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (current < prev)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />; // Faster is better
  if (current > prev)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />; // Slower
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

// --- CUSTOM TICK COMPONENT ---
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

  // Exact positioning matching 6-axis layout from screenshot
  if (value === "total time") {
    dy = -15;
  } // Top
  else if (value === "One color (base)") {
    dy = 15;
  } // Bottom
  else if (value === "off/fill") {
    textAnchor = "start";
    dx = 10;
    dy = -10;
  } // Top Right
  else if (value === "care") {
    textAnchor = "start";
    dx = 10;
    dy = 10;
  } // Bottom Right
  else if (value === "One color (color)") {
    textAnchor = "end";
    dx = -10;
    dy = 10;
  } // Bottom Left
  else if (value === "One color (top)") {
    textAnchor = "end";
    dx = -10;
    dy = -10;
  } // Top Left

  return (
    <g transform={`translate(${absX},${absY})`}>
      <text
        x={dx}
        y={dy}
        textAnchor={textAnchor}
        fill="#115e59"
        fontSize={11}
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
};

export default function TimeTab({ currentCheck, previousCheck }: TabProps) {
  // --- GRAPH DATA ---
  const chartData = useMemo(() => {
    if (!currentCheck) return [];
    const val = (key: keyof SkillCheck) => (currentCheck[key] as number) || 0;

    // Max Values for Scaling (Approximated from screenshot geometry)
    const maxTotal = 90;
    const maxOffFill = 18;
    const maxCare = 24;
    const maxBase = 14;
    const maxColor = 22;
    const maxTop = 10;

    // Helper: Percentage of scale
    const getPct = (val: number, max: number) =>
      val > 0 ? Math.min(100, (val / max) * 100) : 0;

    return [
      {
        subject: "total time",
        A: getPct(val("time_total"), maxTotal),
        fullMark: 100,
      },
      {
        subject: "off/fill",
        A: getPct(val("time_off") + val("time_fillin"), maxOffFill),
        fullMark: 100,
      },
      {
        subject: "care",
        A: getPct(val("time_preparation"), maxCare),
        fullMark: 100,
      },
      {
        subject: "One color (base)",
        A: getPct(val("time_base"), maxBase),
        fullMark: 100,
      },
      {
        subject: "One color (color)",
        A: getPct(val("time_color_apply"), maxColor),
        fullMark: 100,
      },
      {
        subject: "One color (top)",
        A: getPct(val("time_top"), maxTop),
        fullMark: 100,
      },
    ];
  }, [currentCheck]);

  // --- CUSTOM NUMERIC OVERLAY FOR GRAPH ---
  const CustomGridLabels = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[70%] h-[70%]">
          {/* TOP AXIS (Total Time) */}
          <span className="absolute top-[33%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            30
          </span>
          <span className="absolute top-[16%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            60
          </span>
          <span className="absolute top-[-2%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            90
          </span>
          <span className="absolute top-[0%] left-1/2 -translate-x-1/2 mt-3 text-[8px] text-gray-400">
            minutes
          </span>

          {/* TOP RIGHT (Off/Fill) */}
          <span className="absolute top-[28%] right-[25%] text-[9px] text-gray-500">
            16 minutes
          </span>
          <span className="absolute top-[20%] right-[16%] text-[9px] text-gray-500">
            17 minutes
          </span>

          {/* BOTTOM RIGHT (Care) */}
          <span className="absolute bottom-[28%] right-[25%] text-[9px] text-gray-500">
            23 minutes
          </span>
          <span className="absolute bottom-[20%] right-[16%] text-[9px] text-gray-500">
            29 minutes
          </span>

          {/* BOTTOM (Base) */}
          <span className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            13 minutes
          </span>

          {/* BOTTOM LEFT (Color) */}
          <span className="absolute bottom-[28%] left-[25%] text-[9px] text-gray-500">
            19 minutes
          </span>
          <span className="absolute bottom-[20%] left-[16%] text-[9px] text-gray-500">
            20 minutes
            <br />
            30 seconds
          </span>

          {/* TOP LEFT (Top) */}
          <span className="absolute top-[28%] left-[25%] text-[9px] text-gray-500">
            9 minutes
          </span>
          <span className="absolute top-[20%] left-[16%] text-[9px] text-gray-500">
            9 minutes
            <br />
            30 seconds
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      {/* 1. Top Summary Table */}
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
              <td className="bg-[#6AC2DB] text-white py-4">time</td>
              <td className="text-teal-600">B</td>
              <td className="text-teal-600">
                267
                <span className="text-gray-400 text-xs font-normal">/300</span>
              </td>
              <td className="bg-[#D9D9D9] text-gray-400 border-r border-white"></td>
              <td className="bg-[#D9D9D9] text-gray-400 border-r border-white"></td>
              <td className="text-red-500">A.A.</td>
              <td className="text-red-500">
                340
                <span className="text-gray-400 text-xs font-normal">/300</span>
              </td>
            </tr>
            <tr className="bg-white border-t border-gray-100">
              <td className="bg-white"></td>
              <td colSpan={2} className="text-teal-600 text-xs py-2">
                104 minutes 54 seconds
              </td>
              <td
                colSpan={2}
                className="text-gray-400 text-xs py-2 bg-[#D9D9D9]"
              ></td>
              <td colSpan={2} className="text-red-500 text-xs py-2">
                {formatTime(currentCheck?.time_total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Detailed Table */}
      <div className="rounded-sm border border-teal-100 shadow-sm bg-white">
        <table className="w-full table-fixed text-[10px] text-center border-collapse">
          <thead>
            <tr className="text-white text-[10px]">
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[10%]"
              >
                category
              </th>
              <th
                rowSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[6%]"
              >
                Point alloc
              </th>
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[22%]"
              >
                average
              </th>
              <th
                colSpan={2}
                className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[22%]"
              >
                last time
              </th>
              <th className="bg-[#6AC2DB] p-1 border-r border-white/30 w-[20%]">
                this time
              </th>
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
              <th className="bg-[#ACD1E9] text-blue-700 border-r border-white/30 font-normal">
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
            {TIME_TABLE_STRUCTURE.map((row, idx) => {
              const currentVal = currentCheck
                ? (currentCheck[row.dbKey as keyof SkillCheck] as number)
                : 0;
              const prevVal = previousCheck
                ? (previousCheck[row.dbKey as keyof SkillCheck] as number)
                : 0;
              const avgVal = 15;
              const targetTime = 15;
              const percentage =
                currentVal > 0
                  ? Math.min(100, (targetTime / currentVal) * 100)
                  : 0;

              return (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 hover:bg-gray-50 h-9 ${
                    row.id === "29" ? "bg-[#D6EAF0]" : ""
                  }`}
                >
                  {row.id === "29" ? (
                    <td className="text-teal-700 font-bold p-1 border-r border-white align-middle text-[10px]">
                      {row.id}. {row.label}
                    </td>
                  ) : row.catSpan > 0 ? (
                    <td
                      rowSpan={row.catSpan}
                      className="bg-[#D6EAF0] text-teal-700 font-bold p-1 border-r border-white align-middle text-[10px] leading-tight"
                    >
                      {row.category}
                    </td>
                  ) : null}
                  {row.id !== "29" && (
                    <td className="text-left px-2 text-teal-800 font-medium border-r border-gray-100 bg-[#F9FAFB]">
                      {row.id}. {row.label}
                    </td>
                  )}
                  {row.id === "29" && (
                    <td className="text-left px-2 text-teal-800 font-bold border-r border-white bg-[#D6EAF0]"></td>
                  )}
                  <td className="font-bold border-r border-gray-100 align-middle text-sm text-black">
                    {row.allocation}
                  </td>
                  <td className="border-r border-gray-100 bg-[#F0FAFC] align-middle text-[9px]">
                    {renderTimeTrend(currentVal, avgVal)}
                  </td>
                  <td className="text-teal-600 font-bold border-r border-gray-100 bg-[#F0FAFC] align-middle whitespace-nowrap overflow-hidden text-[9px]">
                    {formatTime(avgVal)}
                  </td>
                  <td className="border-r border-gray-100 bg-[#F2F6FA] align-middle text-[9px]">
                    {renderTimeTrend(currentVal, prevVal)}
                  </td>
                  <td className="text-blue-600 font-bold border-r border-gray-100 bg-[#F2F6FA] align-middle whitespace-nowrap overflow-hidden text-[9px]">
                    {formatTime(prevVal)}
                  </td>
                  <td className="text-red-500 font-bold border-r border-gray-100 bg-[#FFF5F7] align-middle whitespace-nowrap overflow-hidden text-[9px]">
                    {formatTime(currentVal)}
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
                    {row.id === "29-5" && (
                      <div
                        className="absolute top-1/2 left-1 h-1.5 bg-red-400 rounded-full opacity-80"
                        style={{ width: "20%", marginTop: "-3px" }}
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

      {/* 3. Radar Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative h-[700px]">
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
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
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

      {/* 4. Evaluation Rank Criteria Table (Corrected) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700">
          Evaluation rank criteria table
        </h3>
        <div className="overflow-hidden border border-gray-200 rounded-sm">
          <table className="w-full text-center text-xs">
            <thead className="bg-[#D6D6D6] text-gray-700">
              <tr>
                <th
                  rowSpan={2}
                  className="border-r border-gray-300 p-2 bg-[#CCCCCC]"
                >
                  Evaluation
                  <br />
                  rank
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  comprehensive
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  care
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  one color
                </th>
                <th colSpan={2} className="p-1 bg-[#D9D9D9]">
                  time
                </th>
              </tr>
              <tr className="text-[10px]">
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  Score
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  Score
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  Score
                </th>
                <th className="border-r border-gray-300 p-1 bg-[#D9D9D9]">
                  Score
                </th>
                <th className="p-1 bg-[#D9D9D9]">time</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-600 font-medium text-[11px]">
              <tr className="border-b border-gray-100">
                <td className="p-2 font-bold border-r bg-[#F2F2F2]">AAA</td>
                <td className="border-r">1123~1320</td>
                <td className="border-r">349~410</td>
                <td className="border-r">519~610</td>
                <td className="border-r">300</td>
                <td>
                  ~ Until 60
                  <br />
                  minutes 00
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-bold border-r bg-[#F2F2F2]">A.A.</td>
                <td className="border-r">958~1122</td>
                <td className="border-r">298~348</td>
                <td className="border-r">443~518</td>
                <td className="border-r">225</td>
                <td>
                  From 60 minutes 01 second
                  <br />
                  to 85 minutes 00 seconds
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-bold border-r bg-[#F2F2F2]">A</td>
                <td className="border-r">793~957</td>
                <td className="border-r">246~297</td>
                <td className="border-r">367~442</td>
                <td className="border-r">150</td>
                <td>
                  From 85 minutes 01 seconds to
                  <br />
                  90 minutes 00 seconds
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-bold border-r bg-[#F2F2F2]">B</td>
                <td className="border-r">~792</td>
                <td className="border-r">~245</td>
                <td className="border-r">~366</td>
                <td className="border-r">75</td>
                <td>90 minutes 01 seconds ~</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Reference Timetable (Corrected) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700">Reference timetable</h3>
        <div className="overflow-hidden border border-gray-200 rounded-sm">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-[#D6D6D6] text-gray-700 font-bold">
              <tr>
                <th
                  colSpan={2}
                  className="p-2 border-r border-gray-300 w-24 bg-[#CCCCCC]"
                >
                  item
                </th>
                <th className="p-2 border-r border-gray-300 w-32 bg-[#D9D9D9]">
                  AAA
                </th>
                <th className="p-2 border-r border-gray-300 w-32 bg-[#D9D9D9]">
                  A.A.
                </th>
                <th className="p-2 border-r border-gray-300 w-32 bg-[#D9D9D9]">
                  A
                </th>
                <th className="p-2 w-32 bg-[#D9D9D9]">B</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-600 text-[11px]">
              {/* Off/Fill */}
              <tr className="border-b border-gray-100">
                <td className="bg-[#F3F1EF] font-medium border-r p-2">
                  off/fill in
                </td>
                <td
                  rowSpan={2}
                  className="bg-white border-r text-[10px] w-12 align-middle"
                >
                  time
                </td>
                <td className="border-r p-2">~ 17 minutes</td>
                <td className="border-r p-2">
                  18 minutes 30
                  <br />
                  seconds
                </td>
                <td className="border-r p-2">20 minutes</td>
                <td className="p-2">20 minutes ~</td>
              </tr>
              {/* Preparation */}
              <tr className="border-b border-gray-100">
                <td className="bg-[#F3F1EF] font-medium border-r p-2">
                  Preparation
                </td>
                <td className="border-r p-2">~ 22 minutes</td>
                <td className="border-r p-2">23 minutes</td>
                <td className="border-r p-2">24 minutes</td>
                <td className="p-2">24 minutes ~</td>
              </tr>
              {/* One Color Block */}
              <tr>
                <td
                  rowSpan={4}
                  className="bg-[#F3F1EF] font-medium border-r border-b border-gray-100 p-2 align-middle"
                >
                  one color
                </td>
                <td className="bg-white border-r border-b border-gray-100 p-1 text-[10px]">
                  base
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  ~ 13 minutes
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  13 minutes 30
                  <br />
                  seconds
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  14 minutes
                </td>
                <td className="border-b border-gray-100 p-2">14 minutes ~</td>
              </tr>
              <tr>
                <td className="bg-white border-r border-b border-gray-100 p-1 text-[10px]">
                  color
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  ~ 19 minutes
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  20 minutes 30
                  <br />
                  seconds
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  22 minutes
                </td>
                <td className="border-b border-gray-100 p-2">22 minutes ~</td>
              </tr>
              <tr>
                <td className="bg-white border-r border-b border-gray-100 p-1 text-[10px]">
                  top
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  ~ 9 minutes
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  9 minutes 30
                  <br />
                  seconds
                </td>
                <td className="border-r border-b border-gray-100 p-2">
                  10 minutes
                </td>
                <td className="border-b border-gray-100 p-2">10 minutes ~</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-white border-r p-1 text-[10px]">total</td>
                <td className="border-r p-2">~ 41 minutes</td>
                <td className="border-r p-2">
                  43 minutes 30
                  <br />
                  seconds
                </td>
                <td className="border-r p-2">46 minutes</td>
                <td className="p-2">46 minutes ~</td>
              </tr>
              {/* Total Time Footer (Pink) */}
              <tr className="bg-[#FFD7D5]">
                <td
                  colSpan={2}
                  className="font-bold text-gray-700 p-3 border-r border-white"
                >
                  Total total time
                </td>
                <td className="font-bold border-r border-white">
                  ~ 79 minutes
                </td>
                <td className="font-bold border-r border-white bg-white p-3 border-b-2 border-red-400 shadow-sm">
                  80 minutes
                </td>
                <td className="font-bold border-r border-white">90 minutes</td>
                <td className="font-bold">90 minutes ~</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-gray-400 mt-2">
          *Calculated by subtracting 5 minutes per hand for off-winding time
        </div>
      </div>
    </div>
  );
}
