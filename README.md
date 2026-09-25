# mcp-worldbank-poverty

World Bank Poverty and Inequality Platform (PIP) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_poverty` | Official World Bank poverty & inequality estimates for a country (or all countries). Returns poverty headcount, poverty gap, poverty severity, Gini, mean & median welfare (income or consumption, $/day in 2017 PPP), income deciles, and population in poverty. Use povline to pick the international line: 2.15 (extreme poverty), 3.65 (lower-middle-income), 6.85 (upper-middle-income). |
| `get_poverty_regional` | Aggregated World Bank poverty estimates at the regional/group level (not per-country). Returns headcount, poverty gap, mean welfare, and total population in poverty for each group. group_by controls the aggregation: "wb" = World Bank geographic regions, "inc" = income groups (HIC/UMIC/LMIC/LIC), "none" = global total. |
| `list_reference` | Reference / metadata for the PIP dataset. table="versions" lists available data releases & PPP rounds; table="aux_list" lists all auxiliary tables; any other value (e.g. "countries", "regions", "poverty_lines", "indicators", "dictionary") returns that auxiliary table. Use to look up valid country codes, region mappings, or supported indicators. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "worldbank-poverty": {
      "url": "https://gateway.pipeworx.io/worldbank-poverty/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/worldbank-poverty/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/get_poverty \
  -H 'Content-Type: application/json' \
  -d '{"country":"IND","year":"2020","povline":2.15}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/get_poverty`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "worldbank-poverty": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-worldbank-poverty"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-worldbank-poverty
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Worldbank Poverty data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
