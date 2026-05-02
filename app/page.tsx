"use client";
import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";

type Strategy = "BUY" | "INVEST" | "COMPARE" | "HYBRID";
type Compliance = "High" | "Moderate" | "Low";
type View = "landing" | "home" | "sector" | "company" | "sources" | "tracker" | "benchmarks" | "regulation";
type ChatMessage = { role: "user" | "bot"; text: string };

type Company = {
  id: string; name: string; sector: string; country: string; isForeign: boolean;
  fy22: number; fy23: number; fy24: number; fy25: number; fy26: number;
  emissionIntensity: number; patTarget: number; gap: number; compliance: Compliance;
  escertDeficit: number; investCost: number; payback: number;
  buyCostFY23: number; buyCostFY24: number; buyCostFY25: number; buyCostFY26: number;
  breakEvenPrice: number;
  cbamExposure: number; strategy: Strategy;
  strategyFY23: Strategy; strategyFY24: Strategy; strategyFY25: Strategy; strategyFY26: Strategy;
  strategyDetail: string; complianceDetail: string; creditPosition: string; finalRec: string;
  netZeroTarget: string; keyTechnology: string; globalInsight: string;
  color: string; source: string;
};

// ── All 12 Indian DCs with full FY22-FY26 data from Excel ──────────────────
const COMPANIES: Company[] = [
  {
    id: "tata", name: "Tata Steel", sector: "Iron & Steel", country: "India", isForeign: false,
    fy22: 47.1, fy23: 49.6, fy24: 48.2, fy25: 47.5, fy26: 46.8,
    emissionIntensity: 2.48, patTarget: 44.0, gap: 5.6, compliance: "Moderate",
    escertDeficit: 2.2, investCost: 198, payback: 9,
    buyCostFY23: 176, buyCostFY24: 220, buyCostFY25: 330, buyCostFY26: 550, breakEvenPrice: 900,
    cbamExposure: 7.75, strategy: "BUY",
    strategyFY23: "BUY", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2045", keyTechnology: "DRI + Renewable Energy",
    globalInsight: "Intensity 2.48 — 31% above ArcelorMittal benchmark 1.89. Must reduce by Jan 2026 for EU CBAM competitiveness.",
    strategyDetail: "Buy ESCerts short-term for PAT compliance. Invest in DRI technology and renewable energy. Target: reduce intensity to <2.0 tCO₂/tcs by 2030.",
    complianceDetail: "Tata Steel India emits ~2.48 tCO₂/tonne of steel. PAT Cycle VII target requires ~8.5% specific energy reduction. 20 Mt production, FY22 47.1 Mt → FY26 projected 46.8 Mt.",
    creditPosition: "ESCert deficit ~2.2M certificates. Must buy on IEX. Break-even ₹900/cert. CBAM exposure ~₹7.75 Cr/yr from Jan 2026.",
    finalRec: "BUY ESCerts through FY26 — break-even far above market price. Invest in DRI+renewable to close gap before FY28-30 when CCTS prices make investment essential.",
    color: "#0284c7", source: "Tata Steel BRSR 2022-23 | Intensity 2.48 tCO₂/tcs",
  },
  {
    id: "jsw", name: "JSW Steel", sector: "Iron & Steel", country: "India", isForeign: false,
    fy22: 48.3, fy23: 50.8, fy24: 49.5, fy25: 48.8, fy26: 48.0,
    emissionIntensity: 2.31, patTarget: 45.0, gap: 5.8, compliance: "High",
    escertDeficit: 2.3, investCost: 207, payback: 9,
    buyCostFY23: 184, buyCostFY24: 230, buyCostFY25: 345, buyCostFY26: 575, breakEvenPrice: 900,
    cbamExposure: 9.98, strategy: "HYBRID",
    strategyFY23: "HYBRID", strategyFY24: "HYBRID", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2050", keyTechnology: "Project SEED + DRI",
    globalInsight: "Best Indian steel at 2.31 — still 22% above ArcelorMittal. Project SEED must accelerate.",
    strategyDetail: "Hybrid: buy bridge ESCerts for immediate PAT compliance while executing Project SEED. Target: <1.95 tCO₂/tcs by 2030.",
    complianceDetail: "JSW Steel operates 3 integrated steel plants producing ~22 Mt. CDP Leadership Level A. FY22 48.3 Mt → FY26 projected 48.0 Mt.",
    creditPosition: "ESCert deficit ~2.3M certificates. Highest absolute deficit in steel sector. Break-even ₹900/cert.",
    finalRec: "HYBRID FY23-24 — buy bridge ESCerts while executing Project SEED. By FY25 rising CCTS prices tip to INVEST. Urgency HIGH.",
    color: "#7c3aed", source: "JSW Steel IR 2022-23 | CDP A | Project SEED",
  },
  {
    id: "bhushan", name: "Bhushan Power Steel", sector: "Iron & Steel", country: "India", isForeign: false,
    fy22: 10.4, fy23: 11.5, fy24: 11.2, fy25: 11.0, fy26: 10.8,
    emissionIntensity: 2.55, patTarget: 10.8, gap: 0.7, compliance: "Moderate",
    escertDeficit: 0.7, investCost: 63, payback: 9,
    buyCostFY23: 56, buyCostFY24: 70, buyCostFY25: 105, buyCostFY26: 175, breakEvenPrice: 900,
    cbamExposure: 0.76, strategy: "BUY",
    strategyFY23: "BUY", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "Follows JSW", keyTechnology: "JSW Group roadmap",
    globalInsight: "Highest Indian steel intensity at 2.55 — 35% above ArcelorMittal benchmark.",
    strategyDetail: "Buy ESCerts at current low prices — smallest deficit in steel sector. Follow JSW group decarbonisation roadmap.",
    complianceDetail: "Bhushan Power Steel (JSW BPSL) operates 4.5 MTPA at Jharsuguda, Odisha. FY22 10.4 Mt → FY26 projected 10.8 Mt.",
    creditPosition: "Smallest ESCert deficit — 0.7M certificates. Low-cost compliance obligation. Break-even ₹900/cert.",
    finalRec: "BUY through FY26 — smallest deficit in steel. Cost minimal at ₹17.5 Cr even at FY26 price. Follow JSW group decarbonisation roadmap.",
    color: "#0891b2", source: "JSW IR 2022-23 | BPSL 4.5 MTPA Odisha",
  },
  {
    id: "reliance", name: "Reliance Industries", sector: "Petrochemicals", country: "India", isForeign: false,
    fy22: 51.3, fy23: 52.8, fy24: 51.5, fy25: 50.8, fy26: 49.5,
    emissionIntensity: 3.12, patTarget: 48.0, gap: 4.8, compliance: "High",
    escertDeficit: 4.8, investCost: 336, payback: 7,
    buyCostFY23: 384, buyCostFY24: 480, buyCostFY25: 720, buyCostFY26: 1200, breakEvenPrice: 700,
    cbamExposure: 81.0, strategy: "INVEST",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2035 Net Zero", keyTechnology: "Green H₂ + CCUS",
    globalInsight: "Largest CBAM exposure ₹81 Cr/yr from 2026. Net Zero 2035 forces urgent investment.",
    strategyDetail: "Net Zero 2035 commitment mandates large-scale investment. Largest absolute deficit. Green H₂ + CCUS roadmap.",
    complianceDetail: "Reliance Industries — India's largest private sector company. Petrochemicals + refining + retail + Jio. FY22 51.3 Mt → FY26 projected 49.5 Mt.",
    creditPosition: "Highest ESCert deficit — 4.8M certificates. Break-even ₹700/cert — already below market! Investment dominant from Day 1.",
    finalRec: "INVEST immediately — all years. Net Zero 2035 mandatory. Largest deficit 4.8 Mt. CBAM ₹81 Cr/yr from 2026. RIL must invest in green hydrogen + CCUS NOW.",
    color: "#d97706", source: "RIL ESG Report 2022-23 | 52.8 Mt published",
  },
  {
    id: "ioc", name: "Indian Oil Corporation", sector: "Petrochemicals", country: "India", isForeign: false,
    fy22: 20.5, fy23: 21.3, fy24: 20.8, fy25: 20.2, fy26: 19.8,
    emissionIntensity: 2.87, patTarget: 19.5, gap: 1.8, compliance: "Moderate",
    escertDeficit: 1.8, investCost: 126, payback: 7,
    buyCostFY23: 144, buyCostFY24: 180, buyCostFY25: 270, buyCostFY26: 450, breakEvenPrice: 700,
    cbamExposure: 10.53, strategy: "BUY",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "COMPARE",
    netZeroTarget: "2046", keyTechnology: "30% Renewable by 2030",
    globalInsight: "PSU — government support needed for large renewable capex.",
    strategyDetail: "PSU — buy ESCerts for PAT compliance. Pursue 30% renewable energy target by 2030.",
    complianceDetail: "Indian Oil Corporation — India's largest commercial enterprise, Government PSU. FY22 20.5 Mt → FY26 projected 19.8 Mt.",
    creditPosition: "ESCert deficit 1.8M certificates. Break-even ₹700/cert. Buy through FY25, compare/invest by FY26.",
    finalRec: "BUY through FY25. By FY26 CCTS prices rising — COMPARE/INVEST. PSU — needs government allocation for green capex.",
    color: "#dc2626", source: "IOC Sustainability Report 2022-23 | 21.3 Mt",
  },
  {
    id: "bpcl", name: "Bharat Petroleum", sector: "Petrochemicals", country: "India", isForeign: false,
    fy22: 14.1, fy23: 14.7, fy24: 14.3, fy25: 13.9, fy26: 13.5,
    emissionIntensity: 2.94, patTarget: 13.8, gap: 0.9, compliance: "Moderate",
    escertDeficit: 0.9, investCost: 63, payback: 7,
    buyCostFY23: 72, buyCostFY24: 90, buyCostFY25: 135, buyCostFY26: 225, breakEvenPrice: 700,
    cbamExposure: 6.08, strategy: "BUY",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2040", keyTechnology: "Incremental efficiency",
    globalInsight: "Smallest petrochem deficit. BUY credits + efficiency near-term.",
    strategyDetail: "Manageable deficit — buy ESCerts for PAT compliance. Incremental efficiency improvements.",
    complianceDetail: "Bharat Petroleum — GoI PSU petroleum refiner. FY22 14.1 Mt → FY26 projected 13.5 Mt.",
    creditPosition: "Smallest deficit in petrochem — 0.9M ESCerts. Break-even ₹700/cert.",
    finalRec: "BUY + incremental efficiency through FY26. Smallest petrochem deficit. Plan renewable capex now for post-FY26 cycles.",
    color: "#ec4899", source: "BPCL Annual Report 2022-23 | 14.7 Mt",
  },
  {
    id: "hindalco", name: "Hindalco Industries", sector: "Aluminium", country: "India", isForeign: false,
    fy22: 27.2, fy23: 28.4, fy24: 27.8, fy25: 27.2, fy26: 26.5,
    emissionIntensity: 8.40, patTarget: 26.0, gap: 2.4, compliance: "High",
    escertDeficit: 2.4, investCost: 264, payback: 11,
    buyCostFY23: 192, buyCostFY24: 240, buyCostFY25: 360, buyCostFY26: 600, breakEvenPrice: 1100,
    cbamExposure: 43.7, strategy: "INVEST",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2050", keyTechnology: "Renewable power smelting",
    globalInsight: "CBAM ₹43.7 Cr/yr from 2026 EXCEEDS annual buy cost — investment in renewables is financially dominant.",
    strategyDetail: "CBAM 2026 makes aluminium investment non-negotiable. Shift smelting power to 100% renewables.",
    complianceDetail: "Hindalco — India's largest aluminium producer. Intensity 8.40 tCO₂/tonne. FY22 27.2 Mt → FY26 projected 26.5 Mt.",
    creditPosition: "ESCert deficit 2.4M. CBAM exposure ₹43.7 Cr/yr — exceeds annual buy cost. Break-even ₹1,100/cert.",
    finalRec: "INVEST immediately — all years. CBAM ₹43.7 Cr/yr from 2026 EXCEEDS annual buy cost — investment is financially dominant. 100% renewable smelting is the path.",
    color: "#8b5cf6", source: "Hindalco Sustainability Report 2022-23 | 28.4 Mt",
  },
  {
    id: "vedanta", name: "Vedanta Aluminium", sector: "Aluminium", country: "India", isForeign: false,
    fy22: 23.4, fy23: 24.6, fy24: 24.0, fy25: 23.4, fy26: 22.8,
    emissionIntensity: 9.10, patTarget: 22.5, gap: 2.1, compliance: "High",
    escertDeficit: 2.1, investCost: 231, payback: 11,
    buyCostFY23: 168, buyCostFY24: 210, buyCostFY25: 315, buyCostFY26: 525, breakEvenPrice: 1100,
    cbamExposure: 25.49, strategy: "INVEST",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2050", keyTechnology: "Grid shift to renewable",
    globalInsight: "Highest intensity in model. Coal captive power is root cause. 17% above Rio Tinto benchmark.",
    strategyDetail: "Highest emission intensity (9.10 tCO₂/tonne) in model. Coal captive power must shift to renewable.",
    complianceDetail: "Vedanta Aluminium — India's largest by capacity. FY22 23.4 Mt → FY26 projected 22.8 Mt. Highest intensity in entire model.",
    creditPosition: "ESCert deficit 2.1M. CBAM exposure ₹25.49 Cr/yr. Break-even ₹1,100/cert.",
    finalRec: "INVEST — highest intensity in model at 9.10 tCO₂/t. CBAM ₹25.49 Cr/yr. Coal captive power must shift to renewable. Renewable captive power is urgent.",
    color: "#6366f1", source: "Vedanta ESG Report 2022-23 | 24.6 Mt",
  },
  {
    id: "nalco", name: "NALCO", sector: "Aluminium", country: "India", isForeign: false,
    fy22: 10.8, fy23: 11.2, fy24: 11.0, fy25: 10.8, fy26: 10.6,
    emissionIntensity: 8.95, patTarget: 10.8, gap: 0.4, compliance: "Moderate",
    escertDeficit: 0.4, investCost: 44, payback: 11,
    buyCostFY23: 32, buyCostFY24: 40, buyCostFY25: 60, buyCostFY26: 100, breakEvenPrice: 1100,
    cbamExposure: 2.78, strategy: "COMPARE",
    strategyFY23: "COMPARE", strategyFY24: "COMPARE", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "2050 (GoI)", keyTechnology: "PSU renewable capex",
    globalInsight: "PSU — needs Ministry of Mines approval. Buy now, invest next cycle.",
    strategyDetail: "PSU — buy ESCerts now while seeking Government approval for renewable captive power.",
    complianceDetail: "NALCO — Government of India PSU. FY22 10.8 Mt → FY26 projected 10.6 Mt. Coal captive power.",
    creditPosition: "Smallest aluminium deficit — 0.4M ESCerts. Only ₹4 Cr at base price. Break-even ₹1,100/cert.",
    finalRec: "COMPARE FY23-24 — buy ESCerts now (only ₹4 Cr at base). By FY25-26 investment is dominant. PSU — needs Ministry of Mines approval. Build renewable captive power investment case now.",
    color: "#14b8a6", source: "NALCO Annual Report 2022-23 | 11.2 Mt",
  },
  {
    id: "dcw", name: "DCW Limited", sector: "Chloro-Alkali", country: "India", isForeign: false,
    fy22: 0.78, fy23: 0.82, fy24: 0.80, fy25: 0.78, fy26: 0.76,
    emissionIntensity: 1.45, patTarget: 0.75, gap: 0.07, compliance: "Moderate",
    escertDeficit: 0.07, investCost: 3.5, payback: 5,
    buyCostFY23: 5.6, buyCostFY24: 7.0, buyCostFY25: 10.5, buyCostFY26: 17.5, breakEvenPrice: 500,
    cbamExposure: 0.28, strategy: "BUY",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "Not published", keyTechnology: "Incremental efficiency",
    globalInsight: "Smallest emissions. BUY credits — cost negligible.",
    strategyDetail: "Very small deficit — buy ESCerts. No capex justification at current scale.",
    complianceDetail: "DCW Limited — mid-size chloro-alkali manufacturer. FY22 0.78 Mt → FY26 projected 0.76 Mt.",
    creditPosition: "Smallest absolute deficit in model — 0.07M ESCerts. Break-even ₹500/cert.",
    finalRec: "BUY through FY26 — cost negligible even at ₹2,500/cert (₹1.75 Cr). No capex justification at current scale. Consider upgrade if expanding capacity.",
    color: "#06b6d4", source: "DCW Annual Report 2022-23 | 0.82 Mt",
  },
  {
    id: "ghcl", name: "GHCL Limited", sector: "Chloro-Alkali", country: "India", isForeign: false,
    fy22: 0.90, fy23: 0.95, fy24: 0.93, fy25: 0.91, fy26: 0.89,
    emissionIntensity: 1.52, patTarget: 0.88, gap: 0.07, compliance: "Moderate",
    escertDeficit: 0.07, investCost: 3.5, payback: 5,
    buyCostFY23: 5.6, buyCostFY24: 7.0, buyCostFY25: 10.5, buyCostFY26: 17.5, breakEvenPrice: 500,
    cbamExposure: 0.29, strategy: "BUY",
    strategyFY23: "INVEST", strategyFY24: "INVEST", strategyFY25: "INVEST", strategyFY26: "INVEST",
    netZeroTarget: "Not published", keyTechnology: "Soda ash efficiency",
    globalInsight: "Small scale. BUY and monitor.",
    strategyDetail: "Small deficit — buy ESCerts. Monitor if soda ash capacity expands.",
    complianceDetail: "GHCL Limited — diversified chemicals, soda ash + chloro-alkali. FY22 0.90 Mt → FY26 projected 0.89 Mt.",
    creditPosition: "Small deficit — 0.07M ESCerts. Break-even ₹500/cert.",
    finalRec: "BUY through FY26. Review if soda ash capacity expands significantly. Benchmark: Olin Corporation membrane cell shows 15-20% energy reduction possible.",
    color: "#0891b2", source: "GHCL Sustainability Report 2022-23 | 0.95 Mt",
  },
  {
    id: "grasim", name: "Grasim Industries", sector: "Chloro-Alkali", country: "India", isForeign: false,
    fy22: 3.62, fy23: 3.80, fy24: 3.72, fy25: 3.65, fy26: 3.55,
    emissionIntensity: 1.38, patTarget: 3.50, gap: 0.30, compliance: "Moderate",
    escertDeficit: 0.30, investCost: 15, payback: 5,
    buyCostFY23: 24, buyCostFY24: 30, buyCostFY25: 45, buyCostFY26: 75, breakEvenPrice: 500,
    cbamExposure: 0.53, strategy: "COMPARE",
    strategyFY23: "COMPARE", strategyFY24: "COMPARE", strategyFY25: "COMPARE", strategyFY26: "INVEST",
    netZeroTarget: "2050 (ABG)", keyTechnology: "Group renewable capex",
    globalInsight: "Largest chloro-alkali. Investment becoming viable by FY26-27.",
    strategyDetail: "Largest in chloro-alkali. Approaching investment viability. Model break-even carefully.",
    complianceDetail: "Grasim — Aditya Birla Group. Largest chloro-alkali player. FY22 3.62 Mt → FY26 projected 3.55 Mt.",
    creditPosition: "Largest deficit in chloro-alkali — 0.30M ESCerts. Break-even ₹500/cert.",
    finalRec: "COMPARE through FY25. By FY26-27 with CCTS at ₹2,500+, investment in energy efficiency becomes clearly viable. Aditya Birla Group has green bond capacity.",
    color: "#0284c7", source: "Grasim ESG Report 2022-23 | 3.80 Mt",
  },
];

