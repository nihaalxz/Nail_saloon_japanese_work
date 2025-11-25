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
const SCORE_MAPPING = {
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

// --- SMART DATA FINDER ---
function smartGetValue(record, key) {
  if (!record) return "-";
  if (record[key] !== undefined && record[key] !== null) return record[key];

  // 1. Try matching "14_1" or "14-1" if key is "one_color_14_1"
  const match = key.match(/(\d+)[_](\d+)$/);
  if (match) {
    const underscoreKey = `${match[1]}_${match[2]}`;
    const dashKey = `${match[1]}-${match[2]}`;
    if (record[underscoreKey] != null) return record[underscoreKey];
    if (record[dashKey] != null) return record[dashKey];
  }

  // 2. Try finding by Category number (Crucial for OneColor/Time columns like "33" or "14")
  // We reverse lookup the category from mapping
  for (const group in SCORE_MAPPING) {
    const item = SCORE_MAPPING[group].find((i) => i.key === key);
    if (item) {
      // Check exact category string "14"
      if (record[item.category] != null) return record[item.category];
      // Check score variant "14_score"
      if (record[`${item.category}_score`] != null)
        return record[`${item.category}_score`];
    }
  }
  return "-";
}

// --- ENDPOINT ---
app.get("/generate-pdf", async (req, res) => {
  const { customerId } = req.query;

  if (!customerId) return res.status(400).send("Missing customerId");

  try {
    // 1. Fetch Customer
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .maybeSingle();

    if (custError || !customer) throw new Error("Customer Not Found");

    // 2. Fetch Data
    const { data: skillChecks } = await supabase
      .from("skill_checks")
      .select("*")
      .eq("customer_id", customerId)
      .order("imported_at", { ascending: false });

    // Find first valid row (where total_score is not null/0, OR has care data)
    let currentCheck = {};
    if (skillChecks && skillChecks.length > 0) {
      currentCheck =
        skillChecks.find((r) => r.total_score || r.care_rank) || skillChecks[0];
    }

    // 3. Generate HTML
    const htmlContent = generateHTML(customer, currentCheck, skillChecks || []);

    // 4. PDF Generation
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 60000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    await browser.close();

    const filename = encodeURIComponent(`${customer.name}_Report.pdf`);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Content-Length": pdf.length,
    });
    res.send(Buffer.from(pdf));
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ PDF Server running on http://localhost:${PORT}`);
});

