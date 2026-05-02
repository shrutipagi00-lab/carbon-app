import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the Carbon Credit Intelligence Platform AI Assistant — an expert carbon finance analyst for an MBA Corporate Finance project.

You analyze 16 companies — 12 Indian Designated Consumers and 4 global benchmarks — across 4 sectors: Iron & Steel, Petrochemicals, Aluminium, and Chloro-Alkali.

INDIAN COMPANIES (FY 2022-23 data):
Iron & Steel:
- Tata Steel: 49.6 Mt CO2, intensity 2.48 tCO2/tcs, gap 5.6 Mt, ESCert deficit 2.2M, invest cost Rs 198 Cr, CBAM Rs 7.75 Cr/yr, strategy BUY. FY24 est 48.2 Mt, FY26 proj 46.8 Mt.
- JSW Steel: 50.8 Mt CO2, intensity 2.31 tCO2/tcs, gap 5.8 Mt, ESCert deficit 2.3M, invest cost Rs 207 Cr, CBAM Rs 9.98 Cr/yr, strategy HYBRID. Project SEED underway. FY26 proj 48.0 Mt.
- Bhushan Power Steel: 11.5 Mt CO2, intensity 2.55 tCO2/tcs, gap 0.7 Mt, invest cost Rs 63 Cr, strategy BUY. FY26 proj 10.8 Mt.

Petrochemicals:
- Reliance Industries: 52.8 Mt CO2, gap 4.8 Mt, invest cost Rs 336 Cr, CBAM Rs 81 Cr/yr, strategy INVEST, Net Zero 2035. FY26 proj 49.5 Mt. India largest private company — operates refining, petrochemicals, Jio telecom, retail.
- Indian Oil Corporation: 21.3 Mt CO2, gap 1.8 Mt, invest cost Rs 126 Cr, strategy BUY. FY26 proj 19.8 Mt.
- Bharat Petroleum: 14.7 Mt CO2, gap 0.9 Mt, invest cost Rs 63 Cr, strategy BUY. FY26 proj 13.5 Mt.

Aluminium:
- Hindalco Industries: 28.4 Mt CO2, intensity 8.40 tCO2/t, gap 2.4 Mt, invest cost Rs 264 Cr, CBAM Rs 43.7 Cr/yr, strategy INVEST. FY26 proj 26.5 Mt.
- Vedanta Aluminium: 24.6 Mt CO2, intensity 9.10 tCO2/t (highest in model), gap 2.1 Mt, invest cost Rs 231 Cr, strategy INVEST. FY26 proj 22.8 Mt.
- NALCO: 11.2 Mt CO2, intensity 8.95 tCO2/t, gap 0.4 Mt, invest cost Rs 44 Cr, strategy COMPARE. PSU — needs govt approval for capex. FY26 proj 10.6 Mt.

Chloro-Alkali:
- DCW Limited: 0.82 Mt CO2, gap 0.07 Mt, invest cost Rs 3.5 Cr, strategy BUY. Smallest deficit in model.
- GHCL Limited: 0.95 Mt CO2, gap 0.07 Mt, invest cost Rs 3.5 Cr, strategy BUY.
- Grasim Industries: 3.80 Mt CO2, gap 0.30 Mt, invest cost Rs 15 Cr, strategy COMPARE. Aditya Birla Group.

GLOBAL BENCHMARKS (for comparison only — not subject to Indian PAT):
- ArcelorMittal (Luxembourg): 151.4 Mt CO2, intensity 1.89 tCO2/tcs — global steel benchmark. XCarb DRI + green hydrogen. Net Zero 2050. EU ETS participant.
- BASF SE (Germany): 20.2 Mt CO2 — petrochemical benchmark. EU ETS participant. Net Zero 2050 with 2030 milestone.
- Rio Tinto (Australia): 32.5 Mt CO2, intensity 7.80 tCO2/t aluminium — global aluminium benchmark. 100% renewable smelting target. Net Zero 2050.
- Olin Corporation (USA): 2.92 Mt CO2 — chloro-alkali benchmark. Membrane cell technology standard.