// ── 4 Foreign Benchmarks ───────────────────────────────────────────────────
const FOREIGN_BENCHMARKS = [
  {
    id: "arcelormittal", name: "ArcelorMittal", sector: "Iron & Steel", country: "Luxembourg/Global",
    fy22: 149.0, fy23: 151.4, fy24: 148.0, fy25: 145.0, fy26: 142.0,
    emissionIntensity: 1.89, netZeroTarget: "2050 (Science-Based)", color: "#3b82f6",
    carbonMarket: "EU ETS participant — direct carbon price", cbamStatus: "EU-based — NOT subject to CBAM",
    keyTech: "XCarb DRI with natural gas + green H₂. Electric Arc Furnace expansion.",
    annualInvestment: "$10B+ committed to 2030",
    insight: "GLOBAL BENCHMARK: 1.89 tCO₂/tcs. Indian steel must reach this to compete post-CBAM. Indian steel is 22-35% above this benchmark.",
    source: "ArcelorMittal Sustainability Report 2022-23 | CDP A List | SBT verified"
  },
  {
    id: "basf", name: "BASF SE", sector: "Petrochemicals", country: "Germany",
    fy22: 19.8, fy23: 20.2, fy24: 19.5, fy25: 18.8, fy26: 18.0,
    emissionIntensity: null, netZeroTarget: "2050 | 25% by 2030", color: "#f59e0b",
    carbonMarket: "EU ETS participant — direct carbon price", cbamStatus: "EU-based — NOT subject to CBAM",
    keyTech: "Electric steam cracking. Carbon Capture + Storage. Green hydrogen for high-temp processes.",
    annualInvestment: "€4B committed 2022-2027",
    insight: "GLOBAL BENCHMARK: EU ETS participant — already pays €62/tCO₂ directly. Shows the carbon pricing future for Indian petrochemicals.",
    source: "BASF Integrated Report 2022-23 | EU ETS registry | SBT verified"
  },
  {
    id: "riotinto", name: "Rio Tinto", sector: "Aluminium", country: "Australia/UK",
    fy22: 31.2, fy23: 32.5, fy24: 31.8, fy25: 30.5, fy26: 29.2,
    emissionIntensity: 7.80, netZeroTarget: "2050 | 50% by 2030", color: "#8b5cf6",
    carbonMarket: "Not EU ETS — but CBAM exposed on exports", cbamStatus: "EXPOSED on EU aluminium exports",
    keyTech: "Elysis zero-carbon aluminium process. 100% renewable power for smelting. RecyclaLum.",
    annualInvestment: "$7.5B to 2030",
    insight: "GLOBAL BENCHMARK: 7.80 tCO₂/t. Indian aluminium (8.40-9.10) is 8-17% above. 100% renewable smelting is the path.",
    source: "Rio Tinto Climate Report 2022-23 | CDP A List | SBT verified"
  },
  {
    id: "olin", name: "Olin Corporation", sector: "Chloro-Alkali", country: "USA",
    fy22: 2.85, fy23: 2.92, fy24: 2.85, fy25: 2.78, fy26: 2.70,
    emissionIntensity: null, netZeroTarget: "2030 interim target", color: "#14b8a6",
    carbonMarket: "US market — no mandatory carbon price", cbamStatus: "US-based — minimal EU CBAM exposure",
    keyTech: "Advanced membrane cell electrolysis. Energy recovery systems. Process optimization.",
    annualInvestment: "$500M+ efficiency capex",
    insight: "GLOBAL BENCHMARK: Membrane cell technology reduces energy 15-20% vs diaphragm cell. Indian companies should adopt equivalent tech.",
    source: "Olin Corporation ESG Report 2022-23 | SBTi aligned"
  },
];

