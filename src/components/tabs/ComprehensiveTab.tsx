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

// --- TYPES ---
type SkillCheck = {
  care_score?: number | null;
  color_score?: number | null;
  total_score?: number | null;
  total_time?: string | null;
  time_score?: number | null;
  rank?: string | null;
  [key: string]: string | number | boolean | null | undefined;
};

interface TabProps {
  currentCheck: SkillCheck | null;
  previousCheck: SkillCheck | null;
}

// --- CONFIGURATION ---
const CHART_CONFIG = [
  { key: "comprehensive", label: "comprehensive", max: 1320, position: "top" },
  { key: "care", label: "care", max: 410, position: "right" },
  { key: "one_color", label: "one color", max: 610, position: "bottom" },
  { key: "time", label: "time", max: 300, position: "left" },
];

// --- HELPERS ---
const getRank = (score: number, max: number): string => {
  if (!score) return "-";
  const pct = (score / max) * 100;
  if (pct >= 90) return "AAA";
  if (pct >= 80) return "A.A.";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  return "C";
};

const renderTrend = (current: number, target: number) => {
  if (!current || !target)
    return <Minus className="w-3 h-3 text-gray-300 mx-auto" />;
  if (current > target)
    return <ArrowUp className="w-3 h-3 text-blue-500 mx-auto" />;
  if (current < target)
    return <ArrowDown className="w-3 h-3 text-red-500 mx-auto" />;
  return <MoveRight className="w-3 h-3 text-green-500 mx-auto" />;
};

const parseTimeStringToMinutes = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  if (!timeStr.includes(":")) return parseInt(timeStr, 10) || 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const formatTimeDisplay = (timeStr: string | null) => {
  if (!timeStr) return "-";
  const mins = parseTimeStringToMinutes(timeStr);
  return `${mins} minutes 00 seconds`;
};

// --- COMPONENTS ---

