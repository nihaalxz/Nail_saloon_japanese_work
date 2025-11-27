import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- CREDENTIALS ---
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Supabase Credentials missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DATA MAPPING ---
const MAPPING = {
  care: [
    { category: "1", label: "1-1 ガタつき", key: "care_1_1", alloc: 10 },
    { category: "1", label: "1-2 バランス", key: "care_1_2", alloc: 20 },
    { category: "1", label: "1-3 形の統一", key: "care_1_3", alloc: 20 },
    { category: "2", label: "2-1 サイド下がり", key: "care_2_1", alloc: 20 },
    { category: "2", label: "2-2 サイド上がり", key: "care_2_2", alloc: 10 },
    { category: "2", label: "2-3 角残り", key: "care_2_3", alloc: 10 },
    { category: "3", label: "3-1 中心", key: "care_3_1", alloc: 20 },
    { category: "3", label: "3-2 左右対称", key: "care_3_2", alloc: 10 },
    {
      category: "4",
      label: "4-1 ルースキューティクル",
      key: "care_4_1",
      alloc: 20,
    },
    {
      category: "5",
      label: "5-1 ルースキューティクル",
      key: "care_5_1",
      alloc: 20,
    },
    {
      category: "6",
      label: "6-1 ルースキューティクル",
      key: "care_6_1",
      alloc: 30,
    },
    {
      category: "7",
      label: "7-1 ルースキューティクル",
      key: "care_7_1",
      alloc: 10,
    },
    { category: "8", label: "8-1 小爪", key: "care_8_1", alloc: 20 },
    { category: "8", label: "8-2 ハードスキン", key: "care_8_2", alloc: 20 },
    {
      category: "9",
      label: "9-1 ルースキューティクル",
      key: "care_9_1",
      alloc: 10,
    },
    { category: "9", label: "9-2 ガタつき", key: "care_9_2", alloc: 30 },
    { category: "10", label: "10-1 ガタつき", key: "care_10_1", alloc: 30 },
    { category: "10", label: "10-2 切りすぎ", key: "care_10_2", alloc: 10 },
    { category: "10", label: "10-3 ささくれ", key: "care_10_3", alloc: 10 },
    { category: "11", label: "11-1 削りすぎ", key: "care_11_1", alloc: 20 },
    { category: "11", label: "11-2 削り不足", key: "care_11_2", alloc: 20 },
    { category: "12", label: "12-1 ジェル残り", key: "care_12_1", alloc: 20 },
    { category: "13", label: "13-1 根元段差", key: "care_13_1", alloc: 20 },
    { category: "13", label: "13-2 表面凹凸", key: "care_13_2", alloc: 20 },
    { category: "13", label: "13-3 サイド削り", key: "care_13_3", alloc: 10 },
    { category: "13", label: "13-4 厚み", key: "care_13_4", alloc: 10 },
  ],
  oneColor: [
    {
      category: "14",
      label: "14-1 ベース キューティクルライン",
      key: "color_14_1",
      alloc: 10,
    },
    {
      category: "14",
      label: "14-2 ベース コーナーサイド",
      key: "color_14_2",
      alloc: 20,
    },
    {
      category: "14",
      label: "14-3 カラー/トップ キューティクルライン",
      key: "color_14_3",
      alloc: 20,
    },
    {
      category: "14",
      label: "14-4 カラー/トップ コーナーサイド",
      key: "color_14_4",
      alloc: 10,
    },
    {
      category: "15",
      label: "15-1 すき間/塗漏れ",
      key: "color_15_1",
      alloc: 20,
    },
    { category: "15", label: "15-2 ガタつき", key: "color_15_2", alloc: 10 },
    {
      category: "16",
      label: "16-1 すき間/塗漏れ",
      key: "color_16_1",
      alloc: 10,
    },
    { category: "16", label: "16-2 ガタつき", key: "color_16_2", alloc: 20 },
    {
      category: "17",
      label: "17-1 すき間/塗漏れ",
      key: "color_17_1",
      alloc: 10,
    },
    { category: "17", label: "17-2 ガタつき", key: "color_17_2", alloc: 20 },
    { category: "18", label: "18-1 位置", key: "color_18_1", alloc: 20 },
    {
      category: "18",
      label: "18-2 アーチガタつき",
      key: "color_18_2",
      alloc: 30,
    },
    {
      category: "19",
      label: "19-1 キューティクルエリア",
      key: "color_19_1",
      alloc: 10,
    },
    { category: "19", label: "19-2 コーナー", key: "color_19_2", alloc: 20 },
    {
      category: "19",
      label: "19-3 イエローライン",
      key: "color_19_3",
      alloc: 20,
    },
    { category: "19", label: "19-4 先端", key: "color_19_4", alloc: 20 },
    { category: "19", label: "19-5 サイド", key: "color_19_5", alloc: 20 },
    {
      category: "19",
      label: "19-6 サイドストレート",
      key: "color_19_6",
      alloc: 20,
    },
    {
      category: "20",
      label: "20-1 すき間/塗漏れ",
      key: "color_20_1",
      alloc: 20,
    },
    { category: "20", label: "20-2 ガタつき", key: "color_20_2", alloc: 30 },
    {
      category: "21",
      label: "21-1 すき間/塗漏れ",
      key: "color_21_1",
      alloc: 30,
    },
    { category: "21", label: "21-2 ガタつき", key: "color_21_2", alloc: 10 },
    {
      category: "22",
      label: "22-1 すき間/塗漏れ",
      key: "color_22_1",
      alloc: 10,
    },
    { category: "22", label: "22-2 ガタつき", key: "color_22_2", alloc: 20 },
    {
      category: "23",
      label: "23-1 すき間/塗漏れ",
      key: "color_23_1",
      alloc: 20,
    },
    { category: "23", label: "23-2 ガタつき", key: "color_23_2", alloc: 20 },
    {
      category: "24",
      label: "24-1 すき間/塗漏れ",
      key: "color_24_1",
      alloc: 20,
    },
    { category: "24", label: "24-2 ガタつき", key: "color_24_2", alloc: 10 },
    { category: "25", label: "25-1 塗漏れ", key: "color_25_1", alloc: 10 },
    { category: "25", label: "25-2 ガタつき", key: "color_25_2", alloc: 10 },
    { category: "25", label: "25-3 裏流れ", key: "color_25_3", alloc: 20 },
    { category: "26", label: "26-1 位置", key: "color_26_1", alloc: 10 },
    {
      category: "26",
      label: "26-2 アーチガタつき",
      key: "color_26_2",
      alloc: 20,
    },
    {
      category: "27",
      label: "27-1 キューティクルエリア",
      key: "color_27_1",
      alloc: 10,
    },
    { category: "27", label: "27-2 コーナー", key: "color_27_2", alloc: 10 },
    {
      category: "27",
      label: "27-3 イエローライン",
      key: "color_27_3",
      alloc: 10,
    },
    { category: "27", label: "27-4 先端", key: "color_27_4", alloc: 10 },
    { category: "27", label: "27-5 サイド", key: "color_27_5", alloc: 10 },
    {
      category: "27",
      label: "27-6 サイドストレート",
      key: "color_27_6",
      alloc: 10,
    },
  ],
  gradation: [
    { category: "28", label: "28-1 縦筋", key: "grad_28_1", alloc: 10 },
    { category: "28", label: "28-2 ハケあと", key: "grad_28_2", alloc: 10 },
    { category: "28", label: "28-3 左右差", key: "grad_28_3", alloc: 10 },
    { category: "28", label: "28-4 色たまり", key: "grad_28_4", alloc: 10 },
    { category: "29", label: "29-1 中間透け感", key: "grad_29_1", alloc: 10 },
    { category: "29", label: "29-2 先端発色", key: "grad_29_2", alloc: 10 },
    { category: "30", label: "30-1 はみ出し", key: "grad_30_1", alloc: 10 },
    { category: "30", label: "30-2 塗漏れ", key: "grad_30_2", alloc: 10 },
    { category: "30", label: "30-3 ガタつき", key: "grad_30_3", alloc: 10 },
    { category: "31", label: "31-1 位置", key: "grad_31_1", alloc: 10 },
    {
      category: "31",
      label: "31-2 アーチガタつき",
      key: "grad_31_2",
      alloc: 10,
    },
    {
      category: "32",
      label: "32-1 キューティクルエリア",
      key: "grad_32_1",
      alloc: 10,
    },
    { category: "32", label: "32-2 コーナー", key: "grad_32_2", alloc: 10 },
    {
      category: "32",
      label: "32-3 イエローライン",
      key: "grad_32_3",
      alloc: 10,
    },
    { category: "32", label: "32-4 先端", key: "grad_32_4", alloc: 10 },
    { category: "32", label: "32-5 サイド", key: "grad_32_5", alloc: 10 },
    {
      category: "32",
      label: "32-6 サイドストレート",
      key: "grad_32_6",
      alloc: 10,
    },
  ],
  time: [
    {
      category: "33",
      label: "33 ケアタイム (10本)",
      key: "time_29_3_value",
      target: 20,
      alloc: 10,
    },
    {
      category: "34",
      label: "34 オフタイム (5本)",
      key: "time_29_1_value",
      target: 13,
      alloc: 20,
    },
    {
      category: "35",
      label: "35 フィルインタイム (5本)",
      key: "time_29_2_value",
      target: 8,
      alloc: 10,
    },
    {
      category: "36",
      label: "36-1 ベース (ワンカラー)",
      key: "time_29_4_value",
      target: 6,
      alloc: 20,
    },
    {
      category: "36",
      label: "36-2 カラー (ワンカラー)",
      key: "time_29_5_value",
      target: 10,
      alloc: 10,
    },
    {
      category: "36",
      label: "36-3 トップ (ワンカラー)",
      key: "time_29_6_value",
      target: 5,
      alloc: 20,
    },
    {
      category: "36",
      label: "36 ワンカラータイム (5本)",
      key: "time_29_7_value",
      target: 21,
      alloc: 20,
    },
    {
      category: "37",
      label: "37-1 ベース (グラデーション)",
      key: "time_30_1_value",
      target: 6,
      alloc: 20,
    },
    {
      category: "37",
      label: "37-2 カラー (グラデーション)",
      key: "time_30_2_value",
      target: 10,
      alloc: 10,
    },
    {
      category: "37",
      label: "37-3 トップ (グラデーション)",
      key: "time_30_3_value",
      target: 5,
      alloc: 20,
    },
    {
      category: "37",
      label: "37 グラデーションタイム (5本)",
      key: "time_30_4_value",
      target: 21,
      alloc: 20,
    },
  ],
};

