# mcp-worldbank-poverty

World Bank Poverty and Inequality Platform (PIP) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Worldbank Poverty data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
