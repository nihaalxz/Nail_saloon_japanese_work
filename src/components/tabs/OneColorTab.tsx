import { useMemo, useState, useRef, useLayoutEffect } from "react";
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

// --- TYPES ---
type BaseSkillCheck = Database["public"]["Tables"]["skill_checks"]["Row"];

interface SkillCheck extends BaseSkillCheck {
  [key: string]: unknown;
}

interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

interface OneColorTableItem {
  category?: string;
  catSpan?: number;
  item?: string;
  itemSpan?: number;
  id: string;
  label: string;
  allocation: number;
  required?: boolean;
  key: keyof SkillCheck;
}

// --- DATA STRUCTURE ---
const ONE_COLOR_TABLE_STRUCTURE: OneColorTableItem[] = [
  // === CATEGORY: BASE (14-19) ===
  {
    category: "base",
    catSpan: 12,
    item: "14. protrusion",
    itemSpan: 2,
    id: "14-1",
    label: "Too much scraping",
    allocation: 10,
    required: true,
    key: "color_14_1",
  },
  {
    id: "14-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    key: "color_14_2",
  },
  {
    item: "15. Cuticle line",
    itemSpan: 2,
    id: "15-1",
    label: "remaining gel",
    allocation: 20,
    key: "color_15_1",
  },
  {
    id: "15-2",
    label: "root step",
    allocation: 10,
    required: true,
    key: "color_15_2",
  },
  {
    item: "16. corner",
    itemSpan: 2,
    id: "16-1",
    label: "Too much scraping",
    allocation: 10,
    key: "color_16_1",
  },
  {
    id: "16-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    key: "color_16_2",
  },
  {
    item: "17. side",
    itemSpan: 2,
    id: "17-1",
    label: "remaining gel",
    allocation: 10,
    key: "color_17_1",
  },
  {
    id: "17-2",
    label: "root step",
    allocation: 20,
    required: true,
    key: "color_17_2",
  },
  {
    item: "18. High Point",
    itemSpan: 2,
    id: "18-1",
    label: "Too much scraping",
    allocation: 20,
    key: "color_18_1",
  },
  {
    id: "18-2",
    label: "Insufficient cutting",
    allocation: 30,
    required: true,
    key: "color_18_2",
  },
  {
    item: "19. Tamari dent",
    itemSpan: 2,
    id: "19-1",
    label: "remaining gel",
    allocation: 10,
    key: "color_19_1",
  },
  {
    id: "19-2",
    label: "root step",
    allocation: 20,
    key: "color_19_2",
  },

  // === CATEGORY: COLOR (20-25) ===
  {
    category: "color",
    catSpan: 13,
    item: "20. cuticle line",
    itemSpan: 2,
    id: "20-1",
    label: "Too much scraping",
    allocation: 20,
    key: "color_20_1",
  },
  {
    id: "20-2",
    label: "Insufficient cutting",
    allocation: 30,
    required: true,
    key: "color_20_2",
  },
  {
    item: "21. Right corner",
    itemSpan: 2,
    id: "21-1",
    label: "remaining gel",
    allocation: 30,
    key: "color_21_1",
  },
  {
    id: "21-2",
    label: "root step",
    allocation: 10,
    required: true,
    key: "color_21_2",
  },
  {
    item: "22. left corner",
    itemSpan: 2,
    id: "22-1",
    label: "Too much scraping",
    allocation: 10,
    key: "color_22_1",
  },
  {
    id: "22-2",
    label: "Insufficient cutting",
    allocation: 20,
    required: true,
    key: "color_22_2",
  },
  {
    item: "23. Right side",
    itemSpan: 2,
    id: "23-1",
    label: "remaining gel",
    allocation: 20,
    key: "color_23_1",
  },
  {
    id: "23-2",
    label: "root step",
    allocation: 20,
    required: true,
    key: "color_23_2",
  },
  {
    item: "24. left side",
    itemSpan: 2,
    id: "24-1",
    label: "Too much scraping",
    allocation: 20,
    key: "color_24_1",
  },
  {
    id: "24-2",
    label: "Insufficient cutting",
    allocation: 10,
    required: true,
    key: "color_24_2",
  },
  {
    item: "25. edge",
    itemSpan: 3,
    id: "25-1",
    label: "remaining gel",
    allocation: 10,
    key: "color_25_1",
  },
  { id: "25-2", label: "root step", allocation: 10, key: "color_25_2" },
  { id: "25-3", label: "underflow", allocation: 20, key: "color_25_3" },

  // === CATEGORY: TOP (26-28) ===
  {
    category: "top",
    catSpan: 8,
    item: "26. High Point",
    itemSpan: 2,
    id: "26-1",
    label: "Too much scraping",
    allocation: 10,
    key: "color_26_1",
  },
  {
    id: "26-2",
    label: "Insufficient cutting",
    allocation: 20,
    key: "color_26_2",
  },
  {
    item: "27. Tamari dent",
    itemSpan: 4,
    id: "27-1",
    label: "remaining gel",
    allocation: 10,
    key: "color_27_1",
  },
  { id: "27-2", label: "root step", allocation: 10, key: "color_27_2" },
  {
    id: "27-3",
    label: "Too much scraping",
    allocation: 10,
    key: "color_27_3",
  },
  {
    id: "27-4",
    label: "Insufficient cutting",
    allocation: 10,
    key: "color_27_4",
  },
  {
    item: "28. protrusion",
    itemSpan: 2,
    id: "28-1",
    label: "cuticle line",
    allocation: 10,
    required: true,
    key: "color_28_1",
  },
  {
    id: "28-2",
    label: "corner side",
    allocation: 20,
    required: true,
    key: "color_28_2",
  },
];