// --- HELPERS ---
function parseMinutes(str) {
  if (!str) return 0;
  const match = str.toString().match(/(\d+)分/);
  const secMatch = str.toString().match(/(\d+)秒/);
  let mins = match ? parseInt(match[1], 10) : 0;
  let secs = secMatch ? parseInt(secMatch[1], 10) : 0;
  return mins + secs / 60;
}

function getScoreData(record, item, type = "score") {
  if (!record) return { raw: 0, norm: 0, str: "-" };

  let rawVal = 0;
  let displayStr = "-";

  if (type === "time") {
    const timeStr = record[item.key];
    displayStr = timeStr ? timeStr.toString() : "-";
    if (timeStr) {
      rawVal = 3;
    }
  } else {
    if (item.key && record[item.key] !== undefined) {
      rawVal = Number(record[item.key]);
      displayStr = rawVal.toString();
    } else {
      rawVal = 0;
    }
  }
  return { raw: rawVal, norm: rawVal, str: displayStr };
}

// --- UPDATED RANK LOGIC (FIXED) ---
function calculateExactRank(score, type) {
  if (score === undefined || score === null) return "-";

  if (type === "care") {
    // Care (Max 410): AAA:349~, AA:298~, A:246~, B:~245
    if (score >= 349) return "AAA";
    if (score >= 298) return "AA";
    if (score >= 246) return "A";
    return "B";
  }

  if (type === "oneColor") {
    // One Color (Max 610): AAA:519~, AA:443~, A:367~, B:~366
    if (score >= 519) return "AAA";
    if (score >= 443) return "AA";
    if (score >= 367) return "A";
    return "B";
  }

  if (type === "gradation") {
    const pct = (score / 100) * 100; // if score is out of 100
    if (pct >= 90) return "AAA";
    if (pct >= 80) return "AA";
    if (pct >= 70) return "A";
    return "B";
  }

  if (type === "total") {
    // Total (Max 1320): AAA:1123~, AA:958~, A:793~, B:~792
    if (score >= 1123) return "AAA";
    if (score >= 958) return "AA";
    if (score >= 793) return "A";
    return "B";
  }

  // --- FIXED TIME RANK LOGIC ---
  if (type === "time") {
    if (score >= 380) return "AAA"; // Hypothetical threshold for AAA
    if (score >= 360) return "AA"; // Hypothetical threshold for AA
    if (score >= 300) return "A"; // 350 falls here
    return "B"; // 267 falls here
  }

  // Fallback
  return "B";
}

