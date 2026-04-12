import type { Hono } from "hono";

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

const DEFILLAMA_POOLS = "https://yields.llama.fi/pools";

interface Opportunity {
  protocol: string;
  project: string;
  pool: string;
  symbol: string;
  apyBase: number;
  apyReward: number;
  apyTotal: number;
  tvlUsd: number;
  stablecoin: boolean;
  ilRisk: string;
  rewardTokens: string[];
  riskScore: "low" | "medium" | "high";
  poolMeta: string | null;
}

function getRiskScore(tvl: number): "low" | "medium" | "high" {
  if (tvl >= 10_000_000) return "low";
  if (tvl >= 1_000_000) return "medium";
  return "high";
}

function getIlRisk(symbol: string, stablecoin: boolean): string {
  if (stablecoin) return "none (stablecoin)";
  // Check for correlated pairs
  const s = symbol.toUpperCase();
  if (s.includes("ETH") && s.includes("WETH")) return "low (correlated)";
  if (s.includes("USDC") && s.includes("USDbC")) return "none (stablecoin)";
  return "moderate (volatile pair)";
}

async function fetchBaseOpportunities(protocolFilter: string): Promise<Opportunity[]> {
  const cacheKey = `base_defi_${protocolFilter}`;
  const cached = getCached<Opportunity[]>(cacheKey);
  if (cached) return cached;

  const resp = await fetch(DEFILLAMA_POOLS);
  if (!resp.ok) {
    throw new Error(`DeFiLlama API error: ${resp.status} ${resp.statusText}`);
  }

  const data: any = await resp.json();
  let pools: any[] = data?.data || [];

  // Filter for Base chain
  pools = pools.filter((p: any) => p.chain === "Base");

  // Apply protocol filter
  if (protocolFilter === "aerodrome") {
    pools = pools.filter((p: any) =>
      p.project?.toLowerCase().includes("aerodrome")
    );
  } else if (protocolFilter === "moonwell") {
    pools = pools.filter((p: any) =>
      p.project?.toLowerCase().includes("moonwell")
    );
  }

  // Sort by APY descending
  pools.sort((a: any, b: any) => {
    const apyA = (a.apy || 0);
    const apyB = (b.apy || 0);
    return apyB - apyA;
  });

  // Take top 20
  const top20 = pools.slice(0, 20);

  const results: Opportunity[] = top20.map((p: any) => {
    const tvl = p.tvlUsd || 0;
    const isStable = p.stablecoin === true;
    const symbol = p.symbol || "";

    return {
      protocol: p.project || "unknown",
      project: p.project || "unknown",
      pool: p.pool || "",
      symbol,
      apyBase: parseFloat((p.apyBase || 0).toFixed(2)),
      apyReward: parseFloat((p.apyReward || 0).toFixed(2)),
      apyTotal: parseFloat((p.apy || 0).toFixed(2)),
      tvlUsd: Math.round(tvl),
      stablecoin: isStable,
      ilRisk: getIlRisk(symbol, isStable),
      rewardTokens: p.rewardTokens || [],
      riskScore: getRiskScore(tvl),
      poolMeta: p.poolMeta || null,
    };
  });

  setCache(cacheKey, results);
  return results;
}

export function registerRoutes(app: Hono) {
  app.get("/api/opportunities", async (c) => {
    const protocol = (c.req.query("protocol") || "all").toLowerCase();

    if (!["all", "aerodrome", "moonwell"].includes(protocol)) {
      return c.json({ error: "Invalid protocol. Use 'all', 'aerodrome', or 'moonwell'." }, 400);
    }

    try {
      const opportunities = await fetchBaseOpportunities(protocol);

      if (opportunities.length === 0) {
        return c.json({
          chain: "base",
          protocol,
          results: 0,
          opportunities: [],
          message: "No yield opportunities found. DeFiLlama data may be temporarily unavailable.",
        });
      }

      const avgApy = parseFloat(
        (opportunities.reduce((s, o) => s + o.apyTotal, 0) / opportunities.length).toFixed(2)
      );
      const totalTvl = opportunities.reduce((s, o) => s + o.tvlUsd, 0);

      return c.json({
        chain: "base",
        protocol,
        results: opportunities.length,
        avgApy,
        totalTvl: `$${totalTvl.toLocaleString()}`,
        cachedFor: "5m",
        timestamp: new Date().toISOString(),
        opportunities,
      });
    } catch (err: any) {
      return c.json({ error: "Failed to fetch DeFi opportunities", details: err.message }, 502);
    }
  });
}
