# Base DeFi Yield Optimizer API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://base-defi.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Base chain DeFi yields -- Aerodrome LP, Moonwell lending, top farms ranked by APY with TVL and risk. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "base-defi": {
      "url": "https://base-defi.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl "https://base-defi.api.klymax402.com/api/opportunities"
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `base_get_defi_opportunities` | GET | `/api/opportunities` | $0.003 | Get DeFi yield opportunities on Base chain |

### `base_get_defi_opportunities`

Use this when you need DeFi yield opportunities specifically on Base chain. Returns Base-native protocol yields in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `protocol` | string | no | Filter by protocol: 'all', 'aerodrome', or 'moonwell'. Defaults to 'all'. |

**Returns**

- `opportunities` -- array of yield farms ranked by APY
- `protocol` -- protocol name (Aerodrome, Moonwell)
- `pool` -- pool name and token pair
- `apy` -- current annual percentage yield
- `tvl` -- total value locked in USD
- `riskScore` -- risk rating (1-10, lower is safer)
- `type` -- yield type (LP, lending, staking)

Example response:

```json
{"opportunities":[{"protocol":"Aerodrome","pool":"USDC/WETH","apy":18.5,"tvl":45000000,"riskScore":3,"type":"LP"},{"protocol":"Moonwell","pool":"USDC Lending","apy":5.2,"tvl":120000000,"riskScore":1,"type":"lending"}],"chain":"base","totalPools":12}
```

**When to use**: deploying capital on Base chain specifically. Curated list of vetted Base-native protocols only.

**Not for**: swap quotes on Base (use `dex_get_swap_quote`), liquidation risk (use `defi_get_liquidation_levels`).

## Example agent prompts

- "DeFi yield opportunities specifically on Base chain"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