// ── Regulatory milestones ──────────────────────────────────────────────────
const REGULATIONS = [
  { name: "PAT Cycle VII", date: "FY2022-25", authority: "BEE", status: "ACTIVE", color: "#22c55e",
    requirement: "509 DCs notified with 6.627 MTOE saving target. All 12 Indian companies in model are DCs.",
    impact: "All 12 Indian companies must comply. ESCerts traded on IEX. Non-compliance: ₹10L fine + ₹10K/day." },
  { name: "EC Amendment Act 2022", date: "December 2022", authority: "MoPNG + BEE", status: "ACTIVE", color: "#22c55e",
    requirement: "CCTS framework established. ICM (Indian Carbon Market) to be launched. Replaces PAT with stronger carbon market.",
    impact: "CCTS will tighten enforcement and raise prices from FY24-25. Companies buying now at ₹800-1,000 should invest before prices reach ₹2,500-6,000." },
  { name: "SEBI BRSR Core", date: "FY 2022-23 onwards", authority: "SEBI", status: "ACTIVE", color: "#22c55e",
    requirement: "Mandatory externally-assured Scope 1/2/3 GHG disclosure for top 1000 listed companies.",
    impact: "All 12 Indian companies in model are listed and must file BRSR Core. Non-disclosure = SEBI action." },
  { name: "CBAM Transition Period", date: "Oct 2023 – Dec 2025", authority: "European Union", status: "ACTIVE", color: "#f59e0b",
    requirement: "Reporting obligation only — no financial charge. Companies must report embedded carbon in exports to EU.",
    impact: "Indian steel and aluminium exporters must report now. Prepare for full charges from January 2026." },
  { name: "CCTS / ICM Launch", date: "FY 2024-25", authority: "BEE + CERC", status: "LAUNCHING", color: "#3b82f6",
    requirement: "Indian Carbon Market operational. Carbon Credit Certificates (CCCs) tradeable on IEX, PXIL, HPX.",
    impact: "All 12 Indian DCs covered. Prices expected ₹1,000-1,500 at launch, rising to ₹2,500 by FY26." },
  { name: "CBAM Full Enforcement", date: "1 January 2026", authority: "European Union", status: "CRITICAL", color: "#dc2626",
    requirement: "Full financial charges on steel, aluminium, cement exports to EU at EU ETS price (~€62/tCO₂ = ~₹5,580/tonne).",
    impact: "Indian companies face ₹0.76 Cr (BPSL) to ₹81 Cr (RIL) per year in CBAM charges. Investment NOW reduces FY26+ CBAM cost." },
  { name: "PAT Cycle VIII", date: "FY 2025-26 onwards", authority: "BEE", status: "UPCOMING", color: "#8b5cf6",
    requirement: "New cycle with tighter targets expected. CCTS to run in parallel. Higher compliance costs for non-performers.",
    impact: "Companies that over-perform earn surplus credits to sell. Under-performers pay rising market price." },
  { name: "India Net Zero (NDC)", date: "2070 target", authority: "GoI", status: "FRAMEWORK", color: "#64748b",
    requirement: "Net Zero by 2070. Intermediate target: 45% emissions intensity reduction by 2030.",
    impact: "Long-term direction for all Indian industry. Companies with Net Zero plans are better positioned for investors." },
];

const CREDIT_PRICE_DATA = [
  { year: "FY22", escert: 400, ccts: null, euEts: null },
  { year: "FY23", escert: 800, ccts: null, euEts: 6200 },
  { year: "FY24", escert: 1000, ccts: null, euEts: 6750 },
  { year: "FY25", escert: null, ccts: 1500, euEts: 7200 },
  { year: "FY26", escert: null, ccts: 2500, euEts: 8100 },
  { year: "FY27", escert: null, ccts: 3000, euEts: 9900 },
  { year: "FY30", escert: null, ccts: 6000, euEts: 13500 },
];

