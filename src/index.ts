interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * World Bank Poverty and Inequality Platform (PIP) MCP.
 *
 * Official World Bank global poverty & inequality estimates. Headcount poverty
 * rates at the international lines ($2.15 extreme / $3.65 lower-middle-income /
 * $6.85 upper-middle-income, all $/day in 2017 PPP), poverty gap, Gini,
 * mean & median income/consumption, and income deciles — at the country and
 * World Bank regional/aggregate level. Keyless, no auth.
 *
 * Base: https://api.worldbank.org/pip/v1
 * Countries are ISO3 codes (e.g. BRA, IND) or "all". poverty_line/povline is $/day.
 */


const BASE = 'https://api.worldbank.org/pip/v1';
const UA = 'pipeworx-mcp-worldbank-poverty/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_poverty',
    description:
      'Official World Bank poverty & inequality estimates for a country (or all countries). ' +
      'Returns poverty headcount, poverty gap, poverty severity, Gini, mean & median welfare ' +
      '(income or consumption, $/day in 2017 PPP), income deciles, and population in poverty. ' +
      'Use povline to pick the international line: 2.15 (extreme poverty), 3.65 (lower-middle-income), ' +
      '6.85 (upper-middle-income).',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'ISO3 country code (e.g. "BRA", "IND", "NGA") or "all" for every country. Default "all".',
        },
        year: {
          type: 'string',
          description: 'Reporting year (e.g. "2020") or "all" for the full time series. Default "all".',
        },
        povline: {
          type: 'number',
          description: 'Poverty line in $/day (2017 PPP). Common values: 2.15, 3.65, 6.85. Default 2.15.',
        },
        fill_gaps: {
          type: 'boolean',
          description: 'If true, interpolate/extrapolate estimates for years without a survey. Default false (survey years only).',
        },
      },
    },
  },
  {
    name: 'get_poverty_regional',
    description:
      'Aggregated World Bank poverty estimates at the regional/group level (not per-country). ' +
      'Returns headcount, poverty gap, mean welfare, and total population in poverty for each group. ' +
      'group_by controls the aggregation: "wb" = World Bank geographic regions, "inc" = income groups (HIC/UMIC/LMIC/LIC), "none" = global total.',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'string',
          description: 'Reporting year (e.g. "2020") or "all". Default "all".',
        },
        povline: {
          type: 'number',
          description: 'Poverty line in $/day (2017 PPP). Common values: 2.15, 3.65, 6.85. Default 2.15.',
        },
        group_by: {
          type: 'string',
          enum: ['wb', 'inc', 'none'],
          description: 'Aggregation: "wb" geographic regions, "inc" income groups, "none" global total. Default "wb".',
        },
      },
    },
  },
  {
    name: 'list_reference',
    description:
      'Reference / metadata for the PIP dataset. table="versions" lists available data releases & PPP rounds; ' +
      'table="aux_list" lists all auxiliary tables; any other value (e.g. "countries", "regions", "poverty_lines", ' +
      '"indicators", "dictionary") returns that auxiliary table. Use to look up valid country codes, region mappings, or supported indicators.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: '"versions", "aux_list", or an auxiliary table name like "countries" | "regions" | "poverty_lines" | "indicators" | "dictionary". Default "versions".',
        },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_poverty': {
      const qs = new URLSearchParams({ format: 'json' });
      qs.set('country', strArg(args.country, 'all'));
      qs.set('year', strArg(args.year, 'all'));
      qs.set('povline', numArg(args.povline, 2.15));
      if (args.fill_gaps === true) qs.set('fill_gaps', 'true');
      return pipGet(`/pip?${qs.toString()}`);
    }
    case 'get_poverty_regional': {
      const qs = new URLSearchParams({ format: 'json' });
      qs.set('year', strArg(args.year, 'all'));
      qs.set('povline', numArg(args.povline, 2.15));
      qs.set('group_by', strArg(args.group_by, 'wb'));
      return pipGet(`/pip-grp?${qs.toString()}`);
    }
    case 'list_reference': {
      const table = strArg(args.table, 'versions');
      if (table === 'versions') return pipGet('/versions?format=json');
      if (table === 'aux_list') return pipGet('/aux');
      return pipGet(`/aux?table=${encodeURIComponent(table)}&format=json`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function pipGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`World Bank PIP: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

function strArg(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function numArg(v: unknown, fallback: number): string {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return String(Number(v));
  return String(fallback);
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