export default function ComprehensiveTab({
  currentCheck,
  previousCheck,
}: TabProps) {
  // 1. Prepare Data for Radar Chart
  const chartData = useMemo(() => {
    const scores = {
      comprehensive: {
        curr: currentCheck?.total_score || 0,
        prev: previousCheck?.total_score || 0,
        nat: 692,
      },
      care: {
        curr: currentCheck?.care_score || 0,
        prev: previousCheck?.care_score || 0,
        nat: 267,
      },
      one_color: {
        curr: currentCheck?.color_score || 0,
        prev: previousCheck?.color_score || 0,
        nat: 350,
      },
      time: {
        curr: currentCheck?.time_score || 0,
        prev: previousCheck?.time_score || 0,
        nat: 75,
      },
    };

    return CHART_CONFIG.map((cfg) => {
      const s = scores[cfg.key as keyof typeof scores];
      return {
        subject: cfg.label,
        fullMark: 100,
        national: (s.nat / cfg.max) * 100,
        last: (s.prev / cfg.max) * 100,
        current: (s.curr / cfg.max) * 100,
      };
    });
  }, [currentCheck, previousCheck]);

  // 2. Custom Axis Tick Component
  interface CustomTickProps {
    x?: number | string;
    y?: number | string;
    payload: {
      value: string;
    };
  }
  const CustomAxisTick = ({ x = 0, y = 0, payload }: CustomTickProps) => {
    const { value } = payload;
    const config = CHART_CONFIG.find((c) => c.label === value);
    if (!config) return <g />;

    let dx = 0;
    let dy = 0;
    let anchor = "middle";

    if (config.position === "top") dy = -15;
    if (config.position === "bottom") dy = 25;
    if (config.position === "left") {
      dx = -40;
      anchor = "end";
    }
    if (config.position === "right") {
      dx = 40;
      anchor = "start";
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={dx}
          y={dy}
          textAnchor={anchor as "middle" | "start" | "end"}
          fill="#0d9488"
          fontSize={12}
          fontWeight="bold"
          className="capitalize"
        >
          {value}
        </text>
      </g>
    );
  };

  // 3. Custom Grid Overlay
  const CustomGridOverlay = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[75%] h-[75%]">
          {CHART_CONFIG.map((config) => {
            const steps = [0.25, 0.5, 0.75, 1];
            return steps.map((step, idx) => {
              const val = Math.round(config.max * step);

              const style: React.CSSProperties = {
                position: "absolute",
                fontSize: "10px",
                color: "#9ca3af",
                backgroundColor: "white",
                padding: "0 2px",
                lineHeight: "1",
              };

              if (config.position === "top") {
                style.left = "50%";
                style.transform = "translateX(-50%)";
                style.bottom = `${50 + step * 50}%`;
                style.marginBottom = "-5px";
              } else if (config.position === "bottom") {
                style.left = "50%";
                style.transform = "translateX(-50%)";
                style.top = `${50 + step * 50}%`;
                style.marginTop = "-5px";
              } else if (config.position === "left") {
                style.top = "50%";
                style.transform = "translateY(-50%)";
                style.right = `${50 + step * 50}%`;
                style.marginRight = "-10px";
              } else if (config.position === "right") {
                style.top = "50%";
                style.transform = "translateY(-50%)";
                style.left = `${50 + step * 50}%`;
                style.marginLeft = "-10px";
              }

              return (
                <span key={`${config.key}-${idx}`} style={style}>
                  {val}
                </span>
              );
            });
          })}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-white px-1">
            0
          </span>
        </div>
      </div>
    );
  };

  // 4. Table Rows Data
  const rows = [
    {
      id: "comp",
      label: "comprehensive evaluation",
      max: 1320,
      natRank: "B",
      natScore: 692,
      lastScore: previousCheck?.total_score || 0,
      lastRank:
        previousCheck?.rank || getRank(previousCheck?.total_score || 0, 1320),
      thisScore: currentCheck?.total_score || 0,
      thisRank:
        currentCheck?.rank || getRank(currentCheck?.total_score || 0, 1320),
    },
    {
      id: "1",
      label: "care",
      max: 410,
      natRank: "A",
      natScore: 267,
      lastScore: previousCheck?.care_score || 0,
      lastRank: getRank(previousCheck?.care_score || 0, 410),
      thisScore: currentCheck?.care_score || 0,
      thisRank: getRank(currentCheck?.care_score || 0, 410),
    },
    {
      id: "2",
      label: "one color",
      max: 610,
      natRank: "A",
      natScore: 350,
      lastScore: previousCheck?.color_score || 0,
      lastRank: getRank(previousCheck?.color_score || 0, 610),
      thisScore: currentCheck?.color_score || 0,
      thisRank: getRank(currentCheck?.color_score || 0, 610),
    },
    {
      id: "3",
      label: "time",
      max: 300,
      natRank: "B",
      natScore: 75,
      lastScore: previousCheck?.time_score || 0,
      lastRank: getRank(previousCheck?.time_score || 0, 300),
      thisScore: currentCheck?.time_score || 0,
      thisRank: getRank(currentCheck?.time_score || 0, 300),
      isTimeRow: true,
      natTimeDisplay: "104 minutes 54 seconds",
      lastTimeDisplay: formatTimeDisplay(previousCheck?.total_time || null),
      thisTimeDisplay: formatTimeDisplay(currentCheck?.total_time || null),
    },
  ];

  return (
    // CHANGED: Removed 'grid grid-cols-1 xl:grid-cols-2' and replaced with 'flex flex-col'
    <div className="flex flex-col gap-12 animate-in fade-in duration-500 p-4 bg-white/50">
      {/* --- TOP: DATA TABLE --- */}
      <div className="flex flex-col w-full">
        <div className="overflow-hidden rounded-sm shadow-sm bg-white border border-gray-200">
          <table className="w-full min-w-[600px] text-sm text-center border-collapse">
            <thead>
              {/* Header Row 1 */}
              <tr className="text-white text-xs font-medium">
                <th
                  rowSpan={2}
                  className="bg-[#EBEBEB] text-gray-700 py-2 px-4 font-bold text-center w-40 border-r border-white align-middle"
                >
                  Category
                </th>
                <th
                  colSpan={2}
                  className="bg-[#6AC2DB] py-2 px-2 border-r border-white"
                >
                  National average
                </th>
                <th
                  colSpan={2}
                  className="bg-[#4A85C3] py-2 px-2 border-r border-white"
                >
                  last time
                </th>
                <th
                  colSpan={2}
                  className="bg-[#FF8FA3] py-2 px-2 border-r border-white"
                >
                  this time
                </th>
                <th colSpan={2} className="bg-[#FF8FA3] py-2 px-2">
                  comparison
                </th>
              </tr>
              {/* Header Row 2 */}
              <tr className="text-white text-[10px] font-medium">
                <th className="bg-[#81CFE2] py-1.5 border-r border-white">
                  Evaluation rank
                </th>
                <th className="bg-[#81CFE2] py-1.5 border-r border-white">
                  Score
                </th>
                <th className="bg-[#6B9CD0] py-1.5 border-r border-white">
                  Evaluation rank
                </th>
                <th className="bg-[#6B9CD0] py-1.5 border-r border-white">
                  Score
                </th>
                <th className="bg-[#FFAAB8] py-1.5 border-r border-white">
                  Evaluation rank
                </th>
                <th className="bg-[#FFAAB8] py-1.5 border-r border-white">
                  Score
                </th>
                <th className="bg-[#FFAAB8] py-1.5 border-r border-white">
                  average
                </th>
                <th className="bg-[#FFAAB8] py-1.5">last time</th>
              </tr>
            </thead>

            <tbody className="text-xs font-bold text-gray-600">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}`}
                >
                  {/* Label */}
                  <td className="py-3 px-4 text-left border-b border-gray-100 align-top">
                    {row.id === "comp" ? (
                      <span className="text-gray-800 block mt-1">
                        {row.label}
                      </span>
                    ) : (
                      <div className="flex gap-3 items-start mt-1">
                        <span className="w-3 text-gray-400 font-normal">
                          {row.id}
                        </span>
                        <span>{row.label}</span>
                      </div>
                    )}
                  </td>

                  {/* National */}
                  <td className="text-[#118CA8] border-b border-gray-100 align-top pt-4">
                    {row.natRank}
                  </td>
                  <td className="text-[#118CA8] border-b border-gray-100 align-top pt-4">
                    <div>
                      {row.natScore}
                      <span className="text-gray-400 text-[10px] font-normal">
                        /{row.max}
                      </span>
                    </div>
                    {row.isTimeRow && (
                      <div className="text-[10px] text-[#118CA8] mt-2 font-normal border-t border-gray-100 pt-1">
                        {row.natTimeDisplay}
                      </div>
                    )}
                  </td>

                  {/* Last Time */}
                  <td className="text-[#2C5E96] border-b border-gray-100 align-top pt-4">
                    {row.lastRank}
                  </td>
                  <td className="text-[#2C5E96] border-b border-gray-100 align-top pt-4">
                    <div>
                      {row.lastScore}
                      <span className="text-gray-400 text-[10px] font-normal">
                        /{row.max}
                      </span>
                    </div>
                    {row.isTimeRow && (
                      <div className="text-[10px] text-[#2C5E96] mt-2 font-normal border-t border-gray-100 pt-1">
                        {row.lastTimeDisplay}
                      </div>
                    )}
                  </td>

                  {/* This Time */}
                  <td className="text-[#E63939] border-b border-gray-100 align-top pt-4">
                    {row.thisRank}
                  </td>
                  <td className="text-[#E63939] border-b border-gray-100 align-top pt-4">
                    <div>
                      {row.thisScore}
                      <span className="text-gray-400 text-[10px] font-normal">
                        /{row.max}
                      </span>
                    </div>
                    {row.isTimeRow && (
                      <div className="text-[10px] text-[#E63939] mt-2 font-normal border-t border-gray-100 pt-1">
                        {row.thisTimeDisplay}
                      </div>
                    )}
                  </td>

                  {/* Comparison */}
                  <td className="border-b border-gray-100 align-top pt-4">
                    <div className="flex justify-center">
                      {renderTrend(row.thisScore, row.natScore)}
                    </div>
                  </td>
                  <td className="border-b border-gray-100 align-top pt-4">
                    <div className="flex justify-center">
                      {renderTrend(row.thisScore, row.lastScore)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BOTTOM: RADAR CHART --- */}
      <div className="bg-white rounded-sm border border-gray-200 p-6 relative h-[600px] flex flex-col shadow-sm w-full">
        {/* Title */}
        <div className="border-b border-gray-100 pb-2 mb-4">
          <h3 className="text-left text-gray-600 font-medium text-sm">
            graph name
          </h3>
        </div>

        {/* Legend */}
        <div className="absolute top-14 right-6 flex flex-col gap-3 z-10 pointer-events-none bg-white/80 p-2 rounded">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-bold text-[#56B8D4]">
              National average
            </span>
            <div className="w-8 h-[2px] bg-[#56B8D4]"></div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-bold text-[#2C5E96]">
              last time
            </span>
            <div className="w-8 h-[2px] bg-[#2C5E96]"></div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-bold text-[#FF5E5E]">
              this time
            </span>
            <div className="w-8 h-[2px] bg-[#FF5E5E]"></div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 w-full relative">
          {/* The numeric ticks along the axis lines */}
          <CustomGridOverlay />

          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="75%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              {/* polygon gridType with 4 points creates a diamond/square grid */}
              <PolarGrid gridType="polygon" stroke="#e5e7eb" strokeWidth={1} />

              {/* Custom Axis Labels (Outside) */}
              <PolarAngleAxis dataKey="subject" tick={CustomAxisTick} />

              {/* Hidden Radius Axis (just for scaling) */}
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />

              {/* 1. National Average (Cyan) */}
              <Radar
                name="National average"
                dataKey="national"
                stroke="#56B8D4"
                strokeWidth={2}
                fill="transparent"
                isAnimationActive={false}
              />

              {/* 2. Last Time (Dark Blue) */}
              <Radar
                name="last time"
                dataKey="last"
                stroke="#2C5E96"
                strokeWidth={2}
                fill="transparent"
                isAnimationActive={true}
              />

              {/* 3. This Time (Red) */}
              <Radar
                name="this time"
                dataKey="current"
                stroke="#FF5E5E"
                strokeWidth={2}
                fill="transparent"
                isAnimationActive={true}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
