# SPFx Portfolio

This solution contains independently deployable SharePoint Framework web parts:

- **List Analytics Dashboard** - a configurable, cross-filtered analytics dashboard for up to three SharePoint lists.
- **Request & Approval Hub** - an operational request queue with SLA indicators, request submission, triage filters, drill-in details, and approval actions.
- **Project Health Board** - a delivery portfolio view for project health, milestones, risk triage, and action ownership.
- **Employee Onboarding Command Center** - a personalized first-week experience with actionable tasks, progress, buddy support, and task-level help.
- **Knowledge Discovery Hub** - a search-first knowledge experience with promoted answers, freshness signals, and useful-result feedback.

## Knowledge Discovery Hub

The Knowledge Discovery Hub helps employees find a trustworthy answer without
having to know where it lives. It includes searchable demo content, topic-led
browsing, promoted answers, ownership and freshness signals, result feedback,
empty and loading states, and a focused detail view. Mock data is enabled by
default; its `useMockData` seam is ready for Microsoft Search or Microsoft
Graph results, permissions trimming, source links, and a real feedback flow.

## Employee Onboarding Command Center

The Employee Onboarding Command Center is a high-polish workflow demo for the
first week at a new organization. It deliberately makes the next best action,
task ownership, time commitment, support route, and progress visible in one
place. The included demo data is interactive: filter by task type, open a task,
mark it complete, or request help. In a tenant implementation, its task,
profile, and resource seams can be backed by SharePoint Lists, Microsoft Graph,
and Power Automate.

## Request & Approval Hub

The Request & Approval Hub is a portfolio workflow demo that ships with a populated in-memory request queue. Users can create requests, filter the queue, inspect each request, assign it to service operations, and approve or reject it. The mock-data property provides a clear extension point for wiring the interface to SharePoint lists or Power Automate approvals in a tenant implementation.

# List Analytics Dashboard

A SharePoint Framework (SPFx) web part that aggregates data from up to three
SharePoint lists into a single filterable analytics dashboard: a bar chart of
items by status, an area chart of items created over time, and a donut chart
of items by category/assignee - all cross-filtered together, with click-through
drill-down into the underlying list items.

Built as a portfolio/demo piece, so it ships with a **mock data mode** that
generates realistic, populated data client-side - no live tenant required to
see it working end to end.

## Tech stack