const SECTORS = ["Iron & Steel", "Petrochemicals", "Aluminium", "Chloro-Alkali"];
const SECTOR_ICONS: Record<string, string> = {
  "Iron & Steel": "⚙", "Petrochemicals": "🛢", "Aluminium": "⚡", "Chloro-Alkali": "🧪",
};
const STRATEGY_CONFIG: Record<Strategy, { label: string; bg: string; text: string; border: string }> = {
  BUY:     { label: "BUY CREDITS",         bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300" },
  INVEST:  { label: "INVEST IN REDUCTION", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300" },
  COMPARE: { label: "COMPARE OPTIONS",     bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-300" },
  HYBRID:  { label: "HYBRID APPROACH",     bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
};
const COMPLIANCE_CONFIG: Record<Compliance, { bg: string; text: string; dot: string }> = {
  High:     { bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-500" },
  Moderate: { bg: "bg-amber-100",  text: "text-amber-600",  dot: "bg-amber-500" },
  Low:      { bg: "bg-green-100",  text: "text-green-600",  dot: "bg-green-500" },
};

function calcBuyCost(deficit: number, price: number) {
  return (deficit * 1000000 * price) / 10000000;
}
function getStrategy(co: Company, price: number): Strategy {
  if (calcBuyCost(co.escertDeficit, price) >= co.investCost) return "INVEST";
  if (co.strategy === "HYBRID") return "HYBRID";
  if (co.strategy === "COMPARE") return "COMPARE";
  return "BUY";
}

// ── Tooltip ──────────────────────────────────────────────────────────────
const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-lg">
      <p className="text-gray-500 font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Landing ──────────────────────────────────────────────────────────────
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-6">
      <div className={`max-w-3xl w-full text-center transition-all duration-1000 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          MBA Corporate Finance · FY 2022–2026 · Real Data
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight leading-tight">
          Carbon Credit<br /><span className="text-green-600">Intelligence Platform</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Real-data carbon compliance analysis for 12 Indian Designated Consumers across 4 sectors. PAT compliance · ESCert economics · CBAM exposure · FY22–FY26 trends.
        </p>
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { value: "12", label: "Indian DCs" },
            { value: "4", label: "Foreign Benchmarks" },
            { value: "FY22–26", label: "Data Range" },
            { value: "₹1,554 Cr", label: "Total Invest Cost" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-green-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {[
            { icon: "⚙", name: "Iron & Steel", cos: "Tata · JSW · Bhushan", color: "border-blue-300 bg-blue-50" },
            { icon: "🛢", name: "Petrochemicals", cos: "Reliance · IOC · BPCL", color: "border-amber-300 bg-amber-50" },
            { icon: "⚡", name: "Aluminium", cos: "Hindalco · Vedanta · NALCO", color: "border-purple-300 bg-purple-50" },
            { icon: "🧪", name: "Chloro-Alkali", cos: "DCW · GHCL · Grasim", color: "border-teal-300 bg-teal-50" },
          ].map(s => (
            <div key={s.name} className={`border rounded-xl px-4 py-3 text-left ${s.color}`}>
              <p className="text-xs font-bold text-gray-700 mb-0.5">{s.icon} {s.name}</p>
              <p className="text-xs text-gray-500">{s.cos}</p>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="bg-green-600 hover:bg-green-700 text-white font-bold text-base px-10 py-4 rounded-2xl transition-all shadow-lg hover:scale-105">
          Enter Platform →
        </button>
        <p className="text-gray-400 text-xs mt-4">FY 2022-23 base data · Excel v4 incorporated · Academic prototype</p>
      </div>
    </div>
  );
}

// ── Sensitivity Slider ───────────────────────────────────────────────────
function SensitivitySlider({ creditPrice, setCreditPrice }: { creditPrice: number; setCreditPrice: (v: number) => void }) {
  const MIN = 200; const MAX = 6000;
  const pct = ((creditPrice - MIN) / (MAX - MIN)) * 100;
  const getZone = (p: number) => {
    if (p <= 800)  return { label: "LOW — Current Market",  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" };
    if (p <= 2000) return { label: "MID — CCTS 2025",       color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" };
    if (p <= 4000) return { label: "HIGH — Projected 2027", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return               { label: "PEAK — Projected 2030", color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" };
  };
  const zone = getZone(creditPrice);
  return (
    <div className={`rounded-2xl border p-5 ${zone.bg} ${zone.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">🎚 Sensitivity — Carbon Credit Price</p>
          <p className="text-xs text-gray-400">Drag to see live cost changes across all companies</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${zone.color}`}>₹{creditPrice.toLocaleString()}</p>
          <p className="text-xs text-gray-400">per ESCert / tCO₂</p>
        </div>
      </div>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${zone.color} border ${zone.border} bg-white`}>{zone.label}</div>
      <input type="range" min={MIN} max={MAX} step={50} value={creditPrice}
        onChange={e => setCreditPrice(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer mb-2"
        style={{ background: `linear-gradient(to right, #16a34a 0%, #16a34a ${pct}%, #d1fae5 ${pct}%, #d1fae5 100%)` }}
      />
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>₹200</span><span>₹1,500</span><span>₹3,000</span><span>₹6,000</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[{ l: "₹800 (FY23)", v: 800 }, { l: "₹1,000 (FY24)", v: 1000 }, { l: "₹1,500 (FY25)", v: 1500 }, { l: "₹2,500 (FY26)", v: 2500 }, { l: "₹6,000 (FY30)", v: 6000 }].map(b => (
          <button key={b.v} onClick={() => setCreditPrice(b.v)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${creditPrice === b.v ? `${zone.color} ${zone.border} bg-white font-bold` : "text-gray-500 border-gray-200 bg-white hover:border-green-300"}`}>
            {b.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Live Cost Table ──────────────────────────────────────────────────────
function LiveCostTable({ companies, creditPrice }: { companies: Company[]; creditPrice: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
        <p className="text-xs font-bold text-green-700 uppercase tracking-widest">Live Cost Table — All Companies at ₹{creditPrice.toLocaleString()}/cert</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Company</th>
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Sector</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">Deficit (M)</th>
              <th className="text-right py-2 px-4 text-blue-600 font-bold">Buy (₹ Cr)</th>
              <th className="text-right py-2 px-4 text-green-600 font-bold">Invest (₹ Cr)</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">Break-Even</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">Decision</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((co, i) => {
              const buyCost = calcBuyCost(co.escertDeficit, creditPrice);
              const s = STRATEGY_CONFIG[getStrategy(co, creditPrice)];
              return (
                <tr key={co.id} className={`border-b border-gray-50 hover:bg-green-50/50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: co.color }} />
                      <span className="font-semibold text-gray-700">{co.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">{co.sector}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">{co.escertDeficit}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-600">₹{buyCost.toFixed(1)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-green-600">₹{co.investCost}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">₹{co.breakEvenPrice.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 border-t border-green-200">
              <td colSpan={3} className="py-2.5 px-4 text-xs font-bold text-gray-600">TOTAL (12 Indian DCs)</td>
              <td className="py-2.5 px-4 text-right font-bold text-blue-600">₹{companies.reduce((s, c) => s + calcBuyCost(c.escertDeficit, creditPrice), 0).toFixed(0)} Cr</td>
              <td className="py-2.5 px-4 text-right font-bold text-green-600">₹{companies.reduce((s, c) => s + c.investCost, 0).toFixed(0)} Cr</td>
              <td colSpan={2} className="py-2.5 px-4 text-center text-xs text-gray-500">{companies.filter(c => calcBuyCost(c.escertDeficit, creditPrice) >= c.investCost).length} companies → INVEST</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── FY22-26 Emission Tracker ─────────────────────────────────────────────
function EmissionTracker({ companies }: { companies: Company[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">📊 Emission Tracker — FY22 to FY26 (Mt CO₂)</p>
        <p className="text-xs text-gray-500 mt-0.5">[R]=Real published | [E]=Estimate | [P]=Projection</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Company</th>
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Sector</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">FY22 [R]</th>
              <th className="text-right py-2 px-4 text-blue-600 font-bold">FY23 [R]</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">FY24 [E]</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">FY25 [P]</th>
              <th className="text-right py-2 px-4 text-gray-500 font-semibold">FY26 [P]</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((co, i) => {
              const change = (((co.fy23 - co.fy22) / co.fy22) * 100).toFixed(1);
              const trend = co.fy26 < co.fy23 ? "📉 Reducing" : "📈 Rising";
              return (
                <tr key={co.id} className={`border-b border-gray-50 hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: co.color }} />
                      <span className="font-semibold text-gray-700">{co.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">{co.sector}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">{co.fy22}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-600">{co.fy23}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{co.fy24}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{co.fy25}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{co.fy26}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-green-600 font-medium">{trend}</span>
                    <span className="text-gray-400 ml-1">(+{change}% FY22-23)</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Year-by-Year Strategy Table ──────────────────────────────────────────
function YearByYearTable({ companies }: { companies: Company[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
        <p className="text-xs font-bold text-green-700 uppercase tracking-widest">📋 Year-by-Year Strategy — FY23 to FY26</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Company</th>
              <th className="text-left py-2 px-4 text-gray-500 font-semibold">Sector</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">FY23 @₹800</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">FY24 @₹1,000</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">FY25 @₹1,500</th>
              <th className="text-center py-2 px-4 text-gray-500 font-semibold">FY26 @₹2,500</th>
              <th className="text-right py-2 px-4 text-red-500 font-semibold">CBAM (₹Cr)</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((co, i) => {
              const renderStrategy = (s: Strategy) => {
                const cfg = STRATEGY_CONFIG[s];
                return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{s}</span>;
              };
              return (
                <tr key={co.id} className={`border-b border-gray-50 hover:bg-green-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: co.color }} />
                      <span className="font-semibold text-gray-700">{co.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">{co.sector}</td>
                  <td className="py-2.5 px-4 text-center">{renderStrategy(co.strategyFY23)}</td>
                  <td className="py-2.5 px-4 text-center">{renderStrategy(co.strategyFY24)}</td>
                  <td className="py-2.5 px-4 text-center">{renderStrategy(co.strategyFY25)}</td>
                  <td className="py-2.5 px-4 text-center">{renderStrategy(co.strategyFY26)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-red-500">₹{co.cbamExposure}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Breakeven Panel ──────────────────────────────────────────────────────
function BreakevenPanel({ companies, creditPrice }: { companies: Company[]; creditPrice: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Break-Even Analysis — When Does Investment Beat Buying?</p>
      <div className="space-y-2">
        {companies.map(co => {
          const wins = creditPrice >= co.breakEvenPrice;
          return (
            <div key={co.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${wins ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: co.color }} />
                <span className="text-xs font-semibold text-gray-700">{co.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">Break-even: <strong className="text-gray-700">₹{co.breakEvenPrice.toLocaleString()}/cert</strong></span>
                {wins ? <span className="text-green-600 font-bold">✓ INVEST WINS</span> : <span className="text-gray-400">BUY until ₹{co.breakEvenPrice.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Emission Trend Chart ─────────────────────────────────────────────────
function EmissionTrendChart({ co }: { co: Company }) {
  const data = [
    { year: "FY22", emissions: co.fy22, target: co.patTarget },
    { year: "FY23", emissions: co.fy23, target: co.patTarget },
    { year: "FY24", emissions: co.fy24, target: co.patTarget },
    { year: "FY25", emissions: co.fy25, target: co.patTarget },
    { year: "FY26", emissions: co.fy26, target: co.patTarget },
  ];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Emission Trend — FY22 to FY26</p>
          <p className="text-xs text-gray-400">Actual/projected vs PAT target (Mt CO₂)</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ backgroundColor: co.color }} /><span className="text-gray-500">Actual</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0 border-t-2 border-dashed border-red-400" /><span className="text-gray-500">PAT Target</span></div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${co.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={co.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={co.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<LightTooltip />} />
          <Area type="monotone" dataKey="emissions" name="Emissions" stroke={co.color} strokeWidth={2.5} fill={`url(#g-${co.id})`} dot={{ fill: co.color, r: 4 }} />
          <Line type="monotone" dataKey="target" name="PAT Target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center">
        {[{ label: "FY22", val: co.fy22 }, { label: "FY23", val: co.fy23 }, { label: "FY24 [E]", val: co.fy24 }, { label: "FY25 [P]", val: co.fy25 }, { label: "FY26 [P]", val: co.fy26 }].map(item => (
          <div key={item.label} className={`rounded-lg p-2 ${item.label === "FY23" ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className={`text-sm font-bold ${item.label === "FY23" ? "text-blue-600" : "text-gray-700"}`}>{item.val} Mt</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Credit Price Chart ───────────────────────────────────────────────────
function CreditPriceChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Carbon Credit Price Projection</p>
      <p className="text-xs text-gray-400 mb-4">Indian ESCert / CCTS vs EU ETS (₹/tCO₂) — Source: ICRA, WRI, IEA</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={CREDIT_PRICE_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<LightTooltip />} />
          <Legend wrapperStyle={{ color: "#6b7280", fontSize: 11 }} />
          <Line type="monotone" dataKey="escert" name="ESCert (IEX)" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 4 }} connectNulls={false} />
          <Line type="monotone" dataKey="ccts" name="CCTS Projected" stroke="#0284c7" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "#0284c7", r: 4 }} connectNulls={false} />
          <Line type="monotone" dataKey="euEts" name="EU ETS (₹)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sector Bar Chart ─────────────────────────────────────────────────────
function SectorBarChart({ companies }: { companies: Company[] }) {
  const data = companies.map(c => ({
    name: c.name.split(" ")[0],
    FY22: c.fy22, FY23: c.fy23, FY24: c.fy24, FY25: c.fy25, FY26: c.fy26,
    Target: c.patTarget
  }));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">FY22–FY26 Emissions vs PAT Target (Mt CO₂)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<LightTooltip />} />
          <Legend wrapperStyle={{ color: "#6b7280", fontSize: 11 }} />
          <Bar dataKey="FY23" name="FY23 (Real)" fill="#16a34a" radius={[3, 3, 0, 0]} opacity={0.9} />
          <Bar dataKey="FY26" name="FY26 (Proj)" fill="#0284c7" radius={[3, 3, 0, 0]} opacity={0.7} />
          <Bar dataKey="Target" name="PAT Target" fill="#d1d5db" radius={[3, 3, 0, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Company Dashboard ────────────────────────────────────────────────────
function CompanyDashboard({ co, creditPrice, setCreditPrice }: {
  co: Company; creditPrice: number; setCreditPrice: (v: number) => void;
}) {
  const s = STRATEGY_CONFIG[co.strategy];
  const c = COMPLIANCE_CONFIG[co.compliance];
  const buyCost = calcBuyCost(co.escertDeficit, creditPrice);
  const buyIsCheaper = buyCost < co.investCost;

  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: co.color }} />
      <div className="rounded-b-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{co.sector} · {co.country} · FY 2022-2026</p>
            <h2 className="text-2xl font-bold text-gray-800">{co.name}</h2>
            <p className="text-xs text-gray-400 mt-1">{co.source}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {co.isForeign && <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-100 text-blue-700 border-blue-300">🌍 Global Benchmark — NOT Indian PAT DC</span>}
            {!co.isForeign && <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>}
            {!co.isForeign && <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${c.bg} ${c.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{co.compliance} Compliance Pressure
            </span>}
            <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-full">Net Zero: {co.netZeroTarget}</span>
          </div>
        </div>

        {/* FY22-FY26 KPIs */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { label: "FY22", val: co.fy22, note: "Real", color: "text-gray-600" },
            { label: "FY23", val: co.fy23, note: "Real", color: "text-blue-600" },
            { label: "FY24", val: co.fy24, note: "Estimate", color: "text-gray-600" },
            { label: "FY25", val: co.fy25, note: "Projected", color: "text-gray-600" },
            { label: "FY26", val: co.fy26, note: "Projected", color: "text-green-600" },
          ].map(kpi => (
            <div key={kpi.label} className={`rounded-xl p-3 border text-center ${kpi.label === "FY23" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
              <p className="text-xs text-gray-400 mb-0.5">{kpi.label}</p>
              <p className={`text-base font-bold ${kpi.color}`}>{kpi.val} Mt</p>
              <p className="text-xs text-gray-400">{kpi.note}</p>
            </div>
          ))}
        </div>

        {/* Gap and deficit */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "PAT Target", value: `${co.patTarget} Mt`, color: "text-gray-700" },
            { label: "Gap FY23", value: `+${co.gap} Mt`, color: "text-red-600" },
            { label: "ESCert Deficit", value: `${co.escertDeficit}M`, color: "text-orange-600" },
            { label: "Break-Even Price", value: `₹${co.breakEvenPrice.toLocaleString()}`, color: "text-purple-600" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-400 mb-1">{kpi.label}</p>
              <p className={`text-base font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4"><EmissionTrendChart co={co} /></div>
        {!co.isForeign && <div className="mb-4"><SensitivitySlider creditPrice={creditPrice} setCreditPrice={setCreditPrice} /></div>}

        {/* Buy vs Invest — Indian DCs only */}
        {!co.isForeign && <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`rounded-xl p-4 border-2 ${buyIsCheaper ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-600 uppercase">Buy Credits</p>
              {buyIsCheaper && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">LOWER NOW</span>}
            </div>
            <p className={`text-2xl font-bold mb-1 ${buyIsCheaper ? "text-blue-600" : "text-gray-400"}`}>₹{buyCost.toFixed(1)} Cr</p>
            <p className="text-xs text-gray-400">{co.escertDeficit}M × ₹{creditPrice.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-4 border-2 ${!buyIsCheaper ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-600 uppercase">Invest in Reduction</p>
              {!buyIsCheaper && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">NOW CHEAPER</span>}
            </div>
            <p className={`text-2xl font-bold mb-1 ${!buyIsCheaper ? "text-green-600" : "text-gray-400"}`}>₹{co.investCost} Cr</p>
            <p className="text-xs text-gray-400">One-time capex · Payback ~{co.payback} yrs</p>
          </div>
        }

        {/* Year-by-year strategy — Indian DCs only */}
        {!co.isForeign && <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Year-by-Year Strategy (from Excel data)</p>
          <div className="grid grid-cols-4 gap-2">
            {[{ y: "FY23 @₹800", s: co.strategyFY23, cost: co.buyCostFY23 }, { y: "FY24 @₹1,000", s: co.strategyFY24, cost: co.buyCostFY24 }, { y: "FY25 @₹1,500", s: co.strategyFY25, cost: co.buyCostFY25 }, { y: "FY26 @₹2,500", s: co.strategyFY26, cost: co.buyCostFY26 }].map(item => {
              const cfg = STRATEGY_CONFIG[item.s];
              return (
                <div key={item.y} className={`rounded-lg p-3 border text-center ${cfg.bg} ${cfg.border}`}>
                  <p className="text-xs text-gray-500 mb-1">{item.y}</p>
                  <p className={`text-xs font-bold ${cfg.text}`}>{item.s}</p>
                  <p className="text-xs text-gray-500 mt-1">Buy: ₹{item.cost} Cr</p>
                </div>
              );
            })}
          </div>
        }

        <div className="space-y-3">
          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{co.isForeign ? "About This Company" : "Compliance & PAT Detail"}</p>
            <p className="text-sm text-gray-600">{co.complianceDetail}</p>
          </div>
          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{co.isForeign ? "CBAM Status" : "Carbon Credit Position"}</p>
            <p className="text-sm text-gray-600">{co.creditPosition}</p>
          </div>
          {!co.isForeign && <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Penalty Exposure</p>
              <p className="text-xs font-bold text-red-600">₹10L + ₹10K/day</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-center">
              <p className="text-xs text-gray-500 mb-1">CBAM 2026+</p>
              <p className="text-sm font-bold text-purple-600">~₹{co.cbamExposure} Cr/yr</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Key Technology</p>
              <p className="text-xs font-bold text-blue-600">{co.keyTechnology}</p>
            </div>
          </div>}
          {co.isForeign && <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Key Technology</p>
              <p className="text-xs font-bold text-blue-600">{co.keyTechnology}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Net Zero Target</p>
              <p className="text-xs font-bold text-green-600">{co.netZeroTarget}</p>
            </div>
          </div>}
          <div className="rounded-xl p-4 border border-green-200 bg-green-50">
            <p className="text-xs font-bold text-green-600 uppercase mb-2">🌍 Global Benchmark Insight</p>
            <p className="text-sm text-gray-700">{co.globalInsight}</p>
          </div>
          <div className="rounded-xl p-4 border-2" style={{ borderColor: co.color + "40", backgroundColor: co.color + "08" }}>
            <p className="text-xs font-bold uppercase mb-2" style={{ color: co.color }}>Final Recommendation — {s.label}</p>
            <p className="text-sm text-gray-700">{co.finalRec}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sector View ──────────────────────────────────────────────────────────
function SectorView({ sector, creditPrice, setCreditPrice }: {
  sector: string; creditPrice: number; setCreditPrice: (v: number) => void;
}) {
  const cos = COMPANIES.filter(c => c.sector === sector);
  const foreign = FOREIGN_BENCHMARKS.filter(b => b.sector === sector);
  const total = cos.reduce((s, c) => s + calcBuyCost(c.escertDeficit, creditPrice), 0);
  const investTotal = cos.reduce((s, c) => s + c.investCost, 0);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{SECTOR_ICONS[sector]} {sector} — Indian DCs</p>
        <h2 className="text-xl font-bold text-gray-800">Sector Overview</h2>
      </div>
      <div className="mb-5"><SensitivitySlider creditPrice={creditPrice} setCreditPrice={setCreditPrice} /></div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {cos.map(co => (
          <div key={co.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-xs font-bold mb-1 uppercase" style={{ color: co.color }}>{co.name}</p>
            <p className="text-lg font-bold text-blue-600">₹{calcBuyCost(co.escertDeficit, creditPrice).toFixed(1)} Cr</p>
            <p className="text-xs text-gray-400">credit buy cost</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex justify-between items-center mb-5">
        <div>
          <p className="text-xs text-gray-500 uppercase mb-0.5">Combined Buy Cost (Live)</p>
          <p className="text-xl font-bold text-gray-800">₹{total.toFixed(1)} Cr</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">vs Total Investment</p>
          <p className="text-lg font-bold text-green-600">₹{investTotal.toFixed(0)} Cr</p>
        </div>
      </div>
      {foreign.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-5">
          <p className="text-xs font-bold text-blue-700 uppercase mb-3">🌍 Global Benchmark — {foreign[0].name}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-gray-500">Intensity: <strong className="text-blue-700">{foreign[0].emissionIntensity ?? "N/A"} tCO₂/t</strong></p></div>
            <div><p className="text-gray-500">FY23: <strong className="text-blue-700">{foreign[0].fy23} Mt CO₂</strong></p></div>
            <div><p className="text-gray-500">Net Zero: <strong className="text-blue-700">{foreign[0].netZeroTarget}</strong></p></div>
            <div><p className="text-gray-500">CBAM: <strong className="text-blue-700">{foreign[0].cbamStatus}</strong></p></div>
          </div>
          <p className="text-xs text-blue-800 mt-2 font-medium">{foreign[0].insight}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 mb-5">
        <SectorBarChart companies={cos} />
        <CreditPriceChart />
      </div>
      <div className="mb-5"><LiveCostTable companies={cos} creditPrice={creditPrice} /></div>
      <div className="mb-5"><YearByYearTable companies={cos} /></div>
      <BreakevenPanel companies={cos} creditPrice={creditPrice} />
    </div>
  );
}

// ── Benchmarks Page ──────────────────────────────────────────────────────
function BenchmarksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🌍 Global Benchmarks</h1>
        <p className="text-gray-500 text-sm">4 international companies showing what Indian companies must achieve post-CBAM (January 2026)</p>
      </div>
      {/* FY22-FY26 Tracker */}
      <div className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm mb-6">
        <div className="px-4 py-3 border-b border-blue-100 bg-blue-50">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Global Benchmark — Emission Tracker FY22–FY26</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2 px-4 text-gray-500">Company</th>
                <th className="text-left py-2 px-4 text-gray-500">Sector</th>
                <th className="text-right py-2 px-4 text-gray-500">FY22</th>
                <th className="text-right py-2 px-4 text-blue-600 font-bold">FY23</th>
                <th className="text-right py-2 px-4 text-gray-500">FY24</th>
                <th className="text-right py-2 px-4 text-gray-500">FY25</th>
                <th className="text-right py-2 px-4 text-gray-500">FY26</th>
                <th className="text-right py-2 px-4 text-gray-500">Intensity</th>
              </tr>
            </thead>
            <tbody>
              {FOREIGN_BENCHMARKS.map((b, i) => (
                <tr key={b.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="font-semibold text-gray-700">{b.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">{b.sector}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">{b.fy22}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-600">{b.fy23}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{b.fy24}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{b.fy25}</td>
                  <td className="py-2.5 px-4 text-right text-gray-500">{b.fy26}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-green-600">{b.emissionIntensity ?? "N/A"} tCO₂/t</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-4">
        {FOREIGN_BENCHMARKS.map(b => (
          <div key={b.id} className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                  <h3 className="text-lg font-bold text-gray-800">{b.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">🌍 Foreign Benchmark</span>
                </div>
                <p className="text-xs text-gray-500">{b.country} · {b.sector}</p>
              </div>
              <div className="text-right">
                {b.emissionIntensity && <p className="text-xl font-bold text-blue-600">{b.emissionIntensity} tCO₂/t</p>}
                <p className="text-xs text-gray-400">Emission intensity FY23</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 mb-1 font-semibold uppercase">Carbon Market</p>
                <p className="text-gray-700">{b.carbonMarket}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 mb-1 font-semibold uppercase">CBAM Status</p>
                <p className="text-gray-700">{b.cbamStatus}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 mb-1 font-semibold uppercase">Key Technology</p>
                <p className="text-gray-700">{b.keyTech}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 mb-1 font-semibold uppercase">Annual Investment</p>
                <p className="text-green-700 font-bold">{b.annualInvestment}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-1">Key Insight for Indian Companies</p>
              <p className="text-sm text-gray-700">{b.insight}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">Source: {b.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Regulation Page ──────────────────────────────────────────────────────
function RegulationPage() {
  const priceData = [
    { period: "FY22", low: 200, base: 400, high: 800 },
    { period: "FY23", low: 400, base: 800, high: 1200 },
    { period: "FY24", low: 600, base: 1000, high: 1500 },
    { period: "FY25", low: 800, base: 1500, high: 2500 },
    { period: "FY26", low: 1500, base: 2500, high: 4000 },
    { period: "FY27", low: 2500, base: 3000, high: 5000 },
    { period: "FY30", low: 4000, base: 6000, high: 8000 },
  ];
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">⚖ Regulatory Framework</h1>
        <p className="text-gray-500 text-sm">Carbon price scenarios FY22–FY30 and key regulatory milestones</p>
      </div>
      {/* Price scenarios chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Carbon Credit Price Scenarios (₹/cert) — Low / Base / High</p>
        <p className="text-xs text-gray-400 mb-4">Source: IEX actual (FY22-23) | WRI simulation (FY24) | ICRA + NITI Aayog projections (FY25+)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={priceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<LightTooltip />} />
            <Legend wrapperStyle={{ color: "#6b7280", fontSize: 11 }} />
            <Line type="monotone" dataKey="high" name="High Scenario" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="base" name="Base Scenario" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 4 }} />
            <Line type="monotone" dataKey="low" name="Low Scenario" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Price table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm mb-6">
        <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
          <p className="text-xs font-bold text-green-700 uppercase">Price Scenario Table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              {["Period", "Market", "Low (₹)", "Base (₹)", "High (₹)", "EU ETS (₹)", "Status"].map(h => (
                <th key={h} className="text-left py-2 px-4 text-gray-500 font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                { period: "FY22", market: "ESCert IEX", low: 200, base: 400, high: 800, euEts: "—", status: "REAL", color: "bg-green-50" },
                { period: "FY23", market: "ESCert IEX", low: 400, base: 800, high: 1200, euEts: "₹6,200", status: "REAL", color: "bg-green-50" },
                { period: "FY24", market: "ESCert + CCTS", low: 600, base: 1000, high: 1500, euEts: "₹6,750", status: "ESTIMATE", color: "bg-blue-50" },
                { period: "FY25", market: "CCTS launch", low: 800, base: 1500, high: 2500, euEts: "₹7,200", status: "PROJECTED", color: "bg-amber-50" },
                { period: "FY26", market: "CCTS mature", low: 1500, base: 2500, high: 4000, euEts: "₹8,100", status: "PROJECTED", color: "bg-orange-50" },
                { period: "FY27", market: "CCTS", low: 2500, base: 3000, high: 5000, euEts: "₹9,900", status: "PROJECTED", color: "bg-red-50" },
                { period: "FY30", market: "CCTS mature", low: 4000, base: 6000, high: 8000, euEts: "₹13,500", status: "PROJECTED", color: "bg-red-50" },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-gray-50 ${row.color}`}>
                  <td className="py-2 px-4 font-bold text-gray-700">{row.period}</td>
                  <td className="py-2 px-4 text-gray-500">{row.market}</td>
                  <td className="py-2 px-4 text-blue-600 font-semibold">₹{row.low.toLocaleString()}</td>
                  <td className="py-2 px-4 text-green-600 font-bold">₹{row.base.toLocaleString()}</td>
                  <td className="py-2 px-4 text-red-600 font-semibold">₹{row.high.toLocaleString()}</td>
                  <td className="py-2 px-4 text-amber-600">{row.euEts}</td>
                  <td className="py-2 px-4"><span className="text-xs font-bold text-gray-500">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Regulatory milestones */}
      <div className="space-y-3">
        {REGULATIONS.map(r => {
          const statusColors: Record<string, string> = {
            ACTIVE: "bg-green-100 text-green-700 border-green-300",
            LAUNCHING: "bg-blue-100 text-blue-700 border-blue-300",
            CRITICAL: "bg-red-100 text-red-700 border-red-300",
            UPCOMING: "bg-purple-100 text-purple-700 border-purple-300",
            FRAMEWORK: "bg-gray-100 text-gray-600 border-gray-300",
          };
          return (
            <div key={r.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 mb-0.5">{r.name}</h3>
                  <p className="text-xs text-gray-500">{r.date} · {r.authority}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[r.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>{r.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-semibold text-gray-500 uppercase mb-1">Requirement</p>
                  <p className="text-gray-700">{r.requirement}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="font-semibold text-green-600 uppercase mb-1">Impact on Indian Companies</p>
                  <p className="text-gray-700">{r.impact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Data Sources Page ────────────────────────────────────────────────────
function DataSourcesPage() {
  const DATA_SOURCES = [
    {
      category: "Company Reports (12 Indian DCs)", color: "#16a34a",
      items: [
        { name: "Tata Steel", doc: "Integrated Annual Report & BRSR 2022-23", data: "Scope 1 GHG: 49.6 Mt, intensity 2.48 tCO₂/tcs" },
        { name: "JSW Steel", doc: "Integrated Report & ESG Disclosures 2022-23", data: "Intensity 2.31 tCO₂/tcs, Project SEED, CDP A" },
        { name: "Reliance Industries", doc: "ESG & Sustainability Report 2022-23", data: "52.8 Mt CO₂, Net Zero 2035 commitment" },
        { name: "Indian Oil Corporation", doc: "Sustainability Report 2022-23", data: "21.3 Mt CO₂, 30% renewable target 2030" },
        { name: "Bharat Petroleum", doc: "Annual Report 2022-23", data: "14.7 Mt CO₂, refinery operations" },
        { name: "Hindalco Industries", doc: "Sustainability Report 2022-23", data: "28.4 Mt CO₂, intensity 8.40 tCO₂/tonne" },
        { name: "Vedanta Limited", doc: "ESG Report 2022-23", data: "24.6 Mt CO₂, intensity 9.10 tCO₂/tonne" },
        { name: "NALCO", doc: "Annual Report 2022-23", data: "11.2 Mt CO₂, PSU coal captive power" },
        { name: "DCW, GHCL, Grasim", doc: "Annual/Sustainability Reports 2022-23", data: "0.82, 0.95, 3.80 Mt CO₂ respectively" },
      ],
    },
    {
      category: "Indian Regulatory Sources", color: "#0284c7",
      items: [
        { name: "Bureau of Energy Efficiency (BEE)", doc: "PAT Scheme Cycle V, VI, VII Notifications", data: "DC targets, ESCert rules, SEC methodology" },
        { name: "Ministry of Power, GoI", doc: "Energy Conservation Act 2001 (amended 2022)", data: "Penalty: ₹10L first offence + ₹10K/day, CCTS framework" },
        { name: "Indian Energy Exchange (IEX)", doc: "ESCert Market Data 2017–2024", data: "ESCert traded prices ₹200–₹1,200, trading volumes" },
        { name: "SEBI", doc: "BRSR Circular 2021, BRSR Core Framework 2023", data: "Mandatory Scope 1/2/3 for top 1000 listed companies" },
        { name: "ICRA Research", doc: "Indian Carbon Market Outlook 2024", data: "Price projections ₹1,500–₹2,500 (2025), ₹4,000–₹8,000 (2030)" },
        { name: "Prayas Energy Group", doc: "Not a PAT on the back, yet — 2023", data: "51% ESCert purchase rate, enforcement gaps" },
      ],
    },
    {
      category: "International & Carbon Market Sources", color: "#7c3aed",
      items: [
        { name: "European Union", doc: "CBAM Regulation 2023/956", data: "CBAM scope, timeline, Jan 2026 enforcement" },
        { name: "WRI India", doc: "Indian Carbon Market Simulation 2024", data: "CCTS clearing price simulation ₹800/tCO₂ base" },
        { name: "NITI Aayog", doc: "Carbon Pricing & Low Carbon Transition 2023", data: "Sector decarbonisation capex benchmarks" },
        { name: "ArcelorMittal", doc: "Sustainability Report 2022-23 | CDP A List", data: "151.4 Mt CO₂, intensity 1.89 tCO₂/tcs, XCarb" },
        { name: "BASF SE", doc: "Integrated Report 2022-23 | EU ETS registry", data: "20.2 Mt CO₂, €4B decarbonisation investment" },
        { name: "Rio Tinto", doc: "Climate Report 2022-23 | CDP A List", data: "32.5 Mt CO₂, Elysis process, 100% renewable target" },
        { name: "Olin Corporation", doc: "ESG Report 2022-23 | SBTi aligned", data: "2.92 Mt CO₂, membrane cell technology" },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📚 Data Sources</h1>
        <p className="text-gray-500 text-sm">All data sourced from real published company reports, Indian regulatory bodies, and internationally recognised carbon market research.</p>
      </div>
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-bold text-amber-700 uppercase mb-2">⚠ Academic Disclaimer</p>
        <p className="text-sm text-gray-700">This platform is a prototype for MBA Corporate Finance academic purposes. Emission figures are estimates derived from published intensity × production. ESCert prices based on IEX historical data. All FY24–FY26 figures are projections. Not for investment decisions without independent verification.</p>
      </div>
      <div className="space-y-5">
        {DATA_SOURCES.map(cat => (
          <div key={cat.category} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <h2 className="text-sm font-bold text-gray-700">{cat.category}</h2>
              <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full ml-auto">{cat.items.length} sources</span>
            </div>
            <div className="divide-y divide-gray-50">
              {cat.items.map((item, i) => (
                <div key={i} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-bold text-gray-700 mb-0.5">{item.name}</p>
                  <p className="text-xs text-gray-400 italic mb-0.5">{item.doc}</p>
                  <p className="text-xs text-gray-600">{item.data}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat Panel ───────────────────────────────────────────────────────────
const CHAT_SUGGESTIONS = [
  { category: "Companies", questions: ["Tata Steel FY22-26 trend", "JSW Steel strategy", "Reliance CBAM exposure", "Hindalco vs Rio Tinto"] },
  { category: "Finance", questions: ["What is NPV?", "Explain break-even", "What is WACC?", "Green bond example"] },
  { category: "Regulations", questions: ["What is PAT scheme?", "Explain CBAM 2026", "What is ESCert?", "What is CCTS?"] },
  { category: "Market", questions: ["Carbon price FY30 projection", "EU ETS vs Indian CCTS", "What is IEX?", "CBAM full enforcement date"] },
];

function ChatPanel({ open }: { open: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hello! I am your Carbon Credit Intelligence AI Assistant. Ask me anything about the 12 Indian companies, FY22-26 emission trends, PAT scheme, CBAM, ESCerts, NPV, green bonds, or any carbon finance topic." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [apiMessages, setApiMessages] = useState<{ role: string; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || typing) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTyping(true);
    const newApiMessages = [...apiMessages, { role: "user", content: userMsg }];
    setApiMessages(newApiMessages);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newApiMessages }),
      });
      const data = await response.json();
      const reply = data.reply || "Sorry, I could not get a response. Please try again.";
      setMessages(m => [...m, { role: "bot", text: reply }]);
      setApiMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Connection error. Please check your internet and try again." }]);
    }
    setTyping(false);
  };

  if (!open) return null;
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-40 shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-green-50">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Carbon AI Assistant</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-800">Powered by Claude AI</p>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-200 shadow-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-400 flex items-center gap-2 shadow-sm">
              <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-1 mb-2 overflow-x-auto">
          {CHAT_SUGGESTIONS.map((cat, i) => (
            <button key={cat.category} onClick={() => setActiveCategory(i)}
              className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 transition-colors ${activeCategory === i ? "bg-green-600 text-white font-bold" : "text-gray-500 hover:text-gray-700 border border-gray-200 bg-white"}`}>
              {cat.category}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {CHAT_SUGGESTIONS[activeCategory].questions.map(q => (
            <button key={q} onClick={() => send(q)}
              className="text-xs text-gray-500 border border-gray-200 bg-white px-2 py-1 rounded-lg hover:text-gray-800 hover:border-green-300 transition-colors text-left">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button onClick={() => send()} disabled={typing}
            className={`text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors ${typing ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [creditPrice, setCreditPrice] = useState(1000);

  const handleSearch = () => {
    const q = searchVal.toLowerCase().trim();
    setSearchErr("");
    const found = COMPANIES.find(c =>
      c.name.toLowerCase().includes(q) || c.id.includes(q) ||
      (c.id === "ioc" && q.includes("indian oil")) ||
      (c.id === "bpcl" && q.includes("bharat"))
    );
    if (found) { setActiveCompany(found); setActiveSector(found.sector); setView("company"); }
    else if (q) setSearchErr("Not found. Try: Tata Steel, JSW Steel, Reliance, Hindalco...");
  };

  const FOREIGN_AS_COMPANIES: Company[] = FOREIGN_BENCHMARKS.map(b => ({
    id: b.id, name: b.name, sector: b.sector, country: b.country, isForeign: true,
    fy22: b.fy22, fy23: b.fy23, fy24: b.fy24, fy25: b.fy25, fy26: b.fy26,
    emissionIntensity: b.emissionIntensity ?? 0,
    patTarget: 0, gap: 0, compliance: "Moderate" as Compliance,
    escertDeficit: 0, investCost: 0, payback: 0,
    buyCostFY23: 0, buyCostFY24: 0, buyCostFY25: 0, buyCostFY26: 0, breakEvenPrice: 0,
    cbamExposure: 0, strategy: "INVEST" as Strategy,
    strategyFY23: "INVEST" as Strategy, strategyFY24: "INVEST" as Strategy,
    strategyFY25: "INVEST" as Strategy, strategyFY26: "INVEST" as Strategy,
    strategyDetail: b.keyTech,
    complianceDetail: `${b.name} is a foreign benchmark company based in ${b.country}. NOT subject to Indian PAT scheme. Data from published sustainability reports.`,
    creditPosition: b.cbamStatus,
    finalRec: b.insight,
    netZeroTarget: b.netZeroTarget, keyTechnology: b.keyTech, globalInsight: b.insight,
    color: b.color, source: b.source,
  }));
  const ALL_COMPANIES: Company[] = [...COMPANIES, ...FOREIGN_AS_COMPANIES];
  const sectorCompanies = activeSector ? ALL_COMPANIES.filter(c => c.sector === activeSector) : [];

  if (view === "landing") return <LandingPage onEnter={() => setView("home")} />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-green-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">CC</span>
            </div>
            <span className="text-gray-800 font-bold text-sm">CCIP</span>
          </div>
          <p className="text-gray-500 text-xs">Carbon Credit Intelligence</p>
        </div>
        <div className="p-3 border-b border-gray-100 bg-blue-50">
          <p className="text-xs text-gray-500 mb-1">Live Credit Price</p>
          <p className="text-base font-bold text-green-600">₹{creditPrice.toLocaleString()}</p>
          <p className="text-xs text-gray-400">per ESCert/tCO₂</p>
        </div>
        <div className="p-3 border-b border-gray-100 space-y-1">
          {[
            { label: "🏠 Dashboard", v: "home" as View },
            { label: "📊 Emission Tracker", v: "tracker" as View },
            { label: "🌍 Global Benchmarks", v: "benchmarks" as View },
            { label: "⚖ Regulations", v: "regulation" as View },
            { label: "📚 Data Sources", v: "sources" as View },
          ].map(item => (
            <button key={item.v} onClick={() => { setView(item.v); setActiveSector(null); setActiveCompany(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${view === item.v && !activeSector ? "bg-green-100 text-green-700 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 px-2">Industries</p>
          {SECTORS.map(sector => {
            const isActive = activeSector === sector;
            const scos = ALL_COMPANIES.filter(c => c.sector === sector);
            return (
              <div key={sector} className="mb-1">
                <button onClick={() => { setActiveSector(sector); setActiveCompany(null); setView("sector"); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${isActive ? "bg-green-100 text-green-700 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <span>{SECTOR_ICONS[sector]} {sector}</span>
                  <span className="text-gray-400">{scos.length}</span>                </button>
                {isActive && scos.map(co => (
                  <button key={co.id} onClick={() => { setActiveCompany(co); setView("company"); }}
                    className={`w-full text-left pl-7 pr-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${activeCompany?.id === co.id ? "text-green-700 font-semibold" : "text-gray-400 hover:text-gray-700"}`}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: co.color }} />
                    {co.name}
                    {co.isForeign && <span className="text-blue-500 ml-auto">🌍</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => setChatOpen(o => !o)}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${chatOpen ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}>
            💬 {chatOpen ? "Close" : "Open"} AI Chat
          </button>
        </div>
      </div>

      {/* Main */}
      <div className={`flex-1 overflow-y-auto transition-all ${chatOpen ? "mr-80" : ""}`}>
        <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="cursor-pointer hover:text-gray-700" onClick={() => { setView("home"); setActiveSector(null); setActiveCompany(null); }}>Dashboard</span>
            {activeSector && view !== "sources" && view !== "benchmarks" && view !== "regulation" && view !== "tracker" && (
              <><span>→</span><span className="cursor-pointer hover:text-gray-700" onClick={() => { setView("sector"); setActiveCompany(null); }}>{activeSector}</span></>
            )}
            {activeCompany && <><span>→</span><span className="text-gray-700">{activeCompany.name}</span></>}
            {view === "sources" && <><span>→</span><span className="text-gray-700">Data Sources</span></>}
            {view === "benchmarks" && <><span>→</span><span className="text-gray-700">Global Benchmarks</span></>}
            {view === "regulation" && <><span>→</span><span className="text-gray-700">Regulations</span></>}
            {view === "tracker" && <><span>→</span><span className="text-gray-700">Emission Tracker</span></>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Price:</span>
            <span className="text-xs font-bold text-green-600">₹{creditPrice.toLocaleString()}</span>
            <input type="range" min={200} max={6000} step={50} value={creditPrice}
              onChange={e => setCreditPrice(Number(e.target.value))}
              className="w-24 h-1.5 rounded-full appearance-none cursor-pointer bg-green-100" />
            <span className="text-xs text-gray-400 border border-gray-200 bg-white px-2 py-1 rounded-full">FY22–26 · 12 Companies</span>
          </div>
        </nav>

        <div className="px-6 py-8">
          {view === "sources" && <DataSourcesPage />}
          {view === "benchmarks" && <BenchmarksPage />}
          {view === "regulation" && <RegulationPage />}
          {view === "tracker" && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Emission Tracker — FY22 to FY26</h1>
                <p className="text-gray-500 text-sm">All 12 Indian DCs + 4 Foreign Benchmarks</p>
              </div>
              <EmissionTracker companies={COMPANIES} />
              <div className="mt-6"><YearByYearTable companies={COMPANIES} /></div>
            </div>
          )}

          {view === "home" && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">
                  Carbon Credit Intelligence<span className="text-green-600"> Platform</span>
                </h1>
                <p className="text-gray-500 text-base max-w-xl mx-auto">Real-data carbon compliance analysis. FY22–FY26 data from Excel v4. Drag slider, explore sectors, check global benchmarks.</p>
              </div>
              <div className="w-full max-w-xl mx-auto mb-8">
                <div className="flex gap-2">
                  <input className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                    placeholder="Search any company — Tata Steel, Reliance, Hindalco..."
                    value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()} />
                  <button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm">Analyze</button>
                </div>
                {searchErr && <p className="mt-2 text-sm text-red-500 pl-1">{searchErr}</p>}
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Emissions FY23", value: `${COMPANIES.reduce((s, c) => s + c.fy23, 0).toFixed(0)} Mt`, sub: "12 Indian DCs", color: "text-blue-600" },
                  { label: "Total ESCert Deficit", value: `${COMPANIES.reduce((s, c) => s + c.escertDeficit, 0).toFixed(2)}M`, sub: "certificates needed", color: "text-orange-600" },
                  { label: "Total Invest Cost", value: `₹1,554 Cr`, sub: "all 12 DCs combined", color: "text-green-600" },
                  { label: "Total CBAM Exposure", value: `₹189 Cr`, sub: "per year from 2026", color: "text-red-600" },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6"><SensitivitySlider creditPrice={creditPrice} setCreditPrice={setCreditPrice} /></div>
              <div className="mb-6"><LiveCostTable companies={COMPANIES} creditPrice={creditPrice} /></div>
              <div className="mb-6"><YearByYearTable companies={COMPANIES} /></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <CreditPriceChart />
                <BreakevenPanel companies={COMPANIES} creditPrice={creditPrice} />
              </div>

              {/* Sector tiles */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {SECTORS.map(sector => {
                  const cos = ALL_COMPANIES.filter(c => c.sector === sector);
                  const indianCos = COMPANIES.filter(c => c.sector === sector);
                  const totalGap = indianCos.reduce((s, c) => s + c.gap, 0);
                  const totalCost = indianCos.reduce((s, c) => s + calcBuyCost(c.escertDeficit, creditPrice), 0);
                  const foreign = FOREIGN_BENCHMARKS.filter(b => b.sector === sector)[0];
                  return (
                    <button key={sector}
                      onClick={() => { setActiveSector(sector); setView("sector"); setActiveCompany(null); }}
                      className="rounded-2xl border border-gray-200 bg-white p-5 text-left hover:border-green-300 hover:shadow-md transition-all group shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{SECTOR_ICONS[sector]}</span>
                        <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">{indianCos.length} Indian + 🌍 1</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-800 mb-1">{sector}</h3>
                      <p className="text-xs text-gray-500 mb-3">{cos.map(c => c.name).join(" · ")}</p>
                      {foreign && <p className="text-xs text-blue-600 mb-3">🌍 Benchmark: {foreign.name}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">FY23 Gap</p>
                          <p className="text-sm font-bold text-red-500">{totalGap.toFixed(1)} Mt</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">Buy Cost</p>
                          <p className="text-sm font-bold text-blue-600">₹{totalCost.toFixed(0)} Cr</p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-3 group-hover:text-green-700">View sector →</p>
                    </button>
                  );
                })}
              </div>

              {/* Quick access */}
              <div className="text-center mb-6">
                <p className="text-xs text-gray-400 mb-3">Quick access — 12 Indian DCs + 4 Global Benchmarks</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {ALL_COMPANIES.map(co => (
                    <button key={co.id}
                      onClick={() => { setActiveCompany(co); setActiveSector(co.sector); setView("company"); }}
                      className={`border text-xs font-medium px-3 py-1.5 rounded-full transition-colors shadow-sm ${co.isForeign ? "border-blue-300 bg-blue-50 text-blue-600 hover:border-blue-400 hover:text-blue-800" : "border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-700"}`}>
                      {co.isForeign && "🌍 "}{co.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">Carbon Credit Intelligence Platform · MBA Corporate Finance · FY 2022-2026 · Academic prototype</p>
                <div className="flex justify-center gap-4 mt-2">
                  {[{ l: "Data Sources →", v: "sources" as View }, { l: "Global Benchmarks →", v: "benchmarks" as View }, { l: "Regulations →", v: "regulation" as View }].map(item => (
                    <button key={item.v} onClick={() => setView(item.v)} className="text-xs text-green-600 hover:text-green-700">{item.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "sector" && activeSector && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{SECTOR_ICONS[activeSector]} {activeSector}</h2>
                  <p className="text-sm text-gray-400 mt-1">Click a company for full FY22-26 analysis</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sectorCompanies.map(co => (
                    <button key={co.id} onClick={() => { setActiveCompany(co); setView("company"); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-green-700 hover:border-green-300 shadow-sm">
                      {co.name}
                    </button>
                  ))}
                </div>
              </div>
              <SectorView sector={activeSector} creditPrice={creditPrice} setCreditPrice={setCreditPrice} />
            </div>
          )}

          {view === "company" && activeCompany && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 flex gap-2 flex-wrap">
                {sectorCompanies.map(co => (
                  <button key={co.id} onClick={() => setActiveCompany(co)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors shadow-sm ${activeCompany.id === co.id ? "border-green-400 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-white hover:text-gray-800"}`}>
                    {co.name}
                  </button>
                ))}
              </div>
              <CompanyDashboard co={activeCompany} creditPrice={creditPrice} setCreditPrice={setCreditPrice} />
            </div>
          )}
        </div>
      </div>

      <ChatPanel open={chatOpen} />
    </div>
  );
}