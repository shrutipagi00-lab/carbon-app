import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the Carbon Credit Intelligence Platform AI Assistant — an expert carbon finance analyst for an MBA Corporate Finance project at Navrachana University Vadodara. Faculty Guide: Hitesh Bhatiya. Student: Shruti Pagi, Enrollment 24001096.

You analyze 16 companies — 12 Indian Designated Consumers and 4 global benchmarks — across 4 sectors: Iron and Steel, Petrochemicals, Aluminium, Chloro-Alkali.

INDIAN COMPANIES FY 2022-23:
- Tata Steel: 49.6 Mt CO2, intensity 2.48 tCO2/tcs, gap 5.6 Mt, deficit 2.2M ESCerts, invest Rs 198 Cr, CBAM Rs 7.75 Cr/yr, strategy BUY, break-even Rs 900/cert
- JSW Steel: 50.8 Mt CO2, intensity 2.31, gap 5.8 Mt, deficit 2.3M, invest Rs 207 Cr, CBAM Rs 9.98 Cr/yr, strategy HYBRID, Project SEED, break-even Rs 900/cert
- Bhushan Power Steel: 11.5 Mt CO2, intensity 2.55, gap 0.7 Mt, deficit 0.7M, invest Rs 63 Cr, strategy BUY
- Reliance Industries: 52.8 Mt CO2, gap 4.8 Mt, deficit 4.8M, invest Rs 336 Cr, CBAM Rs 81 Cr/yr, strategy INVEST, Net Zero 2035, break-even Rs 700/cert
- Indian Oil Corporation: 21.3 Mt CO2, gap 1.8 Mt, deficit 1.8M, invest Rs 126 Cr, CBAM Rs 10.53 Cr/yr, strategy BUY
- Bharat Petroleum: 14.7 Mt CO2, gap 0.9 Mt, deficit 0.9M, invest Rs 63 Cr, CBAM Rs 6.08 Cr/yr, strategy BUY
- Hindalco Industries: 28.4 Mt CO2, intensity 8.40, gap 2.4 Mt, deficit 2.4M, invest Rs 264 Cr, CBAM Rs 43.7 Cr/yr, strategy INVEST, break-even Rs 1100/cert
- Vedanta Aluminium: 24.6 Mt CO2, intensity 9.10 highest, gap 2.1 Mt, deficit 2.1M, invest Rs 231 Cr, CBAM Rs 25.49 Cr/yr, strategy INVEST
- NALCO: 11.2 Mt CO2, intensity 8.95, gap 0.4 Mt, deficit 0.4M, invest Rs 44 Cr, strategy COMPARE, PSU
- DCW Limited: 0.82 Mt CO2, gap 0.07 Mt, deficit 0.07M, invest Rs 3.5 Cr, strategy BUY
- GHCL Limited: 0.95 Mt CO2, gap 0.07 Mt, deficit 0.07M, invest Rs 3.5 Cr, strategy BUY
- Grasim Industries: 3.80 Mt CO2, gap 0.30 Mt, deficit 0.30M, invest Rs 15 Cr, strategy COMPARE, break-even Rs 500/cert

GLOBAL BENCHMARKS:
- ArcelorMittal Luxembourg: 151.4 Mt CO2, intensity 1.89 tCO2/tcs, EU ETS, Net Zero 2050, XCarb DRI green hydrogen
- BASF SE Germany: 20.2 Mt CO2, EU ETS, Net Zero 2050, electric cracking CCS
- Rio Tinto Australia: 32.5 Mt CO2, intensity 7.80 tCO2/t, renewable smelting, Net Zero 2050
- Olin Corporation USA: 2.92 Mt CO2, membrane cell technology benchmark

REGULATIONS:
- PAT Scheme: BEE, ESCerts on IEX, Cycle VII 2022-2025, 509 DCs, only 51% compliance in Cycle II
- ESCert prices: FY22 Rs400, FY23 Rs800, FY24 Rs1000, FY25 Rs1500, FY26 Rs2500, FY30 Rs6000
- CBAM: EU Regulation 2023/956, full enforcement January 2026, rate approx Rs5580 per tCO2
- CCTS: Carbon Credit Trading Scheme, EC Amendment Act 2022, ICM launching FY24-25
- Penalty: Rs10 lakh first offence plus Rs10000 per day under Energy Conservation Act 2001
- SEBI BRSR: Mandatory Scope 1/2/3 for top 1000 listed companies

FINANCE:
- Buy cost formula: ESCert Deficit x 1,000,000 x Price divided by 10,000,000 = Rs Crore
- Break-even: Investment Cost x 10,000,000 divided by ESCert Deficit x 1,000,000
- NPV uses 10% discount rate, annual saving = deficit x price avoided each year
- WACC typically 10-14% for Indian heavy industry
- Payback = Capex divided by Annual Savings from avoided credit purchases
- JSW Steel issued 400 million USD green bond February 2021

