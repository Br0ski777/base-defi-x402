import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "base-defi",
  slug: "base-defi",
  description: "Base chain DeFi yields -- Aerodrome LP, Moonwell lending, top farms ranked by APY with TVL and risk.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/opportunities",
      price: "$0.003",
      description: "Get DeFi yield opportunities on Base chain",
      toolName: "base_get_defi_opportunities",
      toolDescription: `Use this when you need DeFi yield opportunities specifically on Base chain. Returns Base-native protocol yields in JSON.

1. opportunities: array of yield farms ranked by APY
2. protocol: protocol name (Aerodrome, Moonwell)
3. pool: pool name and token pair
4. apy: current annual percentage yield
5. tvl: total value locked in USD
6. riskScore: risk rating (1-10, lower is safer)
7. type: yield type (LP, lending, staking)

Example output: {"opportunities":[{"protocol":"Aerodrome","pool":"USDC/WETH","apy":18.5,"tvl":45000000,"riskScore":3,"type":"LP"},{"protocol":"Moonwell","pool":"USDC Lending","apy":5.2,"tvl":120000000,"riskScore":1,"type":"lending"}],"chain":"base","totalPools":12}

Use this FOR deploying capital on Base chain specifically. Curated list of vetted Base-native protocols only.

Do NOT use for multi-chain yields -- use defi_find_best_yields instead. Do NOT use for swap quotes on Base -- use dex_get_swap_quote instead. Do NOT use for liquidation risk -- use defi_get_liquidation_levels instead.`,
      inputSchema: {
        type: "object",
        properties: {
          protocol: {
            type: "string",
            description: "Filter by protocol: 'all', 'aerodrome', or 'moonwell'. Defaults to 'all'.",
            enum: ["all", "aerodrome", "moonwell"],
          },
        },
        required: [],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "chain": {
              "type": "string",
              "description": "Chain name (base)"
            },
            "protocol": {
              "type": "string",
              "description": "Protocol filter applied"
            },
            "results": {
              "type": "number",
              "description": "Number of opportunities returned"
            },
            "avgApy": {
              "type": "number",
              "description": "Average APY across results"
            },
            "totalTvl": {
              "type": "string",
              "description": "Total TVL formatted"
            },
            "opportunities": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "protocol": {
                    "type": "string"
                  },
                  "pool": {
                    "type": "string"
                  },
                  "apyTotal": {
                    "type": "number"
                  },
                  "tvlUsd": {
                    "type": "number"
                  }
                }
              }
            },
            "timestamp": {
              "type": "string"
            }
          },
          "required": [
            "chain",
            "results",
            "opportunities"
          ]
        },
    },
  ],
};