// --- HELPERS ---
const renderTrend = (current: number, target: number) => {
  if (current == null || target == null)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (target === 0 && current > 0)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;

  if (current > target)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />;
  if (current < target)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />;
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

const calculateSum = (
  data: SkillCheck | null,
  rangeStart: number,
  rangeEnd: number
) => {
  if (!data) return 0;
  let sum = 0;
  ONE_COLOR_TABLE_STRUCTURE.forEach((row) => {
    const mainId = parseInt(row.id.split("-")[0], 10);
    if (mainId >= rangeStart && mainId <= rangeEnd) {
      const raw = data[row.key];
      const n = raw == null ? 0 : Number(raw);
      sum += Number.isFinite(n) ? n : 0;
    }
  });
  return sum;
};

const calculateMaxScore = (rangeStart: number, rangeEnd: number) => {
  let sum = 0;
  ONE_COLOR_TABLE_STRUCTURE.forEach((row) => {
    const mainId = parseInt(row.id.split("-")[0], 10);
    if (mainId >= rangeStart && mainId <= rangeEnd) {
      sum += row.allocation;
    }
  });
  return sum;
};

const calculateTotal = (data: SkillCheck | null) => {
  if (!data) return 0;
  let sum = 0;
  let hasBreakdownData = false;
  ONE_COLOR_TABLE_STRUCTURE.forEach((row) => {
    const raw = data[row.key];
    if (raw != null) {
      hasBreakdownData = true;
      const n = Number(raw);
      sum += Number.isFinite(n) ? n : 0;
    }
  });
  if (hasBreakdownData && sum > 0) return sum;
  if (typeof data.color_score === "number") return data.color_score;
  if (typeof data.total_score === "number") return data.total_score;
  return 0;
};

const getPercentage = (
  check: SkillCheck | null,
  key: keyof SkillCheck,
  allocation: number
) => {
  if (!check || !allocation) return 0;
  const val = check[key] != null ? Number(check[key]) : 0;
  const score = Math.min(val, allocation);
  return (score / allocation) * 100;
};

// --- CUSTOM TICK FOR RADAR ---
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
  if (value === "comprehensive") {
    dy = -25;
  } else if (value === "One color (color)") {
    dy = 25;
  } else if (value === "One color (top)") {
    textAnchor = "end";
    dx = -30;
  } else {
    textAnchor = "start";
    dx = 30;
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

// --- MAIN COMPONENT ---
export default function OneColorTab({ currentCheck, previousCheck }: TabProps) {
  // Use container ref for calculating coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPath, setSvgPath] = useState("");

  const allPercentages = useMemo(() => {
    return ONE_COLOR_TABLE_STRUCTURE.map((row) =>
      getPercentage(currentCheck, row.key, row.allocation)
    );
  }, [currentCheck]);

  // Recalculate line path whenever data or window size changes
  useLayoutEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;

      const dots = containerRef.current.querySelectorAll(".graph-dot-marker");
      if (dots.length === 0) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const points: { x: number; y: number }[] = [];

      dots.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        // Calculate center of dot relative to container
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

    // Initial calculation
    // Small timeout ensures the layout is fully settled
    const timeoutId = setTimeout(updatePath, 50);

    window.addEventListener("resize", updatePath);
    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timeoutId);
    };
  }, [allPercentages]);

  const chartData = useMemo(() => {
    const maxBase = calculateMaxScore(14, 19);
    const maxColor = calculateMaxScore(20, 25);
    const maxTop = calculateMaxScore(26, 28);
    const maxTotal = maxBase + maxColor + maxTop;

    const currBase = calculateSum(currentCheck, 14, 19);
    const currColor = calculateSum(currentCheck, 20, 25);
    const currTop = calculateSum(currentCheck, 26, 28);
    const currTotal = currBase + currColor + currTop;

    const prevBase = calculateSum(previousCheck, 14, 19);
    const prevColor = calculateSum(previousCheck, 20, 25);
    const prevTop = calculateSum(previousCheck, 26, 28);
    const prevTotal = prevBase + prevColor + prevTop;

    return [
      {
        subject: "comprehensive",
        current: maxTotal > 0 ? (currTotal / maxTotal) * 100 : 0,
        prev: maxTotal > 0 ? (prevTotal / maxTotal) * 100 : 0,
        fullMark: 100,
      },
      {
        subject: "One color (base)",
        current: maxBase > 0 ? (currBase / maxBase) * 100 : 0,
        prev: maxBase > 0 ? (prevBase / maxBase) * 100 : 0,
        fullMark: 100,
      },
      {
        subject: "One color (color)",
        current: maxColor > 0 ? (currColor / maxColor) * 100 : 0,
        prev: maxColor > 0 ? (prevColor / maxColor) * 100 : 0,
        fullMark: 100,
      },
      {
        subject: "One color (top)",
        current: maxTop > 0 ? (currTop / maxTop) * 100 : 0,
        prev: maxTop > 0 ? (prevTop / maxTop) * 100 : 0,
        fullMark: 100,
      },
    ];
  }, [currentCheck, previousCheck]);

  const thisTotal = useMemo(() => calculateTotal(currentCheck), [currentCheck]);
  const prevTotal = useMemo(
    () => calculateTotal(previousCheck),
    [previousCheck]
  );
  const dynamicTotalMax = useMemo(() => calculateMaxScore(14, 28), []);

  const getRank = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return "AAA";
    if (pct >= 80) return "A.A.";
    if (pct >= 70) return "A";
    return "B";
  };

  const CustomGridLabels = () => {
    const maxBase = calculateMaxScore(14, 19);
    const maxColor = calculateMaxScore(20, 25);
    const maxTop = calculateMaxScore(26, 28);
    const maxTotal = maxBase + maxColor + maxTop;

    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[80%] h-[80%]">
          <span className="absolute top-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            {maxTotal}
          </span>
          <span className="absolute top-1/2 right-[0%] text-[9px] text-gray-500 bg-white px-0.5">
            {maxBase}
          </span>
          <span className="absolute bottom-[-1%] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-white px-0.5">
            {maxColor}
          </span>
          <span className="absolute top-1/2 left-[0%] text-[9px] text-gray-500 bg-white px-0.5">
            {maxTop}
          </span>
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
                {Math.round(dynamicTotalMax * 0.44)}
                <span className="text-gray-400 text-xs font-normal">
                  /{dynamicTotalMax}
                </span>
              </td>
              <td className="text-blue-600 bg-[#F2F6FA] border-r border-white">
                {getRank(prevTotal, dynamicTotalMax)}
              </td>
              <td className="text-blue-600 bg-[#F2F6FA] border-r border-white">
                {prevTotal}
                <span className="text-gray-400 text-xs font-normal">
                  /{dynamicTotalMax}
                </span>
              </td>
              <td className="text-red-500 bg-[#FFF5F7]">
                {getRank(thisTotal, dynamicTotalMax)}
              </td>
              <td className="text-red-500 bg-[#FFF5F7]">
                {thisTotal}
                <span className="text-gray-400 text-xs font-normal">
                  /{dynamicTotalMax}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Table Container */}
      {/* We use 'relative' here so the absolute SVG is positioned relative to this box */}
      <div
        ref={containerRef}
        className="relative rounded-sm border border-teal-100 shadow-sm bg-white"
      >
        {/* === SVG OVERLAY FOR GRAPH LINES === */}
        {/* Placed *outside* the table but *inside* the relative container */}
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
            {ONE_COLOR_TABLE_STRUCTURE.map((row, index) => {
              const currentVal = currentCheck
                ? (currentCheck[row.key] as number) || 0
                : 0;

              const prevVal = previousCheck
                ? (previousCheck[row.key] as number) || 0
                : 0;

              const natVal = Math.floor(row.allocation * 0.75);
              const rowScore = Math.min(currentVal, row.allocation);
              const percentage = allPercentages[index];

              let catColor = "bg-[#D6EAF0] text-teal-800";
              if (row.category === "color")
                catColor = "bg-[#D0F0F0] text-teal-700";
              if (row.category === "top")
                catColor = "bg-[#E0F4F9] text-cyan-800";

              return (
                <tr
                  key={row.key}
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
                      row.label.includes("Too much") ? "bg-yellow-50" : ""
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
                    {renderTrend(rowScore, prevVal)}
                  </td>
                  <td className="text-blue-600 font-bold border-r border-gray-100 bg-[#F2F6FA] align-middle">
                    {prevVal}
                  </td>
                  <td className="text-red-500 font-bold border-r border-gray-100 bg-[#FFF5F7] align-middle">
                    {rowScore}
                  </td>

                  {/* --- GRAPH CELL --- */}
                  <td
                    colSpan={4}
                    className="relative p-0 h-full align-middle bg-white"
                  >
                    <div className="absolute inset-0 flex w-full h-full pointer-events-none">
                      <div className="w-1/4 border-r border-dotted border-gray-300 h-full"></div>
                      <div className="w-1/4 border-r border-dotted border-gray-300 h-full"></div>
                      <div className="w-1/4 border-r border-dotted border-gray-300 h-full"></div>
                      <div className="w-1/4 h-full"></div>
                    </div>

                    <div
                      className="absolute top-1/2 left-0 h-2.5 bg-[#FFDACD] transform -translate-y-1/2 rounded-r-full z-0 opacity-90"
                      style={{ width: `${percentage}%` }}
                    ></div>

                    {row.required && (
                      <div
                        className="absolute top-1/2 left-0 h-2.5 bg-[#FF4520] transform -translate-y-1/2 rounded-r-full z-10 shadow-sm"
                        style={{ width: "20%" }}
                      ></div>
                    )}

                    {/* THE DOT MARKER - Used by useLayoutEffect to calculate lines */}
                    <div
                      className="graph-dot-marker absolute top-1/2 w-2 h-2 bg-[#56B8D4] rounded-full shadow-sm z-30 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-700 border border-white"
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

      {/* Radar Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative h-[600px]">
        <h3 className="text-left text-gray-600 font-bold absolute top-6 left-6">
          One Color Balance
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
                dataKey="prev"
                stroke="#1e40af"
                strokeWidth={2}
                fill="transparent"
              />
              <Radar
                name="this time"
                dataKey="current"
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
