import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "base-defi",
  slug: "base-defi",
  description: "Base chain DeFi yield opportunities from Aerodrome, Moonwell, and more.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/opportunities",
      price: "$0.003",
      description: "Get DeFi yield opportunities on Base chain",
      toolName: "base_get_defi_opportunities",
      toolDescription: "Use this when you need DeFi yield opportunities specifically on Base chain. Returns Aerodrome LP pools, Moonwell lending rates, and top yield farms ranked by APY with TVL and risk scores. Do NOT use for multi-chain yields — use defi_find_best_yields. Do NOT use for swap quotes — use dex_get_swap_quote.",
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
    },
  ],
};
