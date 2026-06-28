process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { tavily } from "@tavily/core";

// ── Node 1: Search ──
async function searchNode(company: string) {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });
  const [news, financials, overview] = await Promise.all([
    tvly.search(`${company} latest news 2025`, { maxResults: 4 }),
    tvly.search(`${company} revenue profit financial results`, { maxResults: 4 }),
    tvly.search(`${company} market position competitors`, { maxResults: 4 }),
  ]);
  return {
    newsData: news.results.map((r: any) => r.content).join("\n").slice(0, 1500),
    financialData: financials.results.map((r: any) => r.content).join("\n").slice(0, 1500),
    overviewData: overview.results.map((r: any) => r.content).join("\n").slice(0, 1500),
  };
}

// ── Node 2: Analyze (LangChain PromptTemplate + Groq direct) ──
async function analyzeNode(company: string, newsData: string, financialData: string, overviewData: string) {
  // LangChain PromptTemplate for formatting
  const prompt = PromptTemplate.fromTemplate(`You are an expert investment analyst. Analyze {company}.

RECENT NEWS: {newsData}
FINANCIAL DATA: {financialData}
COMPANY OVERVIEW: {overviewData}

Respond with ONLY valid JSON:
{{
  "company": "{company}",
  "verdict": "INVEST or PASS based on analysis",
  "confidence": <0-100, be specific: strong companies 80-90, weak 30-50, medium 55-75>,
  "summary": "2-3 sentence summary",
  "financials": {{
    "revenue": "data or N/A",
    "growth": "data or N/A",
    "profitability": "data or N/A",
    "debt": "data or N/A"
  }},
  "pros": ["strength 1", "strength 2", "strength 3"],
  "cons": ["weakness 1", "weakness 2", "weakness 3"],
  "risks": ["risk 1", "risk 2"],
  "marketPosition": "description",
  "recentNews": ["news 1", "news 2", "news 3"],
  "recommendation": "detailed recommendation"
}}`);

  // Format prompt using LangChain
  const formattedPrompt = await prompt.format({ company, newsData, financialData, overviewData });

  // Call Groq directly (reliable)
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
      messages: [
        { role: "system", content: "You are an expert investment analyst. Always respond with valid JSON only." },
        { role: "user", content: formattedPrompt },
      ],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Node 3: Score + Validate ──
function scoreNode(company: string, rawAnalysis: string) {
  const cleaned = rawAnalysis.replace(/```json|```/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      company, verdict: "PASS", confidence: 50, summary: rawAnalysis,
      financials: { revenue: "N/A", growth: "N/A", profitability: "N/A", debt: "N/A" },
      pros: [], cons: [], risks: [], marketPosition: "N/A", recentNews: [], recommendation: rawAnalysis,
    };
  }
  const report = JSON.parse(jsonMatch[0]);
  report.confidence = Math.min(100, Math.max(0, Number(report.confidence) || 75));
  report.verdict = ["INVEST", "PASS"].includes(report.verdict) ? report.verdict : "PASS";
  return report;
}

export async function POST(req: NextRequest) {
  try {
    const { company } = await req.json();
    if (!company) return NextResponse.json({ error: "Company name required" }, { status: 400 });

    console.log(`🔍 Node 1: Searching ${company}...`);
    const { newsData, financialData, overviewData } = await searchNode(company);

    console.log(`🤖 Node 2: LangChain analyzing...`);
    const rawAnalysis = await analyzeNode(company, newsData, financialData, overviewData);

    console.log(`📊 Node 3: Scoring...`);
    const report = scoreNode(company, rawAnalysis);

    console.log(`✅ Verdict: ${report.verdict}`);
    return NextResponse.json({ success: true, report });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}