KEY REGULATIONS:
- PAT Scheme: BEE tracks Specific Energy Consumption. ESCerts traded on IEX. Cycle VII 2022-2025. Only 51% compliance in Cycle II.
- ESCert prices: FY22 Rs 400, FY23 Rs 800, FY24 Rs 1000, FY25 Rs 1500 (CCTS launch), FY26 Rs 2500, FY30 Rs 6000.
- CBAM: EU Regulation 2023/956. Full enforcement January 2026. EU ETS price approx 62 euros/tCO2 = approx Rs 5580/tCO2.
- CCTS: India new carbon market under EC Amendment Act 2022. ICM launching FY24-25.
- Penalty: Rs 10 lakh first offence plus Rs 10000/day under Energy Conservation Act 2001.
- SEBI BRSR: Mandatory Scope 1/2/3 for top 1000 listed companies.

FINANCE CONCEPTS:
- NPV: Initial investment is capex for emission reduction. Annual cashflow is credit purchase cost avoided. Discount rate 10%. NPV improves as credit prices rise toward FY30.
- IRR: Discount rate at which NPV equals zero. Higher is better. Improves as CCTS prices rise.
- WACC: Typically 10-14% for Indian industry. Green bonds reduce cost of debt.
- Payback: Capex divided by annual credit cost savings. Shortens dramatically as prices rise.
- Green bonds: JSW Steel issued 400 million USD in 2021. ArcelorMittal issues for XCarb programme.
- Break-even price: Investment cost times 10000000 divided by ESCert deficit times 1000000.

CREDIT PRICE SCENARIOS:
- FY23 base: Rs 800/cert. FY24: Rs 1000. FY25: Rs 1500 (CCTS launch). FY26: Rs 2500. FY30: Rs 6000.
- EU ETS: FY23 Rs 6200 equiv, FY25 Rs 7200, FY26 Rs 8100, FY30 Rs 13500.

Keep answers concise, professional, and relevant to carbon finance and this MBA project. Use Indian Rupee context. For company comparisons, always mention the relevant global benchmark. Answer confidently about all 16 companies and FY24-26 projections.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.includes("your-key")) {
      const fallback = getSmartFallback(messages[messages.length - 1]?.content || "");
      return NextResponse.json({ reply: fallback });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("API error:", error?.message || error);
    const fallback = getSmartFallback(
      JSON.parse(await request.clone().text().catch(() => "{}"))?.messages?.slice(-1)[0]?.content || ""
    );
    return NextResponse.json({ reply: fallback });
  }
}

