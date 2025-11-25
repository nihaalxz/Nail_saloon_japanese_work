import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

// ------------------------------------------------------------------
// 1. TYPE DEFINITIONS (Fixes ESLint 'any' errors)
// ------------------------------------------------------------------
interface ScoreItem {
  label: string;
  key: string;
  category: string;
  target?: string;
}

interface Customer {
  name: string;
  customer_number?: string;
  [key: string]: unknown;
}

interface SkillCheckData {
  imported_at?: string;
  rank?: string;
  total_score?: number | string;
  care_rank?: string;
  one_color_rank?: string;
  gradation_rank?: string;
  time_rank?: string;
  total_time?: string;
  [key: string]: string | number | undefined | null;
}

// ------------------------------------------------------------------
// 2. CONFIGURATION MAPPING
// ------------------------------------------------------------------
const SCORE_MAPPING: Record<string, ScoreItem[]> = {
  care: [
    { label: "1-1 ガタつき", key: "care_1_1", category: "1" },
    { label: "1-2 バランス", key: "care_1_2", category: "1" },
    { label: "1-3 形の統一", key: "care_1_3", category: "1" },
    { label: "2-1 サイド下がり", key: "care_2_1", category: "2" },
    { label: "2-2 サイド上がり", key: "care_2_2", category: "2" },
    { label: "2-3 角残り", key: "care_2_3", category: "2" },
    { label: "3-1 中心", key: "care_3_1", category: "3" },
    { label: "3-2 左右対称", key: "care_3_2", category: "3" },
    { label: "4-1 ルースキューティクル", key: "care_4_1", category: "4" },
    { label: "5-1 ルースキューティクル", key: "care_5_1", category: "5" },
    { label: "6-1 ルースキューティクル", key: "care_6_1", category: "6" },
    { label: "7-1 ルースキューティクル", key: "care_7_1", category: "7" },
    { label: "8-1 小爪", key: "care_8_1", category: "8" },
    { label: "8-2 ハードスキン", key: "care_8_2", category: "8" },
    { label: "9-1 ルースキューティクル", key: "care_9_1", category: "9" },
    { label: "9-2 ガタつき", key: "care_9_2", category: "9" },
    { label: "10-1 ガタつき", key: "care_10_1", category: "10" },
    { label: "10-2 切りすぎ", key: "care_10_2", category: "10" },
    { label: "10-3 ささくれ", key: "care_10_3", category: "10" },
    { label: "11-1 削りすぎ", key: "care_11_1", category: "11" },
    { label: "11-2 削り不足", key: "care_11_2", category: "11" },
    { label: "12-1 ジェル残り", key: "care_12_1", category: "12" },
    { label: "13-1 根元段差", key: "care_13_1", category: "13" },
    { label: "13-2 表面凹凸", key: "care_13_2", category: "13" },
    { label: "13-3 サイド削り", key: "care_13_3", category: "13" },
    { label: "13-4 厚み", key: "care_13_4", category: "13" },
  ],
  oneColor: [
    {
      label: "14-1 ベース キューティクルライン",
      key: "one_color_14_1",
      category: "14",
    },
    {
      label: "14-2 ベース コーナーサイド",
      key: "one_color_14_2",
      category: "14",
    },
    {
      label: "14-3 カラー/トップ キューティクルライン",
      key: "one_color_14_3",
      category: "14",
    },
    {
      label: "14-4 カラー/トップ コーナーサイド",
      key: "one_color_14_4",
      category: "14",
    },
    { label: "15-1 すき間/塗漏れ", key: "one_color_15_1", category: "15" },
    { label: "15-2 ガタつき", key: "one_color_15_2", category: "15" },
    { label: "16-1 すき間/塗漏れ", key: "one_color_16_1", category: "16" },
    { label: "16-2 ガタつき", key: "one_color_16_2", category: "16" },
    { label: "17-1 すき間/塗漏れ", key: "one_color_17_1", category: "17" },
    { label: "17-2 ガタつき", key: "one_color_17_2", category: "17" },
    { label: "18-1 位置", key: "one_color_18_1", category: "18" },
    { label: "18-2 アーチガタつき", key: "one_color_18_2", category: "18" },
    {
      label: "19-1 キューティクルエリア",
      key: "one_color_19_1",
      category: "19",
    },
    { label: "19-2 コーナー", key: "one_color_19_2", category: "19" },
    { label: "19-3 イエローライン", key: "one_color_19_3", category: "19" },
    { label: "19-4 先端", key: "one_color_19_4", category: "19" },
    { label: "19-5 サイド", key: "one_color_19_5", category: "19" },
    { label: "19-6 サイドストレート", key: "one_color_19_6", category: "19" },
    { label: "20-1 すき間/塗漏れ", key: "one_color_20_1", category: "20" },
    { label: "20-2 ガタつき", key: "one_color_20_2", category: "20" },
    { label: "21-1 すき間/塗漏れ", key: "one_color_21_1", category: "21" },
    { label: "21-2 ガタつき", key: "one_color_21_2", category: "21" },
    { label: "22-1 すき間/塗漏れ", key: "one_color_22_1", category: "22" },
    { label: "22-2 ガタつき", key: "one_color_22_2", category: "22" },
    { label: "23-1 すき間/塗漏れ", key: "one_color_23_1", category: "23" },
    { label: "23-2 ガタつき", key: "one_color_23_2", category: "23" },
    { label: "24-1 すき間/塗漏れ", key: "one_color_24_1", category: "24" },
    { label: "24-2 ガタつき", key: "one_color_24_2", category: "24" },
    { label: "25-1 塗漏れ", key: "one_color_25_1", category: "25" },
    { label: "25-2 ガタつき", key: "one_color_25_2", category: "25" },
    { label: "25-3 裏流れ", key: "one_color_25_3", category: "25" },
    { label: "26-1 位置", key: "one_color_26_1", category: "26" },
    { label: "26-2 アーチガタつき", key: "one_color_26_2", category: "26" },
    {
      label: "27-1 キューティクルエリア",
      key: "one_color_27_1",
      category: "27",
    },
    { label: "27-2 コーナー", key: "one_color_27_2", category: "27" },
    { label: "27-3 イエローライン", key: "one_color_27_3", category: "27" },
    { label: "27-4 先端", key: "one_color_27_4", category: "27" },
    { label: "27-5 サイド", key: "one_color_27_5", category: "27" },
    { label: "27-6 サイドストレート", key: "one_color_27_6", category: "27" },
  ],
  gradation: [
    { label: "28-1 縦筋", key: "grad_28_1", category: "28" },
    { label: "28-2 ハケあと", key: "grad_28_2", category: "28" },
    { label: "28-3 左右差", key: "grad_28_3", category: "28" },
    { label: "28-4 色たまり", key: "grad_28_4", category: "28" },
    { label: "29-1 中間透け感", key: "grad_29_1", category: "29" },
    { label: "29-2 先端発色", key: "grad_29_2", category: "29" },
    { label: "30-1 はみ出し", key: "grad_30_1", category: "30" },
    { label: "30-2 塗漏れ", key: "grad_30_2", category: "30" },
    { label: "30-3 ガタつき", key: "grad_30_3", category: "30" },
    { label: "31-1 位置", key: "grad_31_1", category: "31" },
    { label: "31-2 アーチガタつき", key: "grad_31_2", category: "31" },
    { label: "32-1 キューティクルエリア", key: "grad_32_1", category: "32" },
    { label: "32-2 コーナー", key: "grad_32_2", category: "32" },
    { label: "32-3 イエローライン", key: "grad_32_3", category: "32" },
    { label: "32-4 先端", key: "grad_32_4", category: "32" },
    { label: "32-5 サイド", key: "grad_32_5", category: "32" },
    { label: "32-6 サイドストレート", key: "grad_32_6", category: "32" },
  ],
  time: [
    {
      label: "33 ケアタイム (10本)",
      key: "time_care",
      target: "20分00秒",
      category: "33",
    },
    {
      label: "34 オフタイム (5本)",
      key: "time_off",
      target: "15分00秒",
      category: "34",
    },
    {
      label: "35 フィルインタイム (5本)",
      key: "time_fillin",
      target: "10分00秒",
      category: "35",
    },
    {
      label: "36-1 ベース (ワンカラー)",
      key: "time_one_color_base",
      target: "6分00秒",
      category: "36",
    },
    {
      label: "36-2 カラー (ワンカラー)",
      key: "time_one_color_color",
      target: "10分00秒",
      category: "36",
    },
    {
      label: "36-3 トップ (ワンカラー)",
      key: "time_one_color_top",
      target: "5分00秒",
      category: "36",
    },
    {
      label: "36 ワンカラータイム (5本)",
      key: "time_one_color_total",
      target: "25分00秒",
      category: "36",
    },
    {
      label: "37-1 ベース (グラデーション)",
      key: "time_grad_base",
      target: "6分00秒",
      category: "37",
    },
    {
      label: "37-2 カラー (グラデーション)",
      key: "time_grad_color",
      target: "10分00秒",
      category: "37",
    },
    {
      label: "37-3 トップ (グラデーション)",
      key: "time_grad_top",
      target: "5分00秒",
      category: "37",
    },
    {
      label: "37 グラデーションタイム (5本)",
      key: "time_grad_total",
      target: "22分00秒",
      category: "37",
    },
  ],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ------------------------------------------------------------------
// 3. MAIN GET HANDLER
// ------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId)
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  try {
    // 1. Fetch Data
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (custError)
      throw new Error("Customer fetch failed: " + custError.message);

    const { data: skillChecks, error: skillError } = await supabase
      .from("skill_checks")
      .select("*")
      .eq("customer_id", customerId)
      .order("imported_at", { ascending: false });

    if (skillError)
      throw new Error("Skill check fetch failed: " + skillError.message);

    const currentCheck = skillChecks?.[0] || {};

    // 2. Generate HTML
    const htmlContent = generateHTML(customer, currentCheck, skillChecks || []);

    // 3. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Use 'load' to ensure fonts and styles are fully ready
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    // 4. Return Response (Encoded Filename)
    const filename = encodeURIComponent(`${customer.name}_Report.pdf`);

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch (error: unknown) {
    console.error("PDF Generation Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// 4. HTML GENERATOR (Strictly Typed)
// ------------------------------------------------------------------
function generateHTML(
  customer: Customer,
  currentCheck: SkillCheckData,
  history: SkillCheckData[]
) {
  const dateStr = currentCheck.imported_at
    ? new Date(currentCheck.imported_at).toLocaleDateString("ja-JP")
    : new Date().toLocaleDateString("ja-JP");

  const getScore = (key: string) => currentCheck[key] ?? "-";

  // Helper: Chart Renderer
  const renderChart = (items: ScoreItem[]) => {
    const categoryScores: Record<string, number[]> = {};

    items.forEach((item: ScoreItem) => {
      const val = Number(currentCheck[item.key]);
      if (!isNaN(val)) {
        if (!categoryScores[item.category]) categoryScores[item.category] = [];
        categoryScores[item.category].push(val);
      }
    });

    const categories = Object.keys(categoryScores).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    return `
      <div class="chart-container">
        ${categories
          .map((cat) => {
            const scores = categoryScores[cat];
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const heightPct = (avg / 4) * 100;
            return `
            <div class="bar-col">
              <div class="bar-wrapper">
                <div class="bar" style="height: ${heightPct}%;">
                   <span class="bar-val">${avg.toFixed(1)}</span>
                </div>
              </div>
              <span class="bar-label">${cat}</span>
            </div>
          `;
          })
          .join("")}
        <div class="goal-line"></div>
      </div>
    `;
  };

  // Helper: Row Renderer
  const renderRows = (items: ScoreItem[]) => {
    return items
      .map((item: ScoreItem) => {
        const score = getScore(item.key);
        let colorClass = "";
        if (score == 4) colorClass = "score-4";
        else if (score == 3) colorClass = "score-3";
        else if (score == 2) colorClass = "score-2";
        else if (score == 1) colorClass = "score-1";

        return `
        <tr>
          <td class="text-left">${item.label}</td>
          <td class="score-cell ${colorClass}">${score}</td>
        </tr>
      `;
      })
      .join("");
  };

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        :root { --pink: #FFB7B2; --bg-pink: #FFF5F5; --gold: #C5A059; --text: #4B5563; }
        
        body { font-family: 'Noto Sans JP', sans-serif; margin: 0; color: var(--text); background: #fff; }
        
        .page {
          width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box;
          page-break-after: always; position: relative;
          background: linear-gradient(to bottom, #fff 90%, var(--bg-pink) 100%);
        }
        .page:last-child { page-break-after: auto; }

        h1 { font-size: 22px; margin: 0; color: #333; }
        h2 { font-size: 16px; border-bottom: 2px solid var(--pink); padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px;}
        h3 { text-align: center; font-size: 18px; color: var(--text); margin: 0; }
        
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #E5E7EB; color: #4B5563; padding: 6px; border: 1px solid #ddd; }
        td { border: 1px solid #ddd; padding: 6px; text-align: center; }
        .text-left { text-align: left; padding-left: 10px; }
        .detail-table th { background: var(--pink); color: white; }
        
        .score-4 { color: #0000FF; font-weight: bold; } 
        .score-3 { color: #008000; font-weight: bold; }
        .score-2 { color: #FFA500; font-weight: bold; } 
        .score-1 { color: #FF0000; font-weight: bold; } 

        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .rank-box { text-align: center; margin: 20px auto; min-width: 120px; position: relative; display: inline-block; }
        .rank-main { font-size: 40px; font-weight: bold; color: var(--text); border-top: 2px solid var(--gold); border-bottom: 2px solid var(--gold); padding: 5px 20px; display: inline-block; background: rgba(255, 183, 178, 0.1); }
        .crown { position: absolute; top: -25px; left: 0; right: 0; color: var(--gold); font-size: 24px; text-align: center;}

        .chart-container { display: flex; align-items: flex-end; height: 140px; padding: 10px 20px; gap: 8px; position: relative; margin-bottom: 20px; border-bottom: 1px solid #333; }
        .goal-line { position: absolute; top: 45px; left: 0; right: 0; border-top: 1px solid red; z-index: 10; opacity: 0.7;}
        .goal-line::after { content: "目標 (Goal)"; position: absolute; right: 0; top: -15px; color: red; font-size: 10px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .bar-wrapper { height: 100%; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
        .bar { width: 70%; background: #FCD34D; border-radius: 4px 4px 0 0; position: relative; }
        .bar-val { position: absolute; top: -15px; width: 100%; text-align: center; font-size: 10px; font-weight: bold; }
        .bar-label { font-size: 10px; margin-top: 4px; }
      </style>
    </head>
    <body>

      <div class="page">
        <div class="header">
          <div><small style="color:var(--pink)">基礎スキルチェック 診断結果</small><h1>${
            customer.name
          } 様</h1></div>
          <div style="text-align:right;"><small>採点日</small><div>${dateStr}</div></div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
           <div class="rank-box" style="margin-right: 20px;">
             <div class="crown">♕</div>
             <div class="rank-main">${currentCheck.rank || "-"}</div>
             <div style="font-size:10px; margin-top:5px;">総合評価 (Total Rank)</div>
           </div>
           <div class="rank-box">
             <div class="rank-main" style="border-color: var(--pink); color: var(--pink);">${
               currentCheck.total_score || 0
             }</div>
             <div style="font-size:10px; margin-top:5px;">総合得点 (Total Score)</div>
           </div>
        </div>

        <h2>診断履歴 (History)</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Date</th><th>Total Rank</th><th>Total Score</th><th>Care</th><th>One Color</th><th>Gradation</th><th>Time</th></tr>
          </thead>
          <tbody>
            ${history
              .map(
                (h: SkillCheckData, i: number) => `
              <tr>
                <td>${i + 1}</td>
                <td>${
                  h.imported_at
                    ? new Date(h.imported_at).toLocaleDateString("ja-JP")
                    : "-"
                }</td>
                <td style="font-weight:bold;">${h.rank || "-"}</td>
                <td>${h.total_score || "0"}</td>
                <td>${h.care_rank || "-"}</td>
                <td>${h.one_color_rank || "-"}</td>
                <td>${h.gradation_rank || "-"}</td>
                <td>${h.time_rank || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="page">
        <div class="header"><h3>(1) ケア (Care)</h3></div>
        <div style="text-align:center;">
          <div class="rank-box"><div class="crown">♕</div><div class="rank-main">${
            currentCheck.care_rank || "-"
          }</div></div>
        </div>
        ${renderChart(SCORE_MAPPING.care)}
        <h2>スキルチェック詳細 (Detail)</h2>
        <table class="detail-table">
          <thead><tr><th class="text-left">Check Item</th><th width="50">Score</th></tr></thead>
          <tbody>${renderRows(SCORE_MAPPING.care)}</tbody>
        </table>
      </div>

      <div class="page">
        <div class="header"><h3>(2) ワンカラー (One Color)</h3></div>
        <div style="text-align:center;">
          <div class="rank-box"><div class="crown">♕</div><div class="rank-main">${
            currentCheck.one_color_rank || "-"
          }</div></div>
        </div>
        ${renderChart(SCORE_MAPPING.oneColor)}
        <h2>スキルチェック詳細 (Detail)</h2>
        <table class="detail-table">
          <thead><tr><th class="text-left">Check Item</th><th width="50">Score</th></tr></thead>
          <tbody>${renderRows(SCORE_MAPPING.oneColor)}</tbody>
        </table>
      </div>

      <div class="page">
        <div class="header"><h3>(3) グラデーション (Gradation)</h3></div>
        <div style="text-align:center;">
          <div class="rank-box"><div class="crown">♕</div><div class="rank-main">${
            currentCheck.gradation_rank || "-"
          }</div></div>
        </div>
        ${renderChart(SCORE_MAPPING.gradation)}
        <h2>スキルチェック詳細 (Detail)</h2>
        <table class="detail-table">
           <thead><tr><th class="text-left">Check Item</th><th width="50">Score</th></tr></thead>
           <tbody>${renderRows(SCORE_MAPPING.gradation)}</tbody>
        </table>
      </div>

      <div class="page">
        <div class="header"><h3>(4) タイム (Time)</h3></div>
        <div style="text-align:center;">
          <div class="rank-box"><div class="crown">♕</div><div class="rank-main">${
            currentCheck.time_rank || "-"
          }</div></div>
        </div>
        
        <h2>タイム詳細 (Time Detail)</h2>
        <table class="detail-table">
          <thead>
            <tr>
              <th class="text-left">Category</th>
              <th>Target</th>
              <th>Your Time</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${SCORE_MAPPING.time
              .map((item: ScoreItem) => {
                const timeValue = currentCheck[item.key] || "00:00";
                const scoreValue = currentCheck[`${item.key}_score`] || "-";

                return `
              <tr>
                <td class="text-left">${item.label}</td>
                <td>${item.target}</td>
                <td>${timeValue}</td>
                <td class="score-cell score-${scoreValue}">${scoreValue}</td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: right; font-weight: bold; font-size: 14px;">
           総合タイム (Total Time): ${currentCheck.total_time || "00:00"}
        </div>
      </div>

    </body>
    </html>
  `;
}
