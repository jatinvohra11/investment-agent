# InvestIQ — AI Investment Research Agent

> Built by **Jatin Vohra** for InsideIIM × Altuni AI Labs Assignment

InvestIQ is an AI-powered investment research agent that takes a company name, autonomously researches it using live web data, and delivers a structured INVEST or PASS verdict with full reasoning — in seconds.

**Live Demo:** _[Add Vercel link after deployment]_

---

## Overview

InvestIQ runs a 3-node AI pipeline:

1. **Search Node** — Tavily searches 3 parallel queries: latest news, financials, market position
2. **Analyze Node** — LangChain `PromptTemplate` formats the research, Groq LLaMA 3.3 70B generates structured analysis
3. **Score Node** — Parses, validates, and structures the final JSON report

The result is a rich investment report with verdict, confidence score, financials, strengths, weaknesses, risks, news, charts, and a final recommendation.

---

## How to Run

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd investment-agent

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

Get your keys:
- **Groq** (free): https://console.groq.com
- **Tavily** (free): https://app.tavily.com

### Run

```bash
npm run dev
```

Open http://localhost:3000

---

## How It Works — Architecture
User Input (Company Name)

│

▼

┌─────────────────────┐

│   Node 1: SEARCH    │  ← Tavily SDK

│  3 parallel queries │     • Latest news 2025

│  news + financials  │     • Revenue & profit data

│  + market position  │     • Market & competitors

└─────────┬───────────┘

│

▼

┌─────────────────────┐

│   Node 2: ANALYZE   │  ← LangChain PromptTemplate

│  LangChain formats  │     + Groq LLaMA 3.3 70B

│  prompt + LLM call  │     • Structures all research

│  generates JSON     │     • Generates investment view

└─────────┬───────────┘

│

▼

┌─────────────────────┐

│   Node 3: SCORE     │  ← Custom validator

│  Parse + validate   │     • Clamps confidence 0-100

│  JSON report        │     • Validates verdict field

└─────────┬───────────┘

│

▼

Final Report (JSON)

→ React UI renders

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| AI Orchestration | LangChain.js (`@langchain/core`) |
| LLM | Groq — LLaMA 3.3 70B Versatile |
| Web Research | Tavily Search API |
| Charts | Recharts |
| Deployment | Vercel |

---

## Key Decisions & Trade-offs

### What I chose

**Groq + LLaMA 3.3 70B** over OpenAI/Anthropic
- Free tier, extremely fast inference (~2s response)
- LLaMA 3.3 70B gives high-quality structured JSON output

**Tavily** for web search
- Purpose-built for AI agents — returns clean, structured content
- 3 parallel searches (Promise.all) for speed

**LangChain `PromptTemplate`** for prompt management
- Clean variable injection: `{company}`, `{newsData}`, etc.
- Easy to modify and maintain prompts

**Direct Groq API fetch** instead of `@langchain/groq`
- `@langchain/groq` v1.x requires `@langchain/core` v1.x
- Our other LangChain packages need `@langchain/core` v0.3.x
- Same functionality, no version conflict

### What I left out

- **LangGraph** — version conflict with `@langchain/core` v0.3.x in Node.js 26. Architecture is LangGraph-inspired (3 explicit nodes) but implemented as sequential async functions.
- **Real stock price data** — would need paid APIs (Alpha Vantage, Yahoo Finance). Using AI-generated trend projections instead.
- **User authentication** — out of scope for MVP
- **Report PDF export** — planned but deprioritized

---

## Example Runs

### 1. Google — INVEST (75% confidence)
> "Google is a dominant player in the technology industry with a strong track record of innovation and financial performance. Revenue of $422.49 billion USD with 11.5% growth."

- Revenue: $422.49B | Growth: 11.5% YoY
- Strengths: Search dominance, Cloud growth, AI leadership
- Risks: Regulatory pressure, Ad revenue dependency

### 2. Tesla — INVEST (75% confidence)
> "Tesla is a leading electric vehicle company despite challenges in 2025. Better-than-expected Q4 earnings and new 'Redwood' mass-market EV in production."

- Revenue: $94.8B | Growth: -3% YoY
- Strengths: Brand, Supercharger network, Energy storage
- Risks: Competition from BYD, Margin pressure

### 3. TCS — INVEST (75% confidence)
> "TCS is a strong player in IT services with robust operating margins. 25.3% operating margin and 19.4% net margin despite layoffs."

- Revenue: $7,621 crore | Growth: 1.5% QoQ
- Strengths: Client diversity, Digital transformation leader
- Risks: Global slowdown, Visa restrictions

---

## What I Would Improve With More Time

1. **LangGraph integration** — proper multi-node stateful graph once version conflicts resolve with Node.js 26
2. **Real stock data** — integrate Alpha Vantage or NSE API for actual price charts
3. **PDF report export** — downloadable professional investment report
4. **Company comparison** — analyze 2 companies side by side
5. **Search history** — save and revisit past analyses
6. **Streaming responses** — show AI analysis word by word as it generates
7. **Sector benchmarking** — compare company vs industry averages
8. **Better confidence scoring** — multi-factor algorithm instead of LLM-generated number

---

## Project Structure
investment-agent/

├── app/

│   ├── page.tsx              # Main UI (search, loading, results)

│   ├── api/

│   │   └── research/

│   │       └── route.ts      # 3-node AI pipeline

│   ├── layout.tsx

│   └── globals.css

├── .env.local                # API keys (not committed)

├── next.config.ts

└── package.json

---

_Built with Next.js, LangChain.js, Groq LLaMA 3.3, and Tavily Search_