function getSmartFallback(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("arcelormittal") || q.includes("arcelor"))
    return "ArcelorMittal — global steel benchmark (Luxembourg). Intensity: 1.89 tCO2/tcs — 24% better than Tata Steel. FY23: 151.4 Mt CO2. XCarb green steel programme — DRI + green hydrogen. Net Zero 2050. EU ETS participant. Indian steel must reach this intensity to compete in EU markets post-CBAM January 2026.";
  if (q.includes("basf"))
    return "BASF SE — global petrochemical benchmark (Germany). FY23: 20.2 Mt CO2. EU ETS participant — pays approx Rs 5,580/tCO2 directly. Net Zero 2050 with 25% reduction by 2030. Electric cracking + green hydrogen investment. Indian petrochemical companies face similar pressure via CBAM from January 2026.";
  if (q.includes("rio tinto") || (q.includes("rio") && q.includes("tinto")))
    return "Rio Tinto — global aluminium benchmark (Australia). Intensity: 7.80 tCO2/t — better than all Indian aluminium companies (Hindalco 8.40, NALCO 8.95, Vedanta 9.10). FY23: 32.5 Mt. Target: 100% renewable smelting power. Net Zero 2050. Shows Indian aluminium the path to follow.";
  if (q.includes("olin"))
    return "Olin Corporation — global chloro-alkali benchmark (USA). FY23: 2.92 Mt CO2. Advanced membrane cell electrolysis technology — the efficiency standard Indian companies should adopt. 2030 interim reduction target published.";
  if (q.includes("reliance"))
    return "Reliance Industries — India's largest private company (refining, petrochemicals, Jio, retail). FY23: 52.8 Mt CO2. Largest deficit in model — 4.8 Mt gap. CBAM exposure: Rs 81 Cr/yr from 2026. Strategy: INVEST. Net Zero 2035. FY26 projection: 49.5 Mt. Invest cost Rs 336 Cr.";
  if (q.includes("tata steel"))
    return "Tata Steel — Iron & Steel | FY23: 49.6 Mt | FY26(P): 46.8 Mt | Gap: 5.6 Mt | Strategy: BUY | Invest: Rs 198 Cr | CBAM: Rs 7.75 Cr/yr | Intensity: 2.48 tCO2/tcs vs ArcelorMittal benchmark 1.89.";
  if (q.includes("jsw"))
    return "JSW Steel — Iron & Steel | FY23: 50.8 Mt | FY26(P): 48.0 Mt | Strategy: HYBRID | Project SEED underway | Best Indian steel intensity at 2.31 tCO2/tcs | Invest: Rs 207 Cr | CBAM: Rs 9.98 Cr/yr.";
  if (q.includes("hindalco"))
    return "Hindalco — Aluminium | FY23: 28.4 Mt | FY26(P): 26.5 Mt | Intensity: 8.40 vs Rio Tinto benchmark 7.80 | Strategy: INVEST | CBAM: Rs 43.7 Cr/yr — exceeds annual buy cost | Invest: Rs 264 Cr.";
  if (q.includes("npv") || q.includes("net present value"))
    return "NPV = Sum of [Cash Flow / (1+r)^t] - Initial Investment. For this project: Capex = emission reduction investment. Annual cash flow = credit cost avoided (rises from Rs 22 Cr/yr at FY23 price to Rs 55 Cr/yr at FY26 price for Tata Steel). Discount rate = 10%. NPV improves dramatically as CCTS prices rise from FY23 to FY30.";
  if (q.includes("irr"))
    return "IRR = discount rate at which NPV = 0. Higher IRR = better investment. As CCTS prices rise from Rs 800 (FY23) to Rs 6000 (FY30), IRR of emission reduction investment improves significantly — making early investment now strategically smart.";
  if (q.includes("wacc") || q.includes("cost of capital"))
    return "WACC = (Equity x Cost of Equity) + (Debt x Cost of Debt x (1-Tax Rate)). For Indian industry typically 10-14%. Green bonds reduce cost of debt — JSW Steel issued $400M in 2021 at lower rate than conventional bonds. Lower WACC makes emission reduction investment more viable.";
  if (q.includes("cbam"))
    return "CBAM = EU Carbon Border Adjustment Mechanism. Full enforcement January 2026 at EU ETS price approx Rs 5,580/tCO2. Biggest Indian exposures: Reliance Rs 81 Cr/yr, Hindalco Rs 43.7 Cr/yr, IOC Rs 10.53 Cr/yr. Companies with higher intensity than global benchmark (ArcelorMittal 1.89, Rio Tinto 7.80) pay more CBAM.";
  if (q.includes("pat"))
    return "PAT (Perform Achieve Trade) — BEE scheme tracking Specific Energy Consumption. ESCerts traded on IEX. Cycle VII 2022-2025. Only 51% compliance in Cycle II. CCTS launching FY24-25 will replace PAT with stronger enforcement and higher prices rising to Rs 6000/cert by FY30.";
  if (q.includes("ccts"))
    return "CCTS = Carbon Credit Trading Scheme under EC Amendment Act 2022. ICM (Indian Carbon Market) launching FY24-25. Price trajectory: FY24 Rs 1000, FY25 Rs 1500, FY26 Rs 2500, FY30 Rs 6000. Will replace weak ESCert market — companies that delay investment now will face much higher compliance costs by FY26-30.";
  if (q.includes("hello") || q.includes("hi") || q.includes("help"))
    return "Hello! I can answer questions about all 16 companies — 12 Indian DCs and 4 global benchmarks (ArcelorMittal, BASF, Rio Tinto, Olin). Ask about emissions, FY24-26 projections, CBAM 2026 impact, global benchmark comparison, NPV, IRR, WACC, or CCTS price trajectory.";
  return "Ask about any of the 16 companies, FY24-26 projections, CCTS price trajectory, CBAM 2026 impact, global benchmark comparison, or MBA finance concepts like NPV, IRR, and WACC. The platform covers Iron & Steel, Petrochemicals, Aluminium, and Chloro-Alkali sectors with Indian and global data.";
}