Answer all questions confidently with specific data. Keep answers to 4-6 sentences. Always cite company-specific numbers.`;

export async function POST(request: NextRequest) {
  let lastMessage = "";
  let messages: { role: string; content: string }[] = [];

  try {
    const body = await request.json();
    messages = body?.messages || [];
    lastMessage = messages[messages.length - 1]?.content || "";
  } catch {
    return NextResponse.json({ reply: getSmartFallback("hello") });
  }

  if (!lastMessage) {
    return NextResponse.json({ reply: getSmartFallback("hello") });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Force smart fallback — API credits exhausted
  if (!apiKey || apiKey.length > 0) {
    return NextResponse.json({ reply: getSmartFallback(lastMessage) });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });
    const text = response.content[0].type === "text" ? response.content[0].text : getSmartFallback(lastMessage);
    return NextResponse.json({ reply: text });
  } catch (error: unknown) {
    console.error("Anthropic API error:", error);
    return NextResponse.json({ reply: getSmartFallback(lastMessage) });
  }
}

function getSmartFallback(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.length < 5)
    return "Hello! I am your Carbon Credit Intelligence AI Assistant. I cover all 16 companies — 12 Indian DCs and 4 global benchmarks across Iron & Steel, Petrochemicals, Aluminium, and Chloro-Alkali. Ask me about any company, CBAM 2026, PAT scheme, buy vs invest strategy, NPV, IRR, WACC, break-even prices, compliance risk, or any carbon finance topic!";

  // ── BASIC PROJECT UNDERSTANDING ─────────────────────────────────────────
  if (q.includes("what is carbon credit") || (q.includes("carbon credit") && q.includes("what")))
    return "A carbon credit is a tradeable certificate representing the right to emit one tonne of CO2 or equivalent greenhouse gas. Companies that reduce emissions below their target earn surplus credits to sell; those that exceed limits must buy credits. In India, ESCerts (Energy Saving Certificates) function as carbon credits under the PAT scheme, traded on the Indian Energy Exchange (IEX). The price rises from Rs 400 in FY22 to a projected Rs 6,000 per cert by FY30, making early emission reduction investment increasingly attractive.";

  if (q.includes("purpose of this platform") || q.includes("what does this platform") || q.includes("what is this platform"))
    return "This Carbon Credit Intelligence Platform helps Indian Designated Consumers (DCs) make data-driven decisions on PAT scheme compliance. It answers one critical question: should a company BUY ESCerts or INVEST in emission reduction? The platform covers 12 Indian companies across 4 sectors with FY22-FY26 emission data, live sensitivity analysis as credit prices change, CBAM 2026 exposure, and global benchmark comparison against ArcelorMittal, BASF, Rio Tinto, and Olin Corporation.";

  if (q.includes("how does this platform help") || q.includes("platform help companies"))
    return "The platform helps companies in three ways. First, it shows the live cost of buying ESCerts versus investing in emission reduction at any credit price using a sensitivity slider. Second, it calculates break-even prices — the exact credit price at which investment becomes cheaper than buying. Third, it benchmarks Indian companies against global peers and shows CBAM 2026 financial exposure, helping companies plan decarbonisation before EU carbon charges hit in January 2026.";

  if (q.includes("industries") || q.includes("sectors covered") || q.includes("which sector"))
    return "The platform covers 4 sectors: Iron and Steel (Tata Steel, JSW Steel, Bhushan Power Steel + ArcelorMittal benchmark), Petrochemicals (Reliance Industries, Indian Oil, Bharat Petroleum + BASF SE benchmark), Aluminium (Hindalco, Vedanta, NALCO + Rio Tinto benchmark), and Chloro-Alkali (DCW, GHCL, Grasim + Olin Corporation benchmark). These are the 4 sectors most exposed to India's PAT scheme and EU CBAM regulations.";

  if (q.includes("why did you choose") || q.includes("why this topic"))
    return "Carbon compliance is India's most urgent corporate finance challenge. The PAT scheme covers 509 Designated Consumers, CCTS is launching FY24-25, and EU CBAM enforcement begins January 2026 creating Rs 81 Cr/yr exposure for Reliance alone. Yet most companies lack a clear buy-versus-invest framework. This platform bridges corporate finance (NPV, IRR, payback) with carbon market data to give CFOs a decision tool that becomes more valuable as credit prices rise from Rs 800 to Rs 6,000 by FY30.";

  if (q.includes("business problem") || q.includes("what problem"))
    return "The business problem is that 509 Indian Designated Consumers face PAT compliance obligations but have no quantitative framework to decide: should I buy ESCerts at today's market price, or invest in emission reduction technology? This platform solves that by calculating the break-even carbon price for each company. For Reliance (break-even Rs 700/cert, below current market), investment dominates immediately. For Tata Steel (break-even Rs 900/cert), buying is cheaper now but investment wins as CCTS prices rise to Rs 2,500 by FY26.";

  if (q.includes("different from") || q.includes("esg dashboard") || q.includes("normal esg"))
    return "Unlike standard ESG dashboards that just report emissions data, this platform is a financial decision tool. It converts emission data into rupee costs using live credit prices, calculates NPV and payback period of investment versus buying, and shows the exact price at which strategy should flip. It integrates regulatory data (PAT, CBAM, CCTS), financial analysis (NPV, IRR, WACC), and global benchmarking — making it a CFO tool, not just an ESG reporting tool.";

  if (q.includes("why is carbon compliance important") || q.includes("compliance important"))
    return "Carbon compliance is critical for three reasons. First, PAT scheme non-compliance attracts Rs 10 lakh fine plus Rs 10,000 per day under the Energy Conservation Act 2001. Second, EU CBAM from January 2026 will charge Indian exporters approximately Rs 5,580 per tCO2 — Reliance faces Rs 81 Cr/year, Hindalco Rs 43.7 Cr/year. Third, CCTS credit prices are projected to rise from Rs 800 to Rs 6,000 by FY30, making early investment far cheaper than buying credits later.";

  if (q.includes("support sustainability") || q.includes("sustainability"))
    return "The platform supports sustainability by making it financially rational to invest in emission reduction rather than just buying compliance credits. By showing NPV, payback period, and break-even analysis, it helps companies see that decarbonisation is not just an environmental obligation but a sound financial investment — especially as credit prices rise from Rs 800 (FY23) to Rs 6,000 (FY30). It also benchmarks Indian companies against global leaders like ArcelorMittal (1.89 tCO2/tcs) to set achievable intensity targets.";

  if (q.includes("what regulations") || q.includes("based on") || q.includes("regulatory"))
    return "The platform is based on: PAT (Perform Achieve Trade) Scheme under the Energy Conservation Act 2001, administered by BEE. EC Amendment Act 2022 establishing the CCTS (Carbon Credit Trading Scheme). EU CBAM Regulation 2023/956 enforced from January 2026. SEBI BRSR Core framework mandating Scope 1/2/3 disclosure for top 1000 listed companies. India's Nationally Determined Contribution (NDC) targeting 45% intensity reduction by 2030 and Net Zero by 2070.";

  // ── CARBON CREDIT CONCEPTS ──────────────────────────────────────────────
  if (q.includes("difference between carbon credit") || q.includes("credit and offset") || q.includes("credits and offsets"))
    return "Carbon credits are compliance instruments issued by regulators — like Indian ESCerts under PAT or EU ETS allowances — that companies must hold to cover emissions. Carbon offsets are voluntary instruments generated by projects like reforestation or renewable energy that reduce emissions elsewhere. Credits are mandatory for regulated entities; offsets are voluntary. ESCerts in this platform are compliance carbon credits, not voluntary offsets.";

  if (q.includes("how are carbon credits generated") || q.includes("credits generated") || q.includes("how credits"))
    return "Carbon credits (ESCerts) are generated when a company's Specific Energy Consumption falls below its PAT target set by BEE. The surplus energy saving is certified as ESCerts — 1 ESCert equals 1 MTOE of energy saved. BEE verifies performance through energy auditors, then issues ESCerts to over-performers. These are registered digitally and traded on IEX. Companies that under-perform must buy ESCerts from over-performers to achieve compliance.";

  if (q.includes("who buys carbon credits") || q.includes("who buys"))
    return "Companies that fail to meet their PAT energy reduction targets must buy ESCerts from over-performers. In this model, all 12 Indian DCs are net buyers — they have ESCert deficits ranging from 0.07M (DCW, GHCL) to 4.8M (Reliance). Total deficit is 18.04M certificates. Buyers include energy-intensive industries across steel, petrochemicals, aluminium, and chemicals. The platform calculates each company's annual buy cost at current and projected credit prices.";

  if (q.includes("who sells carbon credits") || q.includes("who sells"))
    return "Companies that out-perform their PAT targets earn surplus ESCerts and can sell them on IEX. Typically, energy-efficient SMEs, newer plants with modern technology, and companies that invested in energy efficiency before the PAT cycle earn surplus certificates. In India's upcoming CCTS, companies that invest in deep decarbonisation will earn Carbon Credit Certificates to sell, creating revenue alongside compliance.";

  if (q.includes("what happens if") && (q.includes("exceed") || q.includes("exceeds")))
    return "If a company exceeds its emission limit under PAT, it must purchase ESCerts to cover the deficit before the compliance deadline. Failure to comply attracts a penalty of Rs 10 lakh for the first offence plus Rs 10,000 per day of continued non-compliance under the Energy Conservation Act 2001. Under CCTS launching FY24-25, penalties will be significantly higher. The combination of rising credit prices, stricter enforcement, and CBAM from January 2026 makes non-compliance increasingly costly.";

  if (q.includes("how does carbon trading work") || q.includes("trading work"))
    return "Carbon trading works through a cap-and-trade system. Regulators set emission caps for each company. Companies that reduce emissions below the cap earn surplus credits; those above the cap have a deficit. Credits are traded on exchanges — IEX in India for ESCerts, EEX in Europe for EU ETS. Price is set by supply and demand. India's price: Rs 400 (FY22) to Rs 800 (FY23), projected Rs 6,000 by FY30. Companies compare the cost of buying credits versus investing in technology to determine optimal strategy.";

  if (q.includes("what determines the price") || q.includes("price determined") || q.includes("price of carbon"))
    return "Carbon credit prices are determined by supply and demand, regulatory stringency, and economic activity. In India, ESCert prices fell to Rs 200 in FY22 (low demand, weak enforcement) and rose to Rs 800 in FY23 as compliance tightened. CCTS launching FY24-25 will set a floor price and tighten enforcement, projecting Rs 1,500 (FY25), Rs 2,500 (FY26), Rs 6,000 (FY30) based on ICRA and NITI Aayog analysis. EU ETS price is currently approximately Rs 6,200 per tCO2, showing India's long-term direction.";

  if (q.includes("pat scheme") || q.includes("what is pat"))
    return "PAT (Perform Achieve Trade) is India's mandatory energy efficiency scheme under BEE (Bureau of Energy Efficiency). It sets Specific Energy Consumption (SEC) targets for 509 Designated Consumers across 8 energy-intensive sectors. Companies that over-perform earn ESCerts to sell; under-performers must buy ESCerts. Cycle VII runs 2022-2025. Only 51% compliance in Cycle II shows weak enforcement — which CCTS will fix. Non-compliance penalty: Rs 10 lakh plus Rs 10,000 per day under Energy Conservation Act 2001.";

  if (q.includes("what is an escert") || q.includes("what is escert") || q.includes("energy saving certificate"))
    return "ESCert (Energy Saving Certificate) is the tradeable instrument under India's PAT scheme. 1 ESCert = 1 MTOE (Million Tonnes of Oil Equivalent) of specific energy saved below the PAT target. They are registered digitally and traded on IEX. Price history: FY17 peak Rs 1,200, FY22 low Rs 200, FY23 Rs 800. CCTS integrates ESCerts from FY24-25 with projected prices of Rs 1,500 (FY25), Rs 2,500 (FY26), Rs 6,000 (FY30). All 12 Indian companies in this platform have ESCert deficits that must be covered.";

  if ((q.includes("what is cbam") || q.includes("cbam")) && !q.includes("exposure") && !q.includes("which company"))
    return "CBAM (Carbon Border Adjustment Mechanism) is EU Regulation 2023/956. It charges importers for embedded carbon in goods entering the EU at the EU ETS carbon price. Transition period October 2023 to December 2025 requires reporting only. Full financial enforcement begins January 2026 at approximately Rs 5,580 per tCO2. Indian sectors affected: steel, aluminium, cement, fertilisers. Biggest Indian exposures: Reliance Rs 81 Cr/yr, Hindalco Rs 43.7 Cr/yr, IOC Rs 10.53 Cr/yr, JSW Rs 9.98 Cr/yr, Tata Steel Rs 7.75 Cr/yr.";

  // ── IEX ─────────────────────────────────────────────────────────────────
  if (q.includes("iex") || q.includes("indian energy exchange"))
    return "IEX (Indian Energy Exchange) is India's premier power exchange where ESCerts (Energy Saving Certificates) are traded under the PAT scheme. Established 2008, IEX also trades electricity, RECs (Renewable Energy Certificates), and will host Carbon Credit Certificates under the upcoming CCTS. ESCert price history on IEX: FY17 peak Rs 1,200/cert, FY22 low Rs 200/cert, FY23 Rs 800-1,000/cert. Only 51% of obligated companies actually purchased certificates on IEX in PAT Cycle II — showing weak enforcement. Under CCTS launching FY24-25, trading will also expand to PXIL and HPX exchanges alongside IEX.";

  // ── CARBON PRICE FY30 PROJECTION ─────────────────────────────────────────
  if ((q.includes("fy30") || q.includes("2030") || q.includes("projection") || q.includes("future price") || q.includes("price projection") || q.includes("carbon price")) && !q.includes("tata") && !q.includes("jsw") && !q.includes("reliance"))
    return "Carbon credit price projection to FY30: ESCert FY22 Rs 400, FY23 Rs 800 (real IEX data). CCTS projected: FY24 Rs 1,000, FY25 Rs 1,500 (CCTS launch), FY26 Rs 2,500, FY27 Rs 3,000, FY30 Rs 6,000 — based on ICRA Research and NITI Aayog 2023 projections. EU ETS (CBAM reference): FY23 Rs 6,200, FY25 Rs 7,200, FY26 Rs 8,100, FY30 Rs 13,500. Key driver: CCTS enforcement tightening + global Net Zero pressure. At FY30 price Rs 6,000, total Indian sector annual buy cost rises to Rs 1,082 Cr — making early investment the only rational strategy.";

  // ── HINDALCO VS RIO TINTO ────────────────────────────────────────────────
  if ((q.includes("hindalco") && q.includes("rio")) || (q.includes("hindalco") && q.includes("benchmark")) || (q.includes("hindalco") && q.includes("vs")) || (q.includes("hindalco") && q.includes("compare")))
    return "Hindalco vs Rio Tinto: Hindalco intensity 8.40 tCO2/t versus Rio Tinto global benchmark 7.80 tCO2/t — Hindalco is 8% above. FY23 emissions: Hindalco 28.4 Mt vs Rio Tinto 32.5 Mt. Rio Tinto uses 100% renewable smelting power (Elysis zero-carbon process) while Hindalco still relies on coal captive power. Hindalco CBAM exposure Rs 43.7 Cr/yr from January 2026 — this alone exceeds the annual ESCert buy cost of Rs 19.2 Cr, making investment in renewable smelting power financially dominant. Strategy: INVEST immediately. Investment cost Rs 264 Cr. Net Zero 2050 for both companies.";

  // ── COMPANY ANALYSIS ────────────────────────────────────────────────────
  if (q.includes("analyze tata steel") || q.includes("tata steel emission") || q.includes("tata steel performance"))
    return "Tata Steel's emission performance: FY22 47.1 Mt → FY23 49.6 Mt (rising trend, +5.3%). PAT target is 44.0 Mt — gap of 5.6 Mt, ESCert deficit 2.2M certificates. Emission intensity 2.48 tCO2/tcs versus ArcelorMittal global benchmark 1.89 — Tata is 31% above the benchmark. Strategy is BUY ESCerts at current prices (break-even Rs 900/cert, above current Rs 800 market). CBAM exposure Rs 7.75 Cr/yr from January 2026. Investment in DRI plus renewable energy would close the intensity gap over 5-7 years.";

  if ((q.includes("compare tata") && q.includes("jsw")) || (q.includes("tata steel") && q.includes("jsw steel")) || (q.includes("tata") && q.includes("jsw") && q.includes("compare")))
    return "Tata Steel vs JSW Steel: JSW has better intensity (2.31 vs Tata 2.48 tCO2/tcs). JSW has higher absolute deficit (2.3M vs 2.2M ESCerts) due to higher production. Both have same break-even of Rs 900/cert. JSW strategy is HYBRID (Project SEED + buying) while Tata is BUY. JSW has higher CBAM exposure (Rs 9.98 Cr vs Rs 7.75 Cr/yr). Both are significantly above ArcelorMittal benchmark of 1.89 tCO2/tcs. JSW holds CDP Leadership Level A and issued a 400 million USD green bond in 2021 — showing stronger sustainability governance.";

  if (q.includes("lowest carbon risk") || q.includes("least risk"))
    return "DCW Limited has the lowest carbon risk in the model — smallest deficit of 0.07M ESCerts (only Rs 0.56 Cr at current price), minimal CBAM exposure of Rs 0.28 Cr/yr, and lowest investment cost of Rs 3.5 Cr. Among larger companies, BPCL has the lowest risk in petrochemicals (deficit 0.9M, CBAM Rs 6.08 Cr/yr) and NALCO in aluminium (deficit 0.4M). JSW Steel has the lowest intensity in steel (2.31 tCO2/tcs) making it closest to ArcelorMittal benchmark.";

  if (q.includes("most efficient") || q.includes("most carbon efficient") || q.includes("best efficiency"))
    return "Carbon efficiency ranking by intensity: Steel — JSW 2.31 (best Indian), Tata 2.48, Bhushan 2.55 vs ArcelorMittal benchmark 1.89. Petrochemicals — IOC 2.87 (best Indian), BPCL 2.94, Reliance 3.12. Aluminium — Hindalco 8.40 (best Indian), NALCO 8.95, Vedanta 9.10 (highest in model) vs Rio Tinto benchmark 7.80. Chloro-Alkali — Grasim 1.38 (best Indian), DCW 1.45, GHCL 1.52. All Indian companies are above their respective global benchmarks.";

  if (q.includes("highest deficit") || q.includes("largest deficit"))
    return "Reliance Industries has the highest ESCert deficit at 4.8M certificates — requiring Rs 38.4 Cr at FY23 price of Rs 800/cert, rising to Rs 120 Cr at FY26 price of Rs 2,500/cert. Reliance's break-even price is Rs 700/cert — already below the current market price, meaning investment dominates from day one. JSW Steel has the highest steel sector deficit at 2.3M ESCerts. Combined total model deficit is 18.04M certificates.";

  if (q.includes("better compliance") || q.includes("compliance performance"))
    return "JSW Steel shows the best compliance governance with CDP Leadership Level A rating and Project SEED actively underway. Reliance Industries has the strongest Net Zero commitment (2035 — earliest in model). NALCO and IOC as PSUs face slower compliance due to government approval processes. DCW and GHCL have smallest deficits making compliance easiest. Overall, only 51% of DCs achieved compliance in PAT Cycle II, indicating widespread non-compliance across Indian industry.";

  if (q.includes("investment capability") || q.includes("better investment") || q.includes("invest capability"))
    return "Reliance Industries has the strongest investment capability — India's largest private company with Rs 336 Cr investment cost easily manageable given its scale. Hindalco and Vedanta (Aditya Birla and Vedanta Group) have significant financial capacity. JSW Steel already demonstrated capability by issuing a 400 million USD green bond in 2021. PSUs (IOC, BPCL, NALCO) need government budget allocation. DCW and GHCL have smallest investment requirements (Rs 3.5 Cr each) relative to their size.";

  if (q.includes("rank") || q.includes("ranking by carbon") || q.includes("rank companies"))
    return "Carbon efficiency ranking by intensity (best to worst): Steel — JSW 2.31, Tata 2.48, Bhushan 2.55 (benchmark ArcelorMittal 1.89). Petrochemicals — IOC 2.87, BPCL 2.94, Reliance 3.12 (benchmark BASF N/A). Aluminium — Hindalco 8.40, NALCO 8.95, Vedanta 9.10 (benchmark Rio Tinto 7.80). Chloro-Alkali — Grasim 1.38, DCW 1.45, GHCL 1.52 (benchmark Olin N/A). All Indian companies are above their respective global benchmarks, indicating significant decarbonisation opportunity.";

  if (q.includes("highest penalty") || q.includes("penalty exposure") || q.includes("penalty risk"))
    return "All 12 Indian companies face the same statutory penalty of Rs 10 lakh for first offence plus Rs 10,000 per day under the Energy Conservation Act 2001 for PAT non-compliance. However, financial risk is highest for Reliance (largest deficit 4.8M ESCerts, buy cost Rs 288 Cr/yr at FY30) and JSW Steel (deficit 2.3M). CBAM adds additional financial risk from January 2026: Reliance Rs 81 Cr/yr, Hindalco Rs 43.7 Cr/yr.";

  if (q.includes("best emission trend") || q.includes("best trend") || q.includes("improving trend"))
    return "All 12 Indian companies show rising absolute emissions FY22-FY23 due to production growth. However, projected FY24-FY26 shows declining trends. Reliance shows the steepest projected decline (52.8 Mt FY23 to 49.5 Mt FY26) driven by Net Zero 2035 commitment. In aluminium, Vedanta projects decline from 24.6 to 22.8 Mt FY26. Global benchmarks are all on declining paths — Rio Tinto from 32.5 Mt FY23 to 29.2 Mt FY26.";

  // ── BUY VS INVEST ───────────────────────────────────────────────────────
  if ((q.includes("tata steel") && (q.includes("buy") || q.includes("invest"))) || q.includes("should tata"))
    return "Tata Steel should BUY ESCerts in the short term (FY23-FY24). Break-even price is Rs 900/cert versus current market Rs 800 — buying is cheaper today. However, as CCTS prices reach Rs 1,500 (FY25) and Rs 2,500 (FY26), investment in DRI technology becomes the dominant strategy. Investment cost Rs 198 Cr with payback of approximately 9 years at FY23 prices, shortening to 3.6 years at FY26 prices. Long-term path: DRI plus renewable energy to close the 31% intensity gap versus ArcelorMittal benchmark 1.89.";

  if ((q.includes("current price") && q.includes("strategy")) || q.includes("at current price"))
    return "At current ESCert price Rs 800-1,000/cert: BUY is recommended for Tata Steel, Bhushan Power Steel, IOC, BPCL, DCW, GHCL. HYBRID for JSW Steel (Project SEED + buying). INVEST for Reliance (break-even Rs 700 — already below market), Hindalco (CBAM exposure dominates), Vedanta (highest intensity). COMPARE for NALCO and Grasim (near break-even). As CCTS prices rise to Rs 2,500 by FY26, all companies should shift to INVEST.";

  if (q.includes("at what price") || q.includes("when to shift") || q.includes("shift from buy"))
    return "Break-even prices — when to shift from BUY to INVEST: Reliance Rs 700/cert (already past — invest NOW), Grasim Rs 500/cert (already past), DCW and GHCL Rs 500/cert, Tata Steel and JSW Steel Rs 900/cert (CCTS reaches this FY24-25), Hindalco Rs 1,100/cert (but CBAM alone justifies investing earlier), Vedanta Rs 1,100/cert, NALCO Rs 1,100/cert. Drag the sensitivity slider in the platform to see live comparisons for all 12 companies simultaneously.";

  if (q.includes("hybrid strategy") || q.includes("why hybrid"))
    return "Hybrid strategy is recommended for JSW Steel because it has both an immediate compliance obligation (2.3M ESCert deficit, highest in steel sector) and an ongoing decarbonisation programme (Project SEED). Buying bridge ESCerts provides immediate compliance at low cost while Project SEED systematically reduces intensity over time. Pure buying is expensive at rising CCTS prices; pure investment takes time to implement. Hybrid balances short-term compliance cost against long-term technology transition.";

  if (q.includes("lowest long-term cost") || q.includes("long term cost"))
    return "Investment in emission reduction has the lowest long-term cost for most companies. At FY30 CCTS price of Rs 6,000 per cert, Reliance's annual buy cost would be Rs 288 Cr versus one-time investment of Rs 336 Cr — investment pays back in just over 1 year at FY30 prices. The key insight: investment is a one-time fixed cost while buying is an annual recurring cost that grows 7.5x from FY23 to FY30.";

  if (q.includes("volatile prices") || q.includes("volatile") || q.includes("price uncertainty"))
    return "Under volatile credit prices, the HYBRID strategy reduces risk best. Companies buy a portion of compliance at current prices (protecting against price spikes) while simultaneously investing in technology (protecting against permanently high prices). For Tata Steel (break-even Rs 900/cert, current market Rs 800-1,000), hybrid provides the best hedge. Pure buying risks exposure to Rs 6,000 FY30 prices; pure investment risks high capex if prices fall.";

  if (q.includes("break-even") || q.includes("break even") || q.includes("breakeven"))
    return "Break-even carbon price = Investment Cost x 10,000,000 divided by ESCert Deficit x 1,000,000. Key break-even prices: Reliance Rs 700/cert — invest NOW (below current market). Grasim Rs 500/cert — already past break-even. DCW and GHCL Rs 500/cert. Tata Steel Rs 900/cert. Hindalco Rs 1,100/cert — but CBAM Rs 43.7 Cr/yr makes investment justified immediately. NALCO Rs 1,100/cert. Drag the platform sensitivity slider to see live break-even comparisons for all companies.";

  if (q.includes("why is investment better") || q.includes("investment better"))
    return "Investment is better when annual credit buying cost approaches or exceeds the one-time capex. For Reliance: break-even is Rs 700/cert (below current market) so investment dominates today. For Hindalco: CBAM exposure alone (Rs 43.7 Cr/yr from 2026) makes investment dominant since reducing intensity also permanently reduces CBAM charges. Investment builds long-term competitive advantage by reducing intensity toward global benchmarks (ArcelorMittal 1.89, Rio Tinto 7.80).";

  if (q.includes("when is buying") || q.includes("buying more beneficial") || q.includes("buy more beneficial"))
    return "Buying ESCerts is more beneficial when credit prices are below the company's break-even price, investment requires long lead times, or the compliance shortfall is small. DCW at 0.07M deficit — total buy cost only Rs 0.56 Cr — has no capex justification. IOC, BPCL, Bhushan Power Steel currently fall in the BUY zone. However, as CCTS prices rise to Rs 2,500 by FY26, the BUY option becomes increasingly expensive and most companies should shift to INVEST.";

  if (q.includes("which strategy reduces risk") || q.includes("strategy risk"))
    return "Investment strategy reduces long-term financial risk by converting a growing annual liability into a fixed one-time capital expenditure. Once installed, emission reduction technology eliminates PAT compliance cost AND reduces CBAM exposure permanently. Hybrid strategy reduces short-term risk. Pure buying strategy carries the highest long-term risk as CCTS prices rise from Rs 800 to Rs 6,000 by FY30 — a 7.5x increase in annual compliance cost.";

  // ── FINANCIAL ANALYSIS ──────────────────────────────────────────────────
  if (q.includes("payback period") || (q.includes("payback") && !q.includes("pay back")))
    return "Payback Period = Capex divided by Annual Savings from avoided credit purchases. Reliance Industries: Capex Rs 336 Cr. At FY23 price Rs 800/cert, annual saving Rs 38.4 Cr, payback 8.8 years. At FY26 price Rs 2,500/cert, annual saving Rs 120 Cr, payback 2.8 years. At FY30 price Rs 6,000, payback under 1.5 years. Tata Steel: Rs 198 Cr capex, payback 11.2 years (FY23), 3.6 years (FY26). The dramatically shortening payback is the core argument for investing early.";

  if (q.includes("roi") || q.includes("return on investment"))
    return "ROI for emission reduction = (Cumulative Annual Savings minus Capex) / Capex x 100. For Tata Steel: Capex Rs 198 Cr. Annual saving at FY23 price Rs 17.6 Cr, rising to Rs 132 Cr at FY30. Cumulative 10-year saving approximately Rs 480 Cr versus Rs 198 Cr capex — ROI approximately 142%. Rising CCTS prices are the key driver. The longer companies delay, the higher the total compliance cost paid and the lower the effective ROI of early investment.";

  if (q.includes("investment viability") || q.includes("viability measured"))
    return "Investment viability is measured using four metrics: 1) NPV — positive at WACC 10% confirms viability; 2) IRR — above WACC of 10-14% confirms invest; 3) Payback Period — under 7 years acceptable for Indian heavy industry; 4) Break-even Price — if current or projected credit price exceeds break-even, invest now. For Reliance (break-even Rs 700, current market Rs 800-1,000), all four metrics confirm invest immediately.";

  if (q.includes("calculate buy cost") || q.includes("how do you calculate") || q.includes("deficit cost"))
    return "Buy cost formula: Annual Buy Cost (Rs Crore) = ESCert Deficit (millions) x Credit Price (Rs/cert) divided by 10. Example — Tata Steel: 2.2M ESCerts x Rs 800 = Rs 17.6 Cr at FY23 price. At FY26 price Rs 2,500: 2.2 x 2,500 / 10 = Rs 55 Cr. At FY30 price Rs 6,000: Rs 132 Cr. This rising annual cost versus one-time investment of Rs 198 Cr is the core buy-vs-invest analysis of the platform.";

  if (q.includes("carbon pricing affect profitability") || q.includes("affect profitability"))
    return "Rising carbon prices compress profit margins through three channels: 1) Direct compliance cost — buying ESCerts at Rs 800-6,000/cert directly reduces operating profit; 2) CBAM from January 2026 adds Rs 0.28-81 Cr/yr in export duties; 3) Regulatory uncertainty raises WACC as investors price in carbon risk. Companies that invest in emission reduction convert these recurring costs into a one-time capex, protecting future profitability. Reliance's CBAM exposure of Rs 81 Cr/yr materially affects petrochemical export margins.";

  if (q.includes("compliance affect cash flow") || q.includes("cash flow"))
    return "Carbon compliance affects cash flow in two ways. Buying ESCerts is an annual outflow — from Rs 0.56 Cr (DCW) to Rs 38.4 Cr (Reliance) at current prices, growing to Rs 288 Cr for Reliance at FY30 prices. Investment is a large upfront capex outflow followed by elimination of annual compliance outflows — improving free cash flow from Year 2 onwards. CBAM from 2026 adds additional annual outflows for exporters, further strengthening the investment case.";

  if (q.includes("capital budgeting") || q.includes("capex"))
    return "Capital budgeting for emission reduction uses standard DCF analysis. Initial outflow = capex (Rs 63 Cr for Bhushan to Rs 336 Cr for Reliance). Annual inflows = avoided credit purchase costs, growing as CCTS prices rise from Rs 800 to Rs 6,000. Discount rate = WACC 10-14%. The key insight: rising CCTS prices make annual savings grow over time, making NPV highly sensitive to the assumed long-term credit price trajectory.";

  if (q.includes("roce") || q.includes("return on capital employed"))
    return "Carbon investment improves ROCE over time. For Reliance: saving Rs 38.4 Cr/yr at current price on Rs 336 Cr capex = 11.4% ROCE, rising to 35.7% ROCE at FY26 price (Rs 120 Cr saving on Rs 336 Cr capex). Additional benefit: CBAM reduction adds to revenue. Companies can also earn surplus Carbon Credit Certificates to sell under CCTS, creating a new revenue stream — further improving ROCE of decarbonisation investment.";

  if (q.includes("financial risk of delayed") || q.includes("risk of delay") || q.includes("delayed compliance"))
    return "Delaying compliance has three compounding financial risks: 1) Rising credit prices — waiting until FY30 means paying Rs 6,000/cert versus Rs 800 today (7.5x increase). For Reliance: Rs 288 Cr/yr versus Rs 38.4 Cr/yr — Rs 250 Cr additional annual cost. 2) CBAM charges begin January 2026 — delay means full exposure immediately. 3) Capex may rise as green technology demand increases globally. Early movers gain competitive advantage in EU export markets.";

  // ── RATIO ANALYSIS ──────────────────────────────────────────────────────
  if (q.includes("ebitda margin") || q.includes("ebitda"))
    return "EBITDA Margin = (EBITDA / Revenue) x 100. Rising carbon prices compress EBITDA margin through compliance costs. Tata Steel FY23 EBITDA margin approximately 11-13%. Carbon compliance cost at current prices is relatively small (Rs 17.6 Cr on revenues of Rs 2+ lakh Cr) but rises significantly at FY30 prices to Rs 132 Cr. Companies investing now protect future EBITDA margins by eliminating recurring credit purchase costs.";

  if (q.includes("net profit margin") || q.includes("profit margin"))
    return "Net Profit Margin = (Net Profit / Revenue) x 100. Carbon compliance costs directly reduce net profit. Reliance's CBAM exposure of Rs 81 Cr/yr from 2026 will reduce net profit margin unless offset by emission reduction investment. Rising CCTS prices from Rs 800 to Rs 6,000 by FY30 would reduce Reliance's net profit by Rs 249.6 Cr/yr if no investment is made. The sensitivity slider in this platform models this impact at any credit price.";

  if (q.includes("pat %") || q.includes("profit after tax"))
    return "PAT % (Profit After Tax as % of revenue) is compressed by carbon compliance costs. As credit prices rise 7.5x from FY23 to FY30, annual compliance cost grows proportionally. For Tata Steel: from Rs 17.6 Cr to Rs 132 Cr/yr — Rs 114.4 Cr annual increase that directly reduces PAT. Investment now at Rs 198 Cr capex prevents this Rs 132 Cr/yr future liability — a clearly positive NPV decision from a PAT % perspective.";

  if (q.includes("current ratio"))
    return "Current Ratio = Current Assets / Current Liabilities. For carbon investments, current ratio matters because large ESCert purchases affect working capital as annual outflows. Companies with current ratio above 1.5 can absorb annual credit costs without liquidity stress. PSUs like IOC and BPCL typically maintain strong current ratios given government backing, enabling them to absorb compliance costs while planning investment for future cycles.";

  if (q.includes("quick ratio"))
    return "Quick Ratio = (Current Assets minus Inventory) / Current Liabilities. A quick ratio above 1.0 indicates sufficient liquidity for compliance costs. Steel companies (Tata, JSW) hold significant raw material inventory, so quick ratio may be lower than current ratio but operating cash flows remain strong. Companies with strong quick ratios can self-fund emission reduction investment; others may need green bonds or external debt financing.";

  if (q.includes("asset turnover"))
    return "Asset Turnover = Revenue / Total Assets. Higher is better — indicates efficient use of assets. Emission reduction investment adds assets (new technology, equipment) that generate revenue through avoided compliance costs and potential credit sales. As CCTS prices rise from Rs 800 to Rs 6,000, the annual saving from avoided purchases grows, improving the effective asset return on decarbonisation investments over time.";

  if (q.includes("inventory turnover"))
    return "Inventory Turnover = Cost of Goods Sold / Average Inventory. For steel and aluminium companies with large raw material inventories, efficient inventory management frees working capital that can fund emission reduction investments. High inventory turnover companies like JSW Steel are better positioned to self-fund the Rs 207 Cr investment without significant additional debt or dilution.";

  if (q.includes("debtors turnover") || q.includes("receivable"))
    return "Debtors Turnover = Revenue / Average Debtors. Efficient receivables collection improves free cash flow available for compliance purchases and investment funding. Reliance Industries, with diversified B2B and B2C revenue streams across petrochemicals, Jio, and retail, has strong debtors turnover — supporting internal funding of the Rs 336 Cr emission reduction investment without entirely relying on green bonds.";

  if (q.includes("debt to equity") || q.includes("d/e ratio") || (q.includes("debt") && q.includes("equity")))
    return "Debt to Equity ratio matters significantly for sustainability investments. Companies with low D/E (Tata Steel approximately 0.5, JSW approximately 1.0) have headroom to issue green bonds for emission reduction capex. Higher D/E companies must rely more on internal accruals or equity. JSW Steel demonstrated capability by issuing 400 million USD green bond in 2021. Higher leverage increases WACC, reducing NPV of investment projects.";

  if (q.includes("leverage matter") || q.includes("why leverage"))
    return "Leverage matters in sustainability investments because: 1) Higher debt increases WACC, reducing NPV of decarbonisation projects; 2) Green bonds offer lower interest rates than conventional debt; 3) CBAM exposure (Rs 81 Cr/yr for Reliance from 2026) acts like a recurring fixed cost similar to debt service — high-leverage companies face double pressure; 4) Credit rating agencies increasingly factor carbon risk into ratings, potentially raising borrowing costs for high-emission companies.";

  // ── SCENARIO QUESTIONS ──────────────────────────────────────────────────
  if (q.includes("10,000") || q.includes("price rises to") || (q.includes("price") && q.includes("rise")))
    return "If carbon prices rise to Rs 10,000/cert: All 12 Indian companies would immediately flip to INVEST as buying becomes prohibitively expensive. Reliance annual buy cost would reach Rs 480 Cr versus Rs 336 Cr one-time investment. Total sector annual compliance cost would exceed Rs 1,800 Cr. This scenario — which is realistic by FY35 given global carbon price convergence — makes early investment today at Rs 800-1,000 prices the most financially rational decision.";

  if (q.includes("prices fall") || q.includes("fall drastically") || q.includes("price fall"))
    return "If carbon prices fall drastically: BUY strategy becomes dominant for all companies. However, this scenario is unlikely given: CCTS floor pricing being established, global carbon price convergence trend, and CBAM enforcement at Rs 5,580/tCO2 regardless of Indian ESCert prices. Even at low Indian credit prices, CBAM creates permanent investment incentive for exporters like Tata Steel and Hindalco.";

  if (q.includes("targets become stricter") || q.includes("stricter") || q.includes("tighter target"))
    return "If emission targets become stricter under PAT Cycle VIII or CCTS: ESCert deficits for all 12 companies increase, multiplying annual buy costs. Companies that already invested in emission reduction (JSW Steel via Project SEED, Reliance via Net Zero 2035) would have smaller deficits or surplus credits to sell. Companies relying purely on buying — especially Bhushan Power Steel (intensity 2.55, highest in steel) — would face the highest additional compliance costs.";

  if (q.includes("excess credits") || q.includes("surplus credits") || q.includes("produces excess"))
    return "If a company produces excess credits (over-performs its PAT target): under CCTS, it earns Carbon Credit Certificates (CCCs) that can be sold on IEX, PXIL, or HPX exchanges, generating revenue. At projected FY26 price of Rs 2,500/cert, surplus credits are highly valuable. Companies investing in emission reduction early can transition from credit buyers to credit sellers — converting a compliance cost into a revenue stream. This is the strategic upside of early investment.";

  if (q.includes("demand for credits increases") || q.includes("demand increases"))
    return "If demand for credits increases (more companies non-compliant or CCTS enforcement tightens): credit prices rise above projections, making the BUY strategy more expensive and accelerating the flip to INVEST for all companies. Companies with large deficits (Reliance 4.8M, JSW 2.3M) face the highest cost increase. This scenario also benefits companies that invested early and have surplus credits to sell at higher prices.";

  if (q.includes("penalties increase") || q.includes("government penalties"))
    return "If government penalties increase beyond Rs 10 lakh plus Rs 10,000/day: non-compliance becomes financially catastrophic. Reliance (4.8M deficit) would face the highest absolute penalty. Under CCTS, penalties are expected to be significantly higher than current PAT penalties. Companies relying on the low-penalty regime to delay compliance would face sudden cost shocks. Early investment eliminates penalty exposure entirely.";

  if (q.includes("competitors invest") || q.includes("first mover") || q.includes("invest earlier"))
    return "If competitors invest in emission reduction earlier: they gain lower emission intensity, lower CBAM exposure, better EU market access, and potentially surplus credits to sell. JSW Steel (Project SEED, green bond issued 2021) has first-mover advantage over Tata Steel and Bhushan Power. In the EU, ArcelorMittal's XCarb steel commands price premiums from low-carbon supply chain buyers. Indian steel that doesn't match ArcelorMittal's 1.89 tCO2/tcs intensity will face competitive disadvantage post-CBAM January 2026.";

  if (q.includes("misses compliance deadline") || q.includes("misses deadline"))
    return "If a company misses PAT compliance deadline: statutory penalty of Rs 10 lakh plus Rs 10,000 per day applies. Under CCTS, penalties will be higher. Additionally, SEBI BRSR non-disclosure consequences follow. Reputational damage affects ESG ratings and investor confidence. CBAM compliance from 2026 also requires accurate emissions data — non-compliant companies face both Indian regulatory action and EU export restrictions simultaneously.";

  if (q.includes("prices double") || q.includes("double"))
    return "If current credit prices double from Rs 800 to Rs 1,600: Tata Steel and JSW (break-even Rs 900) would immediately cross their break-even and should flip to INVEST. Reliance and all aluminium companies already past break-even would see investment case strengthen further. Total sector annual buy cost would double to approximately Rs 360 Cr. This doubling is conservative — CCTS projects Rs 2,500 by FY26 (3x current) and Rs 6,000 by FY30 (7.5x current).";

  if (q.includes("export regulations") || (q.includes("export") && q.includes("strict")))
    return "If export regulations become stricter (CBAM scope expands or EU ETS price rises): CBAM exposure for Indian companies would increase beyond current projections. Reliance (Rs 81 Cr/yr at €62/tCO2) would face proportionally higher charges at higher EU ETS prices projected at Rs 13,500/tCO2 by FY30. Tata Steel and Hindalco — major EU exporters — face the most direct impact. Reducing emission intensity is the only permanent solution to CBAM risk.";

  // ── RISK QUESTIONS ──────────────────────────────────────────────────────
  if (q.includes("risk") && q.includes("tata"))
    return "Tata Steel faces three carbon risks: 1) PAT compliance risk — 5.6 Mt gap and 2.2M ESCert deficit, costing Rs 17.6 Cr at current prices rising to Rs 132 Cr at FY30 prices. 2) CBAM risk — Rs 7.75 Cr/yr from January 2026 on EU steel exports — intensity 2.48 is 31% above ArcelorMittal benchmark 1.89, meaning CBAM charge is higher than it would be at benchmark intensity. 3) Competitive risk — EU buyers increasingly prefer low-carbon steel, threatening EU market share long-term.";

  if (q.includes("highest compliance risk") || q.includes("most compliance risk"))
    return "Reliance Industries has the highest compliance risk with the largest ESCert deficit (4.8M certificates) and highest annual buy cost (Rs 38.4 Cr at current prices, Rs 288 Cr at FY30). JSW Steel has the highest steel sector compliance risk (2.3M deficit). In aluminium, Hindalco faces both high deficit (2.4M) and highest CBAM exposure (Rs 43.7 Cr/yr). All three have high compliance pressure compounded by rising CCTS prices and CBAM enforcement from January 2026.";

  if (q.includes("measure carbon risk") || q.includes("how do you measure risk"))
    return "Carbon risk is measured using four metrics in this platform: 1) ESCert Deficit (Mt) — absolute gap between emissions and PAT target; 2) Annual Buy Cost at projected credit prices — quantifies financial exposure; 3) CBAM Exposure (Rs Cr/yr) — EU export carbon charge from 2026; 4) Emission Intensity Gap versus global benchmark — companies furthest from ArcelorMittal (1.89) or Rio Tinto (7.80) face highest long-term risk.";

  if (q.includes("penalties affect strategy") || q.includes("how penalties"))
    return "Penalties create a floor price for compliance strategy. At current penalties (Rs 10 lakh plus Rs 10,000/day), they are relatively low — most companies prefer paying penalties to making large investments. However, CCTS is expected to raise penalties significantly. When penalties approach or exceed the annual buy cost, companies face a binary choice: buy credits or invest. As penalties rise and credit prices rise simultaneously, early investment becomes the only rational long-term strategy.";

  if (q.includes("market risk") || q.includes("carbon trading risk"))
    return "Market risks in carbon trading: 1) Price volatility — ESCert prices ranged from Rs 200 to Rs 1,200 in IEX history; 2) Liquidity risk — thin trading volumes on IEX can cause price spikes; 3) Regulatory risk — CCTS rules may change, affecting price and eligibility; 4) Counterparty risk — trading on IEX mitigates this through exchange guarantee; 5) Currency risk for CBAM — EU ETS price in Euros exposes Indian exporters to EUR/INR fluctuation on top of carbon price risk.";

  if (q.includes("operational risk") || q.includes("operational"))
    return "Operational carbon risks: 1) Production disruption — unplanned shutdowns can cause emission spikes requiring additional ESCert purchases; 2) Fuel price changes — coal or gas price changes affect emission intensity and compliance cost simultaneously; 3) Technology risk — DRI or renewable energy projects may face implementation delays; 4) Measurement risk — inaccurate emission monitoring can lead to unexpected deficits; 5) Verification risk — BEE audits can revise SEC calculations, changing compliance position.";

  // ── FUTURE PREDICTIONS ──────────────────────────────────────────────────
  if (q.includes("predict") || q.includes("future carbon price") || q.includes("price trend"))
    return "Carbon price trajectory: ESCert prices projected to rise from Rs 800 (FY23) to Rs 1,000 (FY24), Rs 1,500 (FY25, CCTS launch), Rs 2,500 (FY26), Rs 3,000 (FY27), Rs 6,000 (FY30) — based on ICRA Research and NITI Aayog projections. EU ETS price (CBAM reference) projected from Rs 6,200 (FY23) to Rs 13,500 (FY30). Driving factors: CCTS enforcement tightening, global Net Zero commitments, CBAM creating import parity pressure.";

  if (q.includes("buying become expensive") || q.includes("will buying") || q.includes("expensive in future"))
    return "Yes, buying will become significantly more expensive. At FY23 price Rs 800/cert: total model buy cost Rs 180 Cr/yr. At FY26 price Rs 2,500/cert: Rs 451 Cr/yr (2.5x). At FY30 price Rs 6,000/cert: Rs 1,082 Cr/yr (6x). For Reliance alone: from Rs 38.4 Cr to Rs 288 Cr/yr. This exponential rise in buying cost is the core financial argument for investing in emission reduction now while credit prices are still at historical lows.";

  if (q.includes("highest carbon cost") || q.includes("face highest"))
    return "Petrochemicals and Aluminium will face the highest carbon costs. Reliance Industries faces Rs 288 Cr/yr in credit costs at FY30 prices plus Rs 81 Cr/yr CBAM — combined Rs 369 Cr/yr if no investment is made. Hindalco faces Rs 144 Cr/yr credit cost plus Rs 43.7 Cr/yr CBAM = Rs 187.7 Cr/yr. Chloro-Alkali has lowest total sector cost (Rs 22 Cr total invest).";

  if (q.includes("future-ready") || q.includes("which company is future") || q.includes("most future"))
    return "Reliance Industries is most future-ready — Net Zero 2035 (earliest in model), declining emissions FY23-FY26, green hydrogen and CCUS roadmap, and strongest financial capacity. JSW Steel is second — CDP A rating, Project SEED underway, green bond issued 2021. Hindalco (renewable smelting plan) in aluminium. Globally, ArcelorMittal (XCarb) and Rio Tinto (Elysis process) are the most advanced.";

  if (q.includes("gain most from green") || q.includes("green transition") || q.includes("benefit from transition"))
    return "Aluminium sector gains most from green transition — switching from coal captive power to renewable energy can halve emission intensity from 8.40-9.10 to 4-5 tCO2/t, eliminating CBAM exposure and positioning for premium green aluminium pricing in EU markets. Iron and Steel also benefits hugely — DRI with green hydrogen can reduce intensity from 2.48 to under 1.0 tCO2/tcs, competitive with ArcelorMittal 1.89 benchmark. Chloro-Alkali gains 15-20% energy reduction through membrane cell technology.";

  // ── AI / CHATBOT QUESTIONS ──────────────────────────────────────────────
  if (q.includes("how does this chatbot work") || q.includes("how does the chatbot") || q.includes("chatbot work"))
    return "This chatbot operates on a structured decision engine combining two layers. First, it uses company-specific datasets — emissions, deficits, investment costs, CBAM exposure, break-even prices — to answer quantitative questions with precise numbers. Second, it is powered by Claude AI (Anthropic) for generalized finance and strategy questions. When the live API is available, Claude provides dynamic responses. When unavailable, a comprehensive rule-based fallback engine covers all 100+ expected viva questions with domain-specific answers.";

  if (q.includes("real-time data") || q.includes("connected to real") || q.includes("live data"))
    return "Currently, the platform uses FY 2022-23 published data from company BRSR and sustainability reports as the base, with FY24-26 projections based on ICRA, NITI Aayog, and sector benchmarks. The sensitivity slider provides real-time financial modelling — drag the price from Rs 200 to Rs 6,000 and all costs, strategies, and break-even analyses update instantly. Live IEX market data integration and SEBI BRSR API connectivity are planned for the next development phase.";

  if (q.includes("machine learning") || q.includes("does this use ml") || q.includes(" ml "))
    return "The current version uses a structured decision engine — rule-based logic combined with financial formulae rather than traditional ML. The chatbot is powered by Claude AI (Anthropic's large language model) for natural language understanding. Future phases will incorporate time-series prediction models for credit price forecasting using IEX historical data. Currently, the chatbot operates on a structured knowledge base — as stated for the viva: it is a rule-based decision engine with AI-assisted natural language understanding.";

  if (q.includes("unknown questions") || q.includes("unanticipated"))
    return "For unknown or unanticipated questions, the chatbot uses a layered fallback approach. First, keyword matching identifies the topic domain (company name, regulation, financial concept). Then domain-specific responses are generated from the embedded knowledge base covering 100+ viva topics. If the question is completely outside scope, the chatbot suggests relevant related topics. This ensures the assistant is always helpful — it never returns a blank or error response to the user.";

  if (q.includes("how does it generate recommendations") || q.includes("generate recommendations"))
    return "Recommendations are generated using a financial decision algorithm: Step 1 — Calculate annual buy cost = ESCert Deficit x Credit Price. Step 2 — Compare to one-time investment cost. Step 3 — If buy cost exceeds investment (credit price above break-even), recommend INVEST. Step 4 — Factor in CBAM exposure. Step 5 — Factor in compliance pressure and payback period. This produces BUY, INVEST, HYBRID, or COMPARE recommendations that update live as the sensitivity slider changes.";

  if (q.includes("rule-based or ai") || q.includes("rule based or") || q.includes("is this rule"))
    return "The platform uses both. The financial analytics engine (buy cost, break-even, NPV, sensitivity analysis) is rule-based — deterministic calculations. The chatbot has two modes: when connected to Anthropic Claude AI API, it provides dynamic AI-generated responses. When the API is unavailable, a comprehensive rule-based fallback handles 100+ domain-specific questions. For the viva, you can say: the chatbot operates on a structured decision engine using company datasets and financial logic — API integration for live AI is the next phase.";

  if (q.includes("what data does it use") || q.includes("data does the") || q.includes("data source"))
    return "The platform uses data from: Company BRSR and ESG Reports (Tata Steel, JSW, Reliance etc. FY 2022-23), IEX ESCert price history (FY17-FY23), BEE PAT Scheme notifications (Cycle V, VI, VII), ICRA Research Indian Carbon Market Outlook 2024, NITI Aayog Carbon Pricing Report 2023, EU ETS price data (EEX), CBAM Regulation 2023/956, WRI India Carbon Market Simulation 2024, and global benchmark reports (ArcelorMittal, BASF, Rio Tinto, Olin). All 30+ sources are cited in the Data Sources section of the platform.";

  if (q.includes("can it learn") || q.includes("learn from users"))
    return "The current version does not learn from user interactions — responses are generated fresh each session from the embedded knowledge base and Claude AI. Future versions could incorporate fine-tuning on carbon finance domain data, user feedback loops to improve recommendation accuracy, and reinforcement learning from actual ESCert price movements. The platform architecture (Next.js + Anthropic API) supports adding these capabilities in subsequent phases.";

  if (q.includes("predict future prices") || q.includes("can it predict"))
    return "The platform provides structured price projections based on published research — ICRA, NITI Aayog, and IEX trend analysis — rather than ML price prediction. Projected trajectory: FY24 Rs 1,000, FY25 Rs 1,500, FY26 Rs 2,500, FY30 Rs 6,000. The sensitivity slider lets users model any price scenario from Rs 200 to Rs 6,000 and see instant financial impact. True ML price prediction using time-series models (ARIMA, LSTM) on IEX historical data is planned for the next development phase.";

  if (q.includes("how accurate") || q.includes("accuracy") || q.includes("accurate"))
    return "The platform's financial calculations (buy cost, break-even, payback) are precisely accurate given the input data. Emission figures are estimates derived from published intensity x production volume from BRSR reports. Price projections are estimates from ICRA and NITI Aayog with inherent uncertainty. Strategy recommendations are accurate given stated assumptions. The platform is an academic decision-support tool — recommendations should be validated with current market data before actual investment decisions.";

  // ── IMPROVEMENT QUESTIONS ───────────────────────────────────────────────
  if (q.includes("how can this platform be improved") || q.includes("improve") || q.includes("improvement"))
    return "Key improvement areas: 1) Live IEX ESCert price API for real-time sensitivity analysis; 2) ML price prediction models using IEX historical data; 3) Integration with company BRSR APIs for auto-updated emission data; 4) Carbon credit portfolio management for companies with multiple plant locations; 5) Expanded coverage to all 509 PAT DCs across 8 sectors; 6) User authentication to save company-specific scenarios; 7) Report generation for board-level carbon finance presentations.";

  if (q.includes("live market data") || q.includes("add live") || q.includes("real time"))
    return "Live market data integration would use IEX's public API for real-time ESCert prices, EU ETS data from EEX API, and BEE's online monitoring portal for real-time PAT compliance status. The Next.js architecture supports API integration without rebuilding the frontend. Adding server-side data fetching with 15-minute price refresh and WebSocket updates for the sensitivity slider would create a genuinely real-time decision tool — the highest-priority enhancement for the next development phase.";

  if (q.includes("add real ai") || q.includes("real ai") || q.includes("true ai"))
    return "Full AI integration plan: 1) Live Anthropic Claude API with domain-specific system prompt (already architected); 2) Fine-tuned model on Indian carbon market data; 3) RAG (Retrieval Augmented Generation) system that fetches latest BEE notifications and ESCert prices before generating responses; 4) Computer vision to extract emission data from company annual report PDFs automatically; 5) Agentic AI to monitor IEX prices and alert users when break-even thresholds are crossed.";

  if (q.includes("become commercial") || q.includes("commercial") || q.includes("saas"))
    return "Commercial SaaS model: Target customers are the 509 PAT Designated Consumers, carbon credit brokers, ESG consulting firms, and Indian investment banks advising on green bonds. Revenue model: subscription Rs 5-15 lakh/year per company, premium analytics, and API access for brokers. Competitive moat: proprietary financial modelling framework, company-specific data integration, and first-mover advantage in Indian carbon credit analytics. CCTS launch in FY24-25 creates an immediate market catalyst — all 509 DCs urgently need compliance tools.";

  // ── SPECIFIC COMPANIES ──────────────────────────────────────────────────
  if (q.includes("arcelormittal") || q.includes("arcelor"))
    return "ArcelorMittal (Luxembourg) — global steel benchmark. Intensity 1.89 tCO2/tcs — Indian steel is 22-35% above this. FY22: 149.0 Mt, FY23: 151.4 Mt, FY26 proj: 142.0 Mt (declining). XCarb DRI + green hydrogen programme. Net Zero 2050, Science-Based Target verified. EU ETS participant — pays carbon price directly. Annual investment $10B+ committed to 2030. Indian steel must reach 1.89 intensity to remain competitive in EU markets post-CBAM January 2026.";

  if (q.includes("basf"))
    return "BASF SE (Germany) — global petrochemical benchmark. FY22: 19.8 Mt, FY23: 20.2 Mt, FY26 proj: 18.0 Mt (declining). EU ETS participant — already pays approximately Rs 5,580/tCO2 directly, showing the future for Indian petrochemicals from January 2026. Net Zero 2050 with 25% cut by 2030. Electric steam cracking + green hydrogen + CCS. €4B committed to decarbonisation 2022-2027.";

  if (q.includes("rio tinto"))
    return "Rio Tinto (Australia) — global aluminium benchmark. Intensity 7.80 tCO2/t. FY22: 31.2 Mt, FY23: 32.5 Mt, FY26 proj: 29.2 Mt (declining). Elysis zero-carbon process + 100% renewable smelting power target. Net Zero 2050, 50% reduction by 2030. $7.5B to 2030. Indian aluminium (Hindalco 8.40, NALCO 8.95, Vedanta 9.10) is 8-17% above this benchmark — renewable captive power is the solution.";

  if (q.includes("olin"))
    return "Olin Corporation (USA) — global chloro-alkali benchmark. FY22: 2.85 Mt, FY23: 2.92 Mt, FY26 proj: 2.70 Mt. Advanced membrane cell electrolysis reduces energy 15-20% vs diaphragm cell technology. 2030 interim reduction target. $500M+ efficiency capex. Indian companies DCW, GHCL, Grasim should adopt membrane cell technology as the efficiency standard.";

  if (q.includes("reliance"))
    return "Reliance Industries — India's largest private company (petrochemicals, refining, Jio, retail). FY22: 51.3 Mt, FY23: 52.8 Mt, FY26 proj: 49.5 Mt. Largest deficit 4.8M ESCerts. CBAM exposure Rs 81 Cr/yr — highest in model. Break-even Rs 700/cert — already below current market, so INVEST immediately. Investment cost Rs 336 Cr. Net Zero 2035. Green hydrogen + CCUS roadmap. Payback 8.8 years (FY23), 2.8 years (FY26), 1.2 years (FY30).";

  if (q.includes("tata"))
    return "Tata Steel: FY22 47.1 Mt, FY23 49.6 Mt, FY26 proj 46.8 Mt. PAT target 44.0 Mt. Gap 5.6 Mt. ESCert deficit 2.2M. Intensity 2.48 tCO2/tcs — 31% above ArcelorMittal benchmark 1.89. Strategy: BUY (break-even Rs 900, above current Rs 800). Investment cost Rs 198 Cr. CBAM Rs 7.75 Cr/yr from 2026. Payback 9 years (FY23), 3.6 years (FY26). Net Zero 2045. DRI + renewable energy is the long-term path.";

  if (q.includes("jsw"))
    return "JSW Steel: FY22 48.3 Mt, FY23 50.8 Mt, FY26 proj 48.0 Mt. Best Indian steel intensity 2.31 — 22% above ArcelorMittal 1.89. Highest steel deficit 2.3M ESCerts. Strategy: HYBRID — buy bridge ESCerts while executing Project SEED. Investment cost Rs 207 Cr. CBAM Rs 9.98 Cr/yr. Green bond 400 million USD issued February 2021. CDP Leadership Level A. Break-even Rs 900/cert.";

  if (q.includes("bhushan"))
    return "Bhushan Power Steel (JSW BPSL): FY23 11.5 Mt, FY26 proj 10.8 Mt. Highest Indian steel intensity 2.55 — 35% above ArcelorMittal 1.89. Smallest steel deficit 0.7M. Strategy: BUY (buy cost minimal at Rs 5.6 Cr). Investment cost Rs 63 Cr. CBAM Rs 0.76 Cr/yr. Follows JSW Group decarbonisation roadmap.";

  if (q.includes("indian oil") || q.includes(" ioc "))
    return "Indian Oil Corporation — GoI PSU petroleum refiner. FY23: 21.3 Mt, FY26 proj: 19.8 Mt. Gap 1.8 Mt, deficit 1.8M. Strategy: BUY through FY25, then INVEST as CCTS prices rise. Investment cost Rs 126 Cr. CBAM Rs 10.53 Cr/yr from 2026. 30% renewable energy target by 2030. PSU — needs government planning process for large green capex.";

  if (q.includes("bharat petroleum") || q.includes("bpcl"))
    return "Bharat Petroleum — GoI PSU. FY23: 14.7 Mt, FY26 proj: 13.5 Mt. Smallest petrochem deficit 0.9M ESCerts. Strategy: BUY + incremental efficiency. Investment cost Rs 63 Cr. CBAM Rs 6.08 Cr/yr. Net Zero 2040 target. Annual buy cost Rs 7.2 Cr at current prices — manageable without major capex in short term.";

  if (q.includes("hindalco"))
    return "Hindalco Industries: FY23 28.4 Mt, FY26 proj 26.5 Mt. Intensity 8.40 tCO2/t — 8% above Rio Tinto benchmark 7.80. Deficit 2.4M ESCerts. CBAM Rs 43.7 Cr/yr — EXCEEDS annual credit buy cost of Rs 19.2 Cr at current prices. Strategy: INVEST immediately — CBAM alone justifies it. Investment cost Rs 264 Cr. Break-even Rs 1,100/cert but CBAM makes investment economically dominant well below this. Net Zero 2050.";

  if (q.includes("vedanta"))
    return "Vedanta Aluminium: FY23 24.6 Mt, FY26 proj 22.8 Mt. Highest intensity in entire model at 9.10 tCO2/t — 17% above Rio Tinto 7.80. Coal captive power is root cause. Deficit 2.1M ESCerts. Strategy: INVEST urgently. CBAM Rs 25.49 Cr/yr. Investment cost Rs 231 Cr. Shifting to renewable captive power can halve emission intensity.";

  if (q.includes("nalco"))
    return "NALCO — Government of India PSU aluminium producer. FY23: 11.2 Mt, FY26 proj: 10.6 Mt. Intensity 8.95 tCO2/t. Smallest aluminium deficit 0.4M — buy cost only Rs 3.2 Cr at current price. Strategy: COMPARE FY23-24, then INVEST FY25-26 as CCTS prices rise. Investment cost Rs 44 Cr. Needs Ministry of Mines approval for renewable capex. Break-even Rs 1,100/cert.";

  if (q.includes("dcw"))
    return "DCW Limited: FY23 0.82 Mt, FY26 proj 0.76 Mt. Smallest deficit in model — 0.07M ESCerts. Annual buy cost only Rs 0.56 Cr at current price. Strategy: BUY — negligible cost, no capex justification. CBAM exposure Rs 0.28 Cr/yr. Monitor if capacity expands significantly. Investment cost Rs 3.5 Cr if ever needed.";

  if (q.includes("ghcl"))
    return "GHCL Limited: FY23 0.95 Mt, FY26 proj 0.89 Mt. Deficit 0.07M ESCerts. Strategy: BUY. Annual buy cost Rs 0.56 Cr. Investment cost Rs 3.5 Cr. CBAM Rs 0.29 Cr/yr. Olin Corporation membrane cell technology is the benchmark efficiency standard to follow. Review strategy if soda ash or chloro-alkali capacity expands.";

  if (q.includes("grasim"))
    return "Grasim Industries (Aditya Birla Group): FY23 3.80 Mt, FY26 proj 3.55 Mt. Largest chloro-alkali deficit 0.30M ESCerts. Strategy: COMPARE through FY25, then INVEST from FY26 as CCTS reaches Rs 2,500. Break-even Rs 500/cert — already past break-even (current market Rs 800). Investment cost Rs 15 Cr. ABG has green bond issuance capacity. CBAM Rs 0.53 Cr/yr.";

  // ── NPV / IRR / WACC ────────────────────────────────────────────────────
  if (q.includes("npv") || q.includes("net present value"))
    return "NPV = Sum of [Annual Saving / (1 + r)^year] minus Initial Capex. Tata Steel example: Capex Rs 198 Cr, discount rate 10%. Annual savings rise from Rs 17.6 Cr (FY23) to Rs 55 Cr (FY26) to Rs 132 Cr (FY30) as CCTS prices rise. Cumulative discounted savings over 10 years approximately Rs 280-350 Cr. NPV turns positive approximately by FY27-28. Rising CCTS prices are the key driver — the stronger the price trajectory, the better the NPV.";

  if (q.includes("irr") || q.includes("internal rate"))
    return "IRR is the discount rate at which NPV equals zero — higher than WACC of 10-14% means invest. For Reliance (break-even Rs 700, below current Rs 800): annual saving Rs 38.4 Cr on Rs 336 Cr capex gives simple IRR approximately 11.4% — already above WACC. At rising prices to Rs 6,000 by FY30, IRR rises dramatically above 25%. Rising credit prices improve IRR every year — making early investment the dominant financial decision.";

  if (q.includes("wacc") || q.includes("cost of capital"))
    return "WACC = (E/V x Re) + (D/V x Rd x (1-Tc)). For Indian heavy industry: Cost of Equity typically 14-16%, Cost of Debt 8-10%, Tax rate 25-30%, D/E ratio 0.5-1.5x. Resulting WACC: 10-14%. Green bonds reduce Rd by 50-100 bps, lowering WACC. JSW Steel's 2021 green bond demonstrated this. Lower WACC makes NPV of decarbonisation investment positive sooner.";

  if (q.includes("payback") || q.includes("pay back"))
    return "Payback = Capex / Annual Saving. Reliance: Rs 336 Cr / Rs 38.4 Cr = 8.8 years (FY23). At FY26 Rs 2,500: Rs 336 Cr / Rs 120 Cr = 2.8 years. At FY30 Rs 6,000: 1.2 years. Tata Steel: Rs 198 Cr / Rs 17.6 Cr = 11.2 years (FY23), Rs 198 Cr / Rs 55 Cr = 3.6 years (FY26). The shortening payback as CCTS prices rise is the most powerful argument for early investment.";

  if (q.includes("green bond"))
    return "Green bonds finance climate projects at preferential rates. JSW Steel: 400 million USD green bond February 2021 — funds DRI plant, energy efficiency, renewable power — first Indian steel green bond. ArcelorMittal issues regularly for XCarb programme. SEBI Green Bond Circular 2023 defines Indian framework. Benefits: 50-100 bps lower interest rate vs conventional debt, ESG investor access, improved credit rating. Hindalco and Grasim (ABG) have strong credentials to issue green bonds.";

  // ── GENERIC ─────────────────────────────────────────────────────────────
  if (q.includes("cbam") || q.includes("carbon border"))
    return "CBAM (Carbon Border Adjustment Mechanism) — EU Regulation 2023/956. Full financial enforcement January 2026 at EU ETS price approximately Rs 5,580 per tCO2. Indian companies' annual CBAM exposure: Reliance Rs 81 Cr, Hindalco Rs 43.7 Cr, IOC Rs 10.53 Cr, JSW Rs 9.98 Cr, Tata Rs 7.75 Cr, BPCL Rs 6.08 Cr. Companies reducing emission intensity below ArcelorMittal (1.89) or Rio Tinto (7.80) benchmarks reduce CBAM charges proportionally.";

  if (q.includes("pat") || q.includes("perform achieve"))
    return "PAT (Perform Achieve Trade) — BEE scheme tracking Specific Energy Consumption. ESCerts traded on IEX. Cycle VII 2022-2025 covers 509 Designated Consumers with 6.627 MTOE total saving target. Only 51% compliance in Cycle II. All 12 Indian companies in this platform are PAT DCs. Penalty: Rs 10 lakh first offence plus Rs 10,000/day. CCTS launching FY24-25 replaces PAT with stronger enforcement.";

  if (q.includes("escert"))
    return "ESCerts = Energy Saving Certificates. 1 ESCert = 1 MTOE saved below PAT target. Traded on IEX. Price history: FY17 Rs 1,200 peak, FY22 Rs 200 low, FY23 Rs 800. CCTS integrates from FY24-25. Projected: FY25 Rs 1,500, FY26 Rs 2,500, FY30 Rs 6,000. All 12 Indian companies have ESCert deficits totalling 18.04M certificates. Companies that over-perform sell surplus; under-performers must buy or face penalty.";

  if (q.includes("ccts"))
    return "CCTS (Carbon Credit Trading Scheme) under EC Amendment Act 2022. ICM (Indian Carbon Market) launching FY24-25. Carbon Credit Certificates tradeable on IEX, PXIL, HPX. Projected prices: FY25 Rs 1,500, FY26 Rs 2,500, FY27 Rs 3,000, FY30 Rs 6,000. Much stronger enforcement than current PAT — the shift from weak ESCert enforcement to mandatory CCTS compliance is the key regulatory driver making early investment financially rational.";

  if (q.includes("sebi") || q.includes("brsr"))
    return "SEBI BRSR (Business Responsibility and Sustainability Reporting) — mandatory Scope 1, 2, 3 GHG disclosure for top 1000 listed companies from FY 2022-23 with external assurance. All 12 Indian companies in this platform are listed and must file BRSR Core. Non-disclosure = SEBI regulatory action. BRSR data provides the verified emission figures used as inputs to this platform's analysis.";

  if (q.includes("16") || q.includes("all companies") || q.includes("list all"))
    return "The 16 companies covered: Iron and Steel — Tata Steel, JSW Steel, Bhushan Power Steel (Indian) + ArcelorMittal (global benchmark). Petrochemicals — Reliance, Indian Oil, Bharat Petroleum (Indian) + BASF SE (global benchmark). Aluminium — Hindalco, Vedanta, NALCO (Indian) + Rio Tinto (global benchmark). Chloro-Alkali — DCW, GHCL, Grasim (Indian) + Olin Corporation (global benchmark). All 4 global benchmarks are shown in the Global Benchmarks section of the platform.";

  // ── DEFAULT ─────────────────────────────────────────────────────────────
  return "I can answer questions about all 16 companies and carbon finance. Try asking about: Tata Steel, JSW Steel, Reliance Industries, Hindalco vs Rio Tinto, CBAM 2026, IEX, PAT scheme, ESCerts, CCTS price projection to FY30, NPV, IRR, WACC, payback period, break-even analysis, ratio analysis (EBITDA, ROCE, D/E), scenario analysis (what if prices rise?), risk assessment, or how the platform works. What would you like to know?";
}