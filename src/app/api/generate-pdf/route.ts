// src/app/api/generate-pdf/route.ts

import { NextRequest, NextResponse } from "next/server";

import puppeteer from "puppeteer";

import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    // 1. Launch Puppeteer

    const browser = await puppeteer.launch({
      headless: true,

      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 2. Forward Auth Cookies

    // We must pass the current user's session to Puppeteer so it can access the protected page

    const cookieStore = await cookies();

    const allCookies = cookieStore.getAll();

    if (allCookies.length > 0) {
      await page.setCookie(
        ...allCookies.map((c) => ({
          name: c.name,

          value: c.value,

          domain: req.nextUrl.hostname, // e.g., localhost or your-domain.com

          path: "/",
        }))
      );
    }

    // 3. Navigate to the page

    // We construct the URL to the specific customer page

    const targetUrl = `${req.nextUrl.origin}/customers/${customerId}`; // Adjust this path to match your routing

    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    // 4. Inject CSS to hide elements we don't want in the PDF (like the download button/navbar)

    await page.addStyleTag({
      content: `



        @media print {



          button, nav, .no-print { display: none !important; }



          body { background-color: #FFF5F5 !important; -webkit-print-color-adjust: exact; }



        }



      `,
    });

    // 5. Generate PDF

    const pdfBuffer = await page.pdf({
      format: "A4",

      printBackground: true, // Ensures colors/charts render correctly

      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    // 6. Return PDF to client

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `attachment; filename="report-${customerId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Puppeteer Error:", error);

    return NextResponse.json(
      { error: "Failed to generate PDF" },

      { status: 500 }
    );
  }
}