// ---------------------------------------------------------
//  HTML GENERATION LOGIC
// ---------------------------------------------------------
function generateHTML(customer, currentCheck, history) {
  const dateStr = currentCheck.imported_at
    ? new Date(currentCheck.imported_at).toLocaleDateString("ja-JP")
    : new Date().toLocaleDateString("ja-JP");

  const safeRank = (rank) => rank || "-";

  // --- CHART RENDERER (FIXED FOR OVERFLOW) ---
  const renderChart = (items) => {
    const definedCategories = [...new Set(items.map((i) => i.category))].sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    // Determine Scale: Is this out of 4 or out of 20?
    let maxScoreInDataset = 0;

    const categoryData = definedCategories.map((cat) => {
      const itemsInCat = items.filter((i) => i.category === cat);
      let total = 0;
      let count = 0;
      itemsInCat.forEach((item) => {
        const raw = smartGetValue(currentCheck, item.key);
        const val = Number(raw);
        if (!isNaN(val) && raw !== "-") {
          total += val;
          count++;
          if (val > maxScoreInDataset) maxScoreInDataset = val;
        }
      });
      const avg = count > 0 ? total / count : 0;
      return { cat, avg };
    });

    // If max score found is > 5, assume the scale is out of 20. Otherwise out of 4.
    const MAX_SCALE = maxScoreInDataset > 5 ? 20 : 4;

    return `
      <div class="chart-wrapper">
        <div class="goal-label-box">目標</div>
        <div class="chart-container">
            <div class="goal-line" style="bottom: ${(3 / 4) * 100}%;"></div>
            <div class="grid-line" style="bottom: 25%"></div>
            <div class="grid-line" style="bottom: 50%"></div>
            <div class="grid-line" style="bottom: 75%"></div>
            
            ${categoryData
              .map((d) => {
                // Clamp height to 100% to prevent overflow
                let heightPct = (d.avg / MAX_SCALE) * 100;
                if (heightPct > 100) heightPct = 100;

                return `
                <div class="bar-col">
                  <div class="bar-track">
                    <div class="bar" style="height: ${heightPct}%;">
                       ${
                         d.avg > 0
                           ? `<span class="bar-val">${d.avg
                               .toFixed(1)
                               .replace(".0", "")}</span>`
                           : ""
                       }
                    </div>
                  </div>
                  <span class="bar-label">${d.cat}</span>
                </div>
              `;
              })
              .join("")}
        </div>
      </div>
    `;
  };

  const renderRows = (items) => {
    return items
      .map((item) => {
        const val = smartGetValue(currentCheck, item.key);
        return `<tr><td class="text-left">${item.label}</td><td class="center">${val}</td></tr>`;
      })
      .join("");
  };

  const renderTimeRows = () => {
    return SCORE_MAPPING.time
      .map((item) => {
        const timeVal = smartGetValue(currentCheck, item.key);
        // For score, try the specific _score key, or fall back to main logic
        let score = smartGetValue(currentCheck, `${item.key}_score`);
        if (score === "-")
          score = smartGetValue(currentCheck, item.category + "_score");

        return `<tr><td class="text-left">${item.label}</td><td class="center">${timeVal}</td><td class="center">${score}</td></tr>`;
      })
      .join("");
  };

  // --- SVG ASSETS ---
  const crownSVG = `<svg viewBox="0 0 24 24" fill="#C5A059" width="24" height="24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>`;
  const swirlTopSVG = `<svg viewBox="0 0 300 30" fill="none" stroke="#C5A059" stroke-width="1"><path d="M10,25 Q150,-10 290,25" /></svg>`;
  const swirlBottomSVG = `<svg viewBox="0 0 300 30" fill="none" stroke="#C5A059" stroke-width="1"><path d="M10,5 Q150,40 290,5" /></svg>`;

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        :root { 
            --teal-header: #5DBCD2; 
            --gold: #C5A059; 
            --bar-yellow: #F4D35E;
            --goal-red: #FF6347;
            --table-border: #ddd;
        }
        * { box-sizing: border-box; }
        body { font-family: 'Noto Sans JP', sans-serif; margin: 0; padding: 0; background: #fff; color: #333; -webkit-print-color-adjust: exact; }
        
        @page { size: A4; margin: 0; }
        .page { width: 210mm; height: 297mm; padding: 10mm 15mm; position: relative; page-break-after: always; overflow: hidden; }
        .page:last-child { page-break-after: auto; }

        /* HEADER */
        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
        .header-title { font-size: 16px; font-weight: bold; }
        .header-right { text-align: right; font-size: 11px; }

        /* RANK */
        .rank-wrapper { text-align: center; margin: 10px auto 20px; width: 100%; display: flex; justify-content: center; flex-direction: column; align-items: center; }
        .rank-letter { font-size: 50px; color: #666; line-height: 1; padding: 5px 0; }
        .crown-box { margin-bottom: -10px; position: relative; z-index: 10; }

        /* CHART */
        .chart-wrapper { position: relative; margin: 20px 0; }
        .goal-label-box { 
            position: absolute; top: 38px; left: 0px; 
            background: #D65A77; color: white; 
            font-size: 9px; padding: 2px 5px; z-index: 20; 
        }
        .chart-container { 
            position: relative; height: 160px; 
            border-bottom: 1px solid #333; 
            display: flex; align-items: flex-end; 
            padding-left: 20px; 
        }
        .goal-line { position: absolute; left: 20px; right: 0; border-top: 2px solid #D65A77; z-index: 5; }
        .grid-line { position: absolute; left: 20px; right: 0; border-top: 1px solid #eee; z-index: 1; }
        
        .bar-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; z-index: 10; }
        .bar-track { height: 100%; width: 100%; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; /* FIX: Prevent overflow */ }
        .bar { width: 65%; background: var(--bar-yellow); position: relative; max-height: 100%; }
        .bar-val { position: absolute; top: -15px; width: 100%; text-align: center; font-size: 10px; color: #aaa; }
        .bar-label { margin-top: 5px; font-size: 10px; color: #333; }

        /* TABLES */
        .section-header { 
            background-color: var(--teal-header); 
            color: white; 
            padding: 5px 10px; 
            font-weight: bold; 
            font-size: 12px; 
            margin-top: 20px;
        }
        
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px; }
        th, td { border: 1px solid var(--table-border); padding: 5px; }
        th { background-color: #eee; color: #333; text-align: center; }
        .detail-header th { background-color: #FFC0CB; color: white; } /* Pink headers */
        
        .text-left { text-align: left; }
        .center { text-align: center; }

        .summary-table th { background-color: var(--teal-header); color: white; }
        .summary-table td { font-size: 14px; font-weight: bold; text-align: center; padding: 10px; }
        
      </style>
    </head>
    <body>

    <div class="page">
        <div class="header">
            <div><div style="font-size:10px; color:#666;">基礎スキルチェック 診断結果</div><div class="header-title">${
              customer.name
            } 様</div></div>
            <div class="header-right"><div>採点日</div><div style="font-weight:bold;">${dateStr}</div></div>
        </div>

        <div class="rank-wrapper">
            <div class="crown-box">${crownSVG}</div>
            <div style="width:300px;">${swirlTopSVG}</div>
            <div class="rank-letter">${safeRank(currentCheck.rank)}</div>
            <div style="width:300px;">${swirlBottomSVG}</div>
            <div style="font-size:10px; margin-top:5px;">総合評価</div>
        </div>

        <table class="summary-table">
            <tr><th style="background:white; border:none;"></th><th>ケア</th><th>ワンカラー</th><th>グラデーション</th><th>タイム</th></tr>
            <tr><td style="font-size:12px; background:#eee;">Evaluation</td><td>${safeRank(
              currentCheck.care_rank
            )}</td><td>${safeRank(
    currentCheck.one_color_rank
  )}</td><td>${safeRank(currentCheck.gradation_rank)}</td><td>${safeRank(
    currentCheck.time_rank
  )}</td></tr>
        </table>

        <div style="margin-top:20px; font-size:10px; border:1px solid #eee; padding:10px;">
            <strong>■評価ランクの説明</strong><br>AAA: トップクラスの基礎技術<br>AA: 理想的な基礎技術<br>A: 標準的な基礎技術<br>B: 改善が必要な基礎技術
        </div>

        <div class="section-header" style="margin-top:30px; background:#333;">■診断履歴</div>
        <table>
            <thead><tr><th>#</th><th>Date</th><th>Rank</th><th>Total</th><th>Care</th><th>1Color</th><th>Grad</th><th>Time</th></tr></thead>
            <tbody>
            ${history
              .slice(0, 10)
              .map(
                (h, i) => `
                <tr>
                    <td class="center">${i + 1}</td><td class="center">${
                  h.imported_at
                    ? new Date(h.imported_at).toLocaleDateString("ja-JP")
                    : "-"
                }</td>
                    <td class="center"><strong>${safeRank(
                      h.rank
                    )}</strong></td><td class="center">${
                  h.total_score || "-"
                }</td>
                    <td class="center">${safeRank(
                      h.care_rank
                    )}</td><td class="center">${safeRank(h.one_color_rank)}</td>
                    <td class="center">${safeRank(
                      h.gradation_rank
                    )}</td><td class="center">${safeRank(h.time_rank)}</td>
                </tr>`
              )
              .join("")}
            </tbody>
        </table>
    </div>

    <div class="page">
        <div class="header"><div class="header-title">${
          customer.name
        } 様</div><div class="header-right">${dateStr}</div></div>
        <div class="rank-wrapper" style="margin:0;">
            <div style="width:150px;">${swirlTopSVG}</div><div class="rank-letter" style="font-size:30px;">${safeRank(
    currentCheck.care_rank
  )}</div><div style="width:150px;">${swirlBottomSVG}</div><div style="font-size:10px;">(1) ケア (Care)</div>
        </div>
        ${renderChart(SCORE_MAPPING.care)}
        <div class="section-header">■スキルチェック詳細 (Detail)</div>
        <table class="detail-table"><thead class="detail-header"><tr><th>Check Item</th><th width="50">Score</th></tr></thead><tbody>${renderRows(
          SCORE_MAPPING.care
        )}</tbody></table>
    </div>

    <div class="page">
        <div class="header"><div class="header-title">${
          customer.name
        } 様</div><div class="header-right">${dateStr}</div></div>
        <div class="rank-wrapper" style="margin:0;">
            <div style="width:150px;">${swirlTopSVG}</div><div class="rank-letter" style="font-size:30px;">${safeRank(
    currentCheck.one_color_rank
  )}</div><div style="width:150px;">${swirlBottomSVG}</div><div style="font-size:10px;">(2) ワンカラー (One Color)</div>
        </div>
        ${renderChart(SCORE_MAPPING.oneColor)}
        <div class="section-header">■スキルチェック詳細 (Detail)</div>
        <table class="detail-table"><thead class="detail-header"><tr><th>Check Item</th><th width="50">Score</th></tr></thead><tbody>${renderRows(
          SCORE_MAPPING.oneColor
        )}</tbody></table>
    </div>

    <div class="page">
        <div class="header"><div class="header-title">${
          customer.name
        } 様</div><div class="header-right">${dateStr}</div></div>
        <div class="rank-wrapper" style="margin:0;">
            <div style="width:150px;">${swirlTopSVG}</div><div class="rank-letter" style="font-size:30px;">${safeRank(
    currentCheck.gradation_rank
  )}</div><div style="width:150px;">${swirlBottomSVG}</div><div style="font-size:10px;">(3) グラデーション (Gradation)</div>
        </div>
        ${renderChart(SCORE_MAPPING.gradation)}
        <div class="section-header">■スキルチェック詳細 (Detail)</div>
        <table class="detail-table"><thead class="detail-header"><tr><th>Check Item</th><th width="50">Score</th></tr></thead><tbody>${renderRows(
          SCORE_MAPPING.gradation
        )}</tbody></table>
    </div>

    <div class="page">
        <div class="header"><div class="header-title">${
          customer.name
        } 様</div><div class="header-right">${dateStr}</div></div>
        <div class="rank-wrapper" style="margin:0;">
            <div style="width:150px;">${swirlTopSVG}</div><div class="rank-letter" style="font-size:30px;">${safeRank(
    currentCheck.time_rank
  )}</div><div style="width:150px;">${swirlBottomSVG}</div><div style="font-size:10px;">(4) タイム (Time)</div>
        </div>
        <div class="section-header">■タイム詳細 (Detail)</div>
        <table class="detail-table"><thead class="detail-header"><tr><th>Category</th><th>Actual</th><th>Score</th></tr></thead><tbody>${renderTimeRows()}</tbody></table>
        <div style="text-align:right; font-weight:bold; margin-top:5px;">総合タイム: ${
          currentCheck.total_time || "00:00"
        }</div>
    </div>

    </body>
    </html>
  `;
}