- SPFx 1.23.x, React 17, TypeScript
- [PnPjs v3](https://pnp.github.io/pnpjs/) (`@pnp/sp`) for SharePoint REST access
- [Recharts](https://recharts.org/) for the bar / area / donut charts
- Fluent UI React (v8) for controls and layout
- [`@pnp/spfx-property-controls`](https://pnp.github.io/sp-dev-fx-property-controls/) for the property pane's list picker and date picker fields

## Features

- **Configurable data sources** - pick 1-3 SharePoint lists from the property
  pane (a real list picker, not a free-text GUID field) instead of a hardcoded
  list name.
- **Cross-filtering** - a date range and multi-select Status/Category/Assigned-to
  dropdowns filter all three charts simultaneously.
- **Drill-down** - click a bar, a donut slice, or a point on the timeline to
  open a panel with a `DetailsList` of exactly the items behind that segment.
- **Mock data mode** - a toggle in the property pane (on by default) that
  generates ~250 realistic items spread across three virtual lists (IT
  Helpdesk Tickets, Facility Requests, HR Onboarding Tasks), so the web part
  looks populated with zero setup.
- **Loading / empty / error states** - a spinner while loading, distinct empty
  states for "no lists configured" vs. "filters exclude everything", and an
  error state that distinguishes "list not found" from "access denied" from a
  generic failure, each with a retry action.
- **Responsive** - the chart grid wraps with flexbox, so it reads fine in a
  1/3, 2/3, or full-width web part zone.
- **Light/dark theme aware** via `supportsThemeVariants` and a CVD-checked
  color palette that adapts to the SharePoint theme.

## Project structure

```
src/webparts/listAnalyticsDashboard/
  ListAnalyticsDashboardWebPart.ts     Web part shell + property pane
  models/                              Shared TypeScript interfaces
  services/
    IDataService.ts                    Data source contract
    MockDataService.ts                 Seeded, realistic mock data generator
    SharePointDataService.ts           PnPjs v3 query + normalization + error classification
    DataServiceFactory.ts              Picks mock vs. live based on web part property
    aggregations.ts / dataUtils.ts     Client-side filtering & chart aggregation
  components/
    ListAnalyticsDashboard.tsx         Container: data fetching, filter state, layout
    FilterBar/                         Date range + Status/Category/Assignee dropdowns
    Charts/                            StatusBarChart, TimelineAreaChart, CategoryDonutChart, ChartCard, palette
    DetailPanel/                       Drill-down Panel + DetailsList
    StatusStates/                     Loading / Empty / Error components
```

## Setup

```bash
npm install
npm run start        # heft start --clean, opens the local workbench
```

The dev server serves `https://localhost:4321/temp/workbench.html` (or launches
the tenant-hosted workbench if you set `SPFX_SERVE_TENANT_DOMAIN`). Add the web
part from the toolbox - it defaults to mock data mode, so you'll see a
populated dashboard immediately.

To build a deployable package:

```bash
npm run build         # heft test --clean --production && heft package-solution --production
```

This produces `sharepoint/solution/spfx-portfolio.sppkg`, ready to upload to
an App Catalog.

## Toggling mock data mode (for demos/recordings)

Mock data is **on by default** so the web part is fully demoable without a
tenant. To point it at real SharePoint lists instead:

1. Edit the web part -> open the property pane.
2. Turn **"Use mock/demo data"** off.
3. Pick a **Primary list** (required) and, optionally, a **second** and
   **third list** - these use the real SharePoint list picker, so you're
   choosing from actual lists on the current site, not typing a GUID.
4. Optionally set a **default date range** and a **chart color theme**.

Switching the toggle back on immediately swaps back to generated mock data -
useful for a demo/recording where you want a guaranteed populated view
regardless of what's in the tenant.

### Expected list schema (live SharePoint mode)

`SharePointDataService` queries each configured list for these columns, all
optional except `Title`/`Created` (SharePoint defaults):

| Column       | Type              | Falls back to  |
| ------------ | ----------------- | -------------- |
| `Title`      | Single line text  | `(no title)`   |
| `Status`     | Choice            | `Unspecified`  |
| `Category`   | Choice            | `Uncategorized`|
| `AssignedTo` | Person            | `Unassigned`   |
| `Created`    | built-in          | -              |

This matches common tracking lists (helpdesk tickets, task lists, change
requests). If your list uses different column names, adjust the `$select`
list and `normalizeItem` mapping in `SharePointDataService.ts`.

## Data-loading strategy

The **default date range** (property pane) bounds the initial SharePoint query
via an OData `$filter` on `Created`, so the web part never pulls an entire
unfiltered list. Widening the date range in the filter bar beyond what's
already been fetched triggers a re-query; narrowing it, or changing the
Status/Category/Assignee dropdowns, filters the already-fetched dataset
client-side with no extra round trip. A manual **Refresh data** button forces
a re-fetch (and regenerates mock data, in mock mode).

## Notes

- `@pnp/spfx-property-controls` bundles its own copy of
  `@microsoft/sp-component-base` at a slightly different patch version than
  the one this solution installs, which trips up TypeScript's structural
  typing for the `context` prop passed into `PropertyFieldListPicker`. This is
  worked around with a single narrow type cast in
  `ListAnalyticsDashboardWebPart.ts` (commented inline) - it's a type-only
  mismatch, not a runtime one.
- Chart colors come from a colorblind-checked categorical palette; the
  "chart color theme" property only rotates which hue leads (blue/aqua/violet/orange)
  and never reorders or invents new hues, so the validated color-distance
  guarantees hold regardless of the chosen theme.
