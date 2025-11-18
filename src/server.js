import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const PORT = 3001; // Runs separately from Vite (5173)

app.use(cors());
app.use(express.json());

app.get("/generate-pdf", async (req, res) => {
  const { id } = req.query;
  const authHeader = req.headers.authorization; // We get the token from React

  if (!id || !authHeader) {
    return res.status(400).send("Missing ID or Auth Token");
  }

  // The URL of your local Vite app
  const targetUrl = `http://localhost:5173/customer/${id}`;

  console.log(`Generating PDF for: ${targetUrl}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 1. AUTHENTICATION INJECTION
    // We must inject the Supabase token into the puppeteer browser
    // so it can fetch the private data.
    const token = authHeader.split(" ")[1];

    // Go to the base URL first to initialize local storage context
    await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });

    await page.evaluate((token) => {
      // Find the Supabase key in localStorage (usually starts with 'sb-')
      // If you know your specific key (e.g., 'sb-wkby...-auth-token'), you can hardcode it.
      const key = Object.keys(localStorage).find((k) => k.startsWith("sb-"));

      if (key) {
        const currentSession = JSON.parse(localStorage.getItem(key) || "{}");
        // Update the token in the storage
        currentSession.access_token = token;
        localStorage.setItem(key, JSON.stringify(currentSession));
      }
    }, token);

    // 2. PAGE SETTINGS
    // Set viewport wide enough to trigger the 2-column layout (Desktop view)
    await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 2 });

    // 3. NAVIGATE TO ACTUAL PAGE
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // 4. WAIT FOR CHART
    // Wait for the Recharts graph to actually draw
    await page
      .waitForSelector(".recharts-surface", { timeout: 5000 })
      .catch(() => console.log("Chart waiting timeout"));

    // 5. GENERATE PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true, // CRITICAL: Prints the pink/teal background colors
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    // Send back to React
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });
    res.send(pdf);
  } catch (error) {
    console.error("Puppeteer Error:", error);
    res.status(500).send("Error generating PDF");
  } finally {
    if (browser) await browser.close();
  }
  n;
});

app.listen(PORT, () => {
  console.log(`PDF Server running on http://localhost:${PORT}`);
});