function calculateTotalTime(record) {
  if (record.total_time) return record.total_time;
  return "-";
}

// --- CHART GENERATOR (UPDATED STYLE) ---
function generateBarChartSVG(data, width, height) {
  const cats = {};
  data.forEach((item) => {
    if (!cats[item.category]) cats[item.category] = { total: 0, count: 0 };
    cats[item.category].total += item.score;
    cats[item.category].count++;
  });

  const labels = Object.keys(cats).sort((a, b) => parseInt(a) - parseInt(b));
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;
  const barWidth = (chartW / labels.length) * 0.6;
  const spacing = chartW / labels.length;
  const bottomY = height - paddingY;

  let barsHTML = "";
  labels.forEach((cat, i) => {
    const avg = cats[cat].count ? cats[cat].total / cats[cat].count : 0;
    const barHeight = (avg / 4) * chartH;
    const x = paddingX + i * spacing + (spacing - barWidth) / 2;
    const y = bottomY - barHeight;

    barsHTML += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#F6D66A" />`;
    if (avg > 0) {
      barsHTML += `<text x="${x + barWidth / 2}" y="${
        y - 5
      }" font-size="10" text-anchor="middle" fill="#999">${avg.toFixed(
        1
      )}</text>`;
    }
    barsHTML += `<text x="${x + barWidth / 2}" y="${
      bottomY + 15
    }" font-size="10" text-anchor="middle" fill="#666">${cat}</text>`;
  });

  const targetY = bottomY - (3 / 4) * chartH;
  const targetLine = `
    <line x1="${paddingX - 10}" y1="${targetY}" x2="${
    width - paddingX + 10
  }" y2="${targetY}" stroke="#D95383" stroke-width="1.5" />
    <rect x="${paddingX - 25}" y="${
    targetY - 9
  }" width="28" height="18" fill="#D95383" rx="2" />
    <text x="${paddingX - 11}" y="${
    targetY + 4
  }" font-size="10" fill="white" text-anchor="middle" font-weight="bold">目標</text>
  `;

  let gridHTML = "";
  for (let i = 1; i <= 4; i++) {
    const y = bottomY - (i / 4) * chartH;
    gridHTML += `<line x1="${paddingX}" y1="${y}" x2="${
      width - paddingX
    }" y2="${y}" stroke="#eee" stroke-width="1" />`;
    gridHTML += `<text x="${paddingX - 10}" y="${
      y + 3
    }" font-size="9" fill="#ccc" text-anchor="end">${i}</text>`;
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${gridHTML}
    ${barsHTML}
    ${targetLine}
    <line x1="${paddingX}" y1="${bottomY}" x2="${
    width - paddingX
  }" y2="${bottomY}" stroke="#666" stroke-width="1" />
  </svg>`;
}

// --- ENDPOINT ---
app.get("/generate-pdf", async (req, res) => {
  const { customerId } = req.query;
  if (!customerId) return res.status(400).send("Missing customerId");

  try {
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    const { data: skillChecks } = await supabase
      .from("skill_checks")
      .select("*")
      .eq("customer_id", customerId)
      .order("imported_at", { ascending: false });

    let currentCheck = skillChecks?.[0] || {};
    let history = skillChecks || [];

    const htmlContent = generateHTML(customer, currentCheck, history);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();

    const filename = encodeURIComponent(`${customer?.name || "Report"}.pdf`);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    });
    res.send(Buffer.from(pdf));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ PDF Server running on http://localhost:${PORT}`)
);

// --- HTML GENERATOR ---
function generateHTML(customer, curr, history) {
  const dateStr = curr.imported_at
    ? new Date(curr.imported_at).toLocaleDateString("ja-JP")
    : "-";
  const name = customer?.name || "Guest";
  const displayTotalTime = calculateTotalTime(curr);

  // Helper to prepare data for chart
  const prepData = (mapping, type = "score") =>
    mapping.map((item) => ({
      category: item.category,
      score: getScoreData(curr, item, type).norm,
    }));

  // Helper to prepare legend data
  const getLegendData = (mapping) => {
    const cats = [];
    const seen = new Set();
    mapping.forEach((item) => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        cats.push({ id: item.category, label: item.label });
      }
    });
    return cats.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  };

  const renderRankBox = (rank, label, extraText = null) => {
    const goldColor = "#C1A066";
    const topDecorationSVG = `
    <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="xMidYMax">
      <path d="M100 10 L108 25 L118 20 L112 35 L120 38 L100 38 L80 38 L88 35 L82 20 L92 25 Z" fill="${goldColor}" />
      <circle cx="100" cy="8" r="2" fill="${goldColor}" />
      <circle cx="82" cy="18" r="2" fill="${goldColor}" />
      <circle cx="118" cy="18" r="2" fill="${goldColor}" />
      <path d="M125 35 Q140 35 150 25 T180 20 Q190 20 195 30" fill="none" stroke="${goldColor}" stroke-width="2" stroke-linecap="round" />
      <path d="M125 42 Q145 42 160 30 T190 35" fill="none" stroke="${goldColor}" stroke-width="1" stroke-linecap="round" />
      <path d="M75 35 Q60 35 50 25 T20 20 Q10 20 5 30" fill="none" stroke="${goldColor}" stroke-width="2" stroke-linecap="round" />
      <path d="M75 42 Q55 42 40 30 T10 35" fill="none" stroke="${goldColor}" stroke-width="1" stroke-linecap="round" />
    </svg>
  `;

    const bottomDecorationSVG = `
    <svg viewBox="0 0 200 40" width="100%" height="100%" preserveAspectRatio="xMidYMin">
      <path d="M100 10 Q105 10 105 18 Q105 26 100 26 Q95 26 95 18 Q95 10 100 10" fill="none" stroke="${goldColor}" stroke-width="2" />
      <path d="M100 26 L100 35" fill="none" stroke="${goldColor}" stroke-width="2" />
      <path d="M106 18 Q130 18 150 10 T195 25" fill="none" stroke="${goldColor}" stroke-width="2" stroke-linecap="round" />
      <path d="M108 24 Q130 30 150 20 T190 30" fill="none" stroke="${goldColor}" stroke-width="1" stroke-linecap="round" />
      <path d="M94 18 Q70 18 50 10 T5 25" fill="none" stroke="${goldColor}" stroke-width="2" stroke-linecap="round" />
      <path d="M92 24 Q70 30 50 20 T10 30" fill="none" stroke="${goldColor}" stroke-width="1" stroke-linecap="round" />
    </svg>
  `;

    return `
    <div class="rank-wrapper">
       <div class="rank-deco-top">${topDecorationSVG}</div>
       <div class="rank-val">${rank}</div>
       <div class="rank-deco-bottom">${bottomDecorationSVG}</div>
       ${
         extraText
           ? `<div class="rank-extra"><div>総合タイム</div><div class="time-val">${extraText}</div></div>`
           : `<div class="rank-label">${label}</div>`
       }
    </div>
  `;
  };

  const renderHeader = (title) => `
    <header class="page-header">
       <div class="header-left">
           <h1 class="doc-title">${title}</h1>
       </div>
       <div class="header-right">
           <div class="meta-row"><span class="label">採点日</span> <span class="val">${dateStr}</span></div>
           <div class="meta-row"><span class="val name">${name} 様</span></div>
       </div>
    </header>`;

  // --- DETAIL TABLE ---
  const renderDetailTable = (mapping, type = "score") => `
    <table class="detail-table">
      ${mapping
        .map((item) => {
          const { str, norm } = getScoreData(curr, item, type);
          const pct = Math.min((norm / 4) * 100, 100);
          return `<tr>
            <td class="col-label">${item.label}</td>
            <td class="col-val">${str}</td>
            <td class="col-bar">
              <div class="bar-container">
                 <div class="bar-track">
                    <div class="bar-fill" style="width:${pct}%"></div>
                 </div>
                 ${type !== "time" ? `<div class="target-line"></div>` : ""}
              </div>
            </td>
          </tr>`;
        })
        .join("")}
    </table>`;

  // --- LEGEND ---
  const renderChartLegend = (mapping) => {
    const legendItems = getLegendData(mapping);
    return `
      <div class="chart-legend">
        ${legendItems
          .map(
            (item) => `
          <div class="legend-item">
            <span class="legend-num">${item.id}</span>
            <span class="legend-text">${item.label}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  const renderReferenceTimeTable = () => `
    <div class="ref-section">
      <div class="panel-header">■ 参考タイム</div>
      <table class="ref-table">
        <thead>
          <tr>
             <th style="background:#fff; border:none;"></th>
             <th class="th-aaa">AAA<br><span class="pt">4点</span></th>
             <th class="th-aa">AA<br><span class="pt">3点</span></th>
             <th class="th-a">A<br><span class="pt">2点</span></th>
             <th class="th-b">B<br><span class="pt">1点</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="lbl">プレパレーション タイム</td>
            <td>~ 22分00秒 まで</td>
            <td class="bg-pink">22分01秒 ~<br>23分00秒 まで</td>
            <td class="bg-blue">23分01秒 ~<br>24分00秒 まで</td>
            <td class="bg-purple">24分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">オフ タイム</td>
            <td>~ 13分00秒 まで</td>
            <td class="bg-pink">13分01秒 ~<br>14分00秒 まで</td>
            <td class="bg-blue">14分01秒 ~<br>15分00秒 まで</td>
            <td class="bg-purple">15分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">フィルイン タイム</td>
            <td>~ 8分00秒 まで</td>
            <td class="bg-pink">8分01秒 ~<br>9分00秒 まで</td>
            <td class="bg-blue">9分01秒 ~<br>10分00秒 まで</td>
            <td class="bg-purple">10分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">ワンカラー ベース</td>
            <td>~ 6分00秒 まで</td>
            <td class="bg-pink">6分01秒 ~<br>7分00秒 まで</td>
            <td class="bg-blue"></td>
            <td class="bg-purple">7分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl" style="padding-left:4em;">カラー</td>
            <td>~ 10分00秒 まで</td>
            <td class="bg-pink"></td>
            <td class="bg-blue">10分01秒 ~<br>11分00秒 まで</td>
            <td class="bg-purple">11分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl" style="padding-left:4em;">トップ</td>
            <td>~ 5分00秒 まで</td>
            <td class="bg-pink"></td>
            <td class="bg-blue"></td>
            <td class="bg-purple">5分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">ワンカラー 合計タイム</td>
            <td>~ 21分00秒 まで</td>
            <td class="bg-pink">21分01秒 ~<br>22分00秒 まで</td>
            <td class="bg-blue">22分01秒 ~<br>23分00秒 まで</td>
            <td class="bg-purple">23分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">グラデーション ベース</td>
            <td>~ 6分00秒 まで</td>
            <td class="bg-pink">6分01秒 ~<br>7分00秒 まで</td>
            <td class="bg-blue"></td>
            <td class="bg-purple">7分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl" style="padding-left:4em;">カラー</td>
            <td>~ 10分00秒 まで</td>
            <td class="bg-pink"></td>
            <td class="bg-blue">10分01秒 ~<br>11分00秒 まで</td>
            <td class="bg-purple">11分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl" style="padding-left:4em;">トップ</td>
            <td>~ 5分00秒 まで</td>
            <td class="bg-pink"></td>
            <td class="bg-blue"></td>
            <td class="bg-purple">5分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">グラデーション 合計タイム</td>
            <td>~ 21分00秒 まで</td>
            <td class="bg-pink">21分01秒 ~<br>22分00秒 まで</td>
            <td class="bg-blue">22分01秒 ~<br>23分00秒 まで</td>
            <td class="bg-purple">23分01秒 ~</td>
          </tr>
          <tr>
            <td class="lbl">総合計タイム (フィルインを含む)</td>
            <td>~ 85分00秒 まで</td>
            <td class="bg-pink">85分01秒 ~<br>90分00秒 まで</td>
            <td class="bg-blue">90分01秒 ~<br>95分00秒 まで</td>
            <td class="bg-purple">95分01秒 ~</td>
          </tr>
           <tr>
            <td class="lbl">総合計タイム (フィルインを含まない)</td>
            <td>~ 77分00秒 まで</td>
            <td class="bg-pink">77分01秒 ~<br>81分00秒 まで</td>
            <td class="bg-blue">81分01秒 ~<br>85分00秒 まで</td>
            <td class="bg-purple">85分01秒 ~</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // --- PAGE 1: Summary (Updated with Banner & New Colors) ---
  const summaryPage = `
    <div class="page">
      <div class="page-header" style="border-bottom:none; margin-bottom:10px;">
        <h1 class="doc-title" style="text-align:center; width:100%; font-size:28px;">基礎スキルチェック 診断結果</h1>
      </div>
      
      <div class="summary-banner">
         <div class="banner-left">
             <div class="customer-name">${name} 様</div>
             <div class="banner-date"><span style="font-size:9px;">採点日</span><br>${dateStr}</div>
         </div>
         <div class="banner-right">
             <div class="total-label">総合評価</div>
             <div class="total-rank">${calculateExactRank(
               curr.total_score,
               "total"
             )}</div>
         </div>
      </div>

      <table class="summary-score-table">
         <thead>
           <tr><th>ケア</th><th>ワンカラー</th><th>グラデーション</th><th>タイム</th></tr>
         </thead>
         <tbody>
           <tr>
             <td>${calculateExactRank(curr.care_score, "care")}</td>
             <td>${calculateExactRank(curr.color_score, "oneColor")}</td>
             <td>${calculateExactRank(curr.art_score, "gradation")}</td>
             <td>${calculateExactRank(curr.time_score || 200, "time")}</td>
           </tr>
         </tbody>
      </table>

      <div class="info-section">
         <h3>■ 評価ランクの説明</h3>
         <div class="info-grid">
            <div class="info-item"><span class="grade">AAA</span><span class="desc">お客様に選ばれるネイリストとしてトップクラスの基礎技術</span></div>
            <div class="info-item"><span class="grade">AA</span><span class="desc">お客様に選ばれるネイリストとして理想的な基礎技術</span></div>
            <div class="info-item"><span class="grade">A</span><span class="desc">お客様に選ばれるネイリストとして標準的な基礎技術</span></div>
            <div class="info-item"><span class="grade">B</span><span class="desc">お客様に選ばれるネイリストとして改善が必要な基礎技術</span></div>
         </div>
      </div>

      <div class="history-section">
         <h3>■ 診断履歴</h3>
         <table class="history-table">
            <thead>
              <tr>
                <th>#</th><th>顧客ID</th><th>顧客氏名</th><th>総合評価</th>
                <th>ケア</th><th>ワンカラー</th><th>グラデ</th><th>タイム</th>
                <th>総合タイム</th><th>採点日</th>
              </tr>
            </thead>
            <tbody>
              ${history
                .slice(0, 10)
                .map(
                  (h, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${customer.customer_number}</td>
                  <td>${name}</td>
                  <td class="bold">${calculateExactRank(
                    h.total_score,
                    "total"
                  )}</td>
                  <td>${calculateExactRank(h.care_score, "care")}</td>
                  <td>${calculateExactRank(h.color_score, "oneColor")}</td>
                  <td>${calculateExactRank(h.art_score, "gradation")}</td>
                  <td>${calculateExactRank(h.time_score || 200, "time")}</td>
                  <td>${h.total_time || "-"}</td>
                  <td>${new Date(h.imported_at).toLocaleDateString(
                    "ja-JP"
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
         </table>
      </div>
      
      <div class="footer">
         <div class="footer-left">ネイルアットマイサロン</div>
         <div class="footer-center">(1)</div>
      </div>
    </div>
  `;

  // --- DETAIL PAGES ---
  const renderDetailPage = (
    title,
    mapping,
    rank,
    pageNum,
    type = "score",
    extraText = null
  ) => `
    <div class="page">
      ${renderHeader(title)}
      <div class="detail-container">
         <div class="left-panel">
            <div class="rank-area">
               ${renderRankBox(rank, title, extraText)}
            </div>
            <div class="chart-area">
               ${generateBarChartSVG(prepData(mapping, type), 260, 180)}
            </div>
            ${type !== "time" ? renderChartLegend(mapping) : ""} 
         </div>
         <div class="right-panel">
            <div class="panel-header">■ スキルチェックの詳細結果</div>
            <div class="table-scroll">
                ${renderDetailTable(mapping, type)}
            </div>
         </div>
      </div>
      
      ${title === "タイム" ? renderReferenceTimeTable() : ""}

      <div class="footer">
         <div class="footer-left">ネイルアットマイサロン</div>
         <div class="footer-center">(${pageNum})</div>
      </div>
    </div>
  `;

  // --- CSS STYLES ---
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap');
    
    body { margin: 0; padding: 0; font-family: 'Zen Old Mincho', serif; color: #555; -webkit-print-color-adjust: exact; }
    .page { width: 210mm; height: 297mm; position: relative; box-sizing: border-box; padding: 20mm; page-break-after: always; overflow: hidden; background: #fff; }
    
    /* Title Color - Periwinkle Blue matched to image */
    .doc-title { font-size: 18px; color: #929BC8; margin: 0; font-weight: bold; }

    /* Header */
    .page-header { display: flex; justify-content: space-between; border-bottom: 2px solid #F0C4D9; padding-bottom: 10px; margin-bottom: 20px; }
    .header-right { text-align: right; font-size: 10px; line-height: 1.4; color: #888; }
    .header-right .name { font-size: 14px; color: #333; font-weight: bold; }
    
    /* --- NEW SUMMARY BANNER CSS --- */
    .summary-banner {
        width: 100%;
        height: 120px;
        /* Green to Blue Gradient */
        background: linear-gradient(90deg, #CDE8D7 0%, #9EA8D6 100%);
        border-radius: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 40px;
        box-sizing: border-box;
        color: #333;
        margin-bottom: 30px;
    }
    .banner-left { display: flex; flex-direction: column; justify-content: center; gap: 5px; }
    .customer-name { font-size: 18px; font-weight: bold; color: #333; }
    .banner-date { font-size: 14px; line-height: 1.2; color: #333; }
    .banner-right { text-align: center; color: #fff; }
    .total-label { font-size: 12px; font-weight: bold; margin-bottom: 0px; color: #fff; opacity: 0.9; }
    .total-rank { font-size: 60px; font-weight: 500; line-height: 1; font-family: sans-serif; color: #fff; }

    /* --- SUMMARY TABLE UPDATES --- */
    .summary-score-table { width: 100%; margin: 20px 0; border-collapse: collapse; text-align: center; }
    /* Table Header Light Blue Background */
    .summary-score-table th { background: #CCD1E9; padding: 10px; font-size: 11px; color: #333; font-weight: bold; border: none; }
    /* Rank Text Color Grey */
    .summary-score-table td { padding: 15px; font-size: 40px; font-weight: 400; color: #777; border-bottom: none; font-family: sans-serif; }
    
    .info-section { border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .info-section h3, .history-section h3 { font-size: 12px; border-left: 4px solid #5BBFB4; padding-left: 8px; margin: 0 0 10px 0; color: #333; }
    .info-grid { font-size: 10px; }
    .info-item { display: flex; align-items: center; margin-bottom: 4px; }
    .grade { font-weight: bold; width: 40px; color: #333; }
    
    .history-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .history-table th { background: #E6F5F4; border: 1px solid #ddd; padding: 5px; color: #444; }
    .history-table td { border: 1px solid #ddd; padding: 5px; text-align: center; color: #666; }
    .history-table .bold { font-weight: bold; color: #333; }

    /* Rank Box (Detail Pages) */
    .rank-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin: 0 auto; width: 160px; }
    .rank-deco-top { width: 100%; height: 45px; margin-bottom: -15px; z-index: 1; }
    .rank-deco-bottom { width: 100%; height: 30px; margin-top: -15px; z-index: 1; }
    .rank-val { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 85px; line-height: 1; font-weight: 500; color: #777; z-index: 2; margin: 0; padding: 0; }
    .rank-label { font-size: 12px; color: #C1A066; margin-top: 5px; font-weight: bold; letter-spacing: 1px; }
    .rank-extra { text-align: center; margin-top: 5px; }
    .rank-extra div:first-child { font-size: 9px; color: #999; }
    .time-val { font-size: 16px; font-weight: bold; color: #333; }

    /* Detail Page */
    .detail-container { display: flex; gap: 30px; align-items: flex-start; }
    .left-panel { width: 35%; display: flex; flex-direction: column; align-items: center; }
    .right-panel { width: 65%; }
    .chart-area { margin-top: 30px; }
    .panel-header { background: #666; color: #fff; padding: 5px 10px; font-size: 11px; margin-bottom: 10px; font-family: "Noto Sans JP"; }
    
    .detail-table { width: 100%; border-collapse: collapse; font-size: 9px; font-family: "Noto Sans JP"; }
    .detail-table td { padding: 4px 5px; border-bottom: 1px solid #eee; }
    .col-label { text-align: left; width: 60%; }
    .col-val { text-align: center; width: 10%; font-weight: bold; }
    .col-bar { width: 30%; vertical-align: middle; position: relative; }
    .bar-container { position: relative; width: 100%; height: 6px; }
    .bar-track { background: #eee; height: 100%; width: 100%; border-radius: 2px; position: absolute; top: 0; left: 0; }
    .bar-fill { background: #999; height: 100%; border-radius: 2px; }
    .target-line { position: absolute; top: -5px; bottom: -5px; left: 75%; width: 1.5px; background-color: #D95383; z-index: 10; }

    .chart-legend { margin-top: 20px; width: 100%; text-align: left; }
    .legend-item { font-size: 8px; color: #666; margin-bottom: 2px; display: flex; align-items: flex-start; }
    .legend-num { font-weight: bold; width: 15px; flex-shrink: 0; }
    .legend-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Reference Table */
    .ref-section { margin-top: 20px; }
    .ref-table { width: 100%; border-collapse: collapse; font-size: 8px; font-family: "Noto Sans JP"; text-align: center; }
    .ref-table th { border: 1px solid #ccc; padding: 5px; color: #fff; font-weight: bold; }
    .ref-table td { border: 1px solid #ccc; padding: 4px; color: #333; }
    .th-aaa { background: #fff; color: #666; border-bottom: 1px solid #ccc; }
    .th-aa { background: #C85D78; }
    .th-a  { background: #E6E6F0; color: #666; }
    .th-b  { background: #9EA6D4; }
    .pt { font-size: 7px; font-weight: normal; display: block; margin-top: 2px; }
    .bg-pink { background: #F4D5DB; }
    .bg-blue { background: #DCE0F2; }
    .bg-purple { background: #9EA6D4; color: #fff !important; }
    .lbl { text-align: left; background: #fff; font-weight: bold; color: #666; width: 20%; padding-left: 5px; }

    /* --- UPDATED FOOTER --- */
    .footer { 
        position: absolute; 
        bottom: 15mm; 
        left: 20mm; 
        right: 20mm; 
        font-size: 9px; 
        color: #666;
        border-top: 2px solid #929BC8; /* Solid Blue Line */
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
    }
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${css}</style>
      </head>
      <body>
        ${summaryPage}
        ${renderDetailPage(
          "ケア",
          MAPPING.care,
          calculateExactRank(curr.care_score, "care"),
          2
        )}
        ${renderDetailPage(
          "ワンカラー",
          MAPPING.oneColor,
          calculateExactRank(curr.color_score, "oneColor"),
          3
        )}
        ${renderDetailPage(
          "グラデーション",
          MAPPING.gradation,
          calculateExactRank(curr.art_score, "gradation"),
          4
        )}
        ${renderDetailPage(
          "タイム",
          MAPPING.time,
          calculateExactRank(curr.time_score || 200, "time"),
          5,
          "time",
          displayTotalTime
        )}
      </body>
    </html>
  `;
}
