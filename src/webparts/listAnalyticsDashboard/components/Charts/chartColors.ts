/**
 * Colors sourced from a validated categorical palette (fixed adjacency order,
 * CVD-checked). See the dataviz design reference for how these were derived -
 * a "chart color theme" only rotates the starting hue, it never reorders or
 * substitutes hues, so the validated adjacency distances are preserved.
 */
export type ChartAccent = 'blue' | 'aqua' | 'violet' | 'orange';

interface IHueSlot {
  light: string;
  dark: string;
}

const CATEGORICAL_ORDER: IHueSlot[] = [
  { light: '#2a78d6', dark: '#3987e5' }, // blue
  { light: '#1baf7a', dark: '#199e70' }, // aqua
  { light: '#eda100', dark: '#c98500' }, // yellow
  { light: '#008300', dark: '#008300' }, // green
  { light: '#4a3aa7', dark: '#9085e9' }, // violet
  { light: '#e34948', dark: '#e66767' }, // red
  { light: '#e87ba4', dark: '#d55181' }, // magenta
  { light: '#eb6834', dark: '#d95926' } // orange
];

const ACCENT_START_INDEX: Record<ChartAccent, number> = {
  blue: 0,
  aqua: 1,
  violet: 4,
  orange: 7
};

export const CHART_ACCENT_OPTIONS: { key: ChartAccent; text: string }[] = [
  { key: 'blue', text: 'Blue (default)' },
  { key: 'aqua', text: 'Aqua' },
  { key: 'violet', text: 'Violet' },
  { key: 'orange', text: 'Orange' }
];

/** Rotates the fixed hue cycle so `accent` leads - adjacency (and CVD distance) is unaffected by where the cycle starts. */
export function getCategoricalPalette(accent: ChartAccent, isDarkTheme: boolean): string[] {
  const startIndex = ACCENT_START_INDEX[accent];
  const rotated = [...CATEGORICAL_ORDER.slice(startIndex), ...CATEGORICAL_ORDER.slice(0, startIndex)];
  return rotated.map(slot => (isDarkTheme ? slot.dark : slot.light));
}

export function getAccentColor(accent: ChartAccent, isDarkTheme: boolean): string {
  return getCategoricalPalette(accent, isDarkTheme)[0];
}

/** Stable color-by-label lookup so filtering (which can drop labels) never repaints the survivors. */
export function buildColorMap(labels: string[], accent: ChartAccent, isDarkTheme: boolean): Map<string, string> {
  const palette = getCategoricalPalette(accent, isDarkTheme);
  const map = new Map<string, string>();
  labels.forEach((label, index) => {
    map.set(label, palette[index % palette.length]);
  });
  return map;
}

const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
  muted: '#898781'
};

const GOOD_KEYWORDS = ['complet', 'done', 'closed', 'resolved', 'approved'];
const CRITICAL_KEYWORDS = ['blocked', 'cancel', 'rejected', 'overdue'];
const WARNING_KEYWORDS = ['hold', 'pending', 'waiting', 'review'];
const MUTED_KEYWORDS = ['not started', 'new', 'open', 'unspecified'];

function matchesKeyword(value: string, keywords: string[]): boolean {
  const lower = value.toLowerCase();
  return keywords.some(keyword => lower.indexOf(keyword) !== -1);
}

/**
 * Status is a state, not an identity, so it gets the reserved semantic
 * palette rather than the categorical one. Recognized keywords (matching most
 * common SharePoint "Status" choice values) map to good/warning/critical/muted;
 * anything else falls back to a stable categorical color by domain position so
 * unfamiliar choice values still stay visually consistent.
 */
export function getStatusColor(status: string, domainIndex: number, accent: ChartAccent, isDarkTheme: boolean): string {
  if (matchesKeyword(status, GOOD_KEYWORDS)) {
    return STATUS_COLORS.good;
  }
  if (matchesKeyword(status, CRITICAL_KEYWORDS)) {
    return STATUS_COLORS.critical;
  }
  if (matchesKeyword(status, WARNING_KEYWORDS)) {
    return STATUS_COLORS.warning;
  }
  if (matchesKeyword(status, MUTED_KEYWORDS)) {
    return STATUS_COLORS.muted;
  }
  const palette = getCategoricalPalette(accent, isDarkTheme);
  return palette[domainIndex % palette.length];
}

export const CHART_CHROME = {
  surface: { light: '#fcfcfb', dark: '#1a1a19' },
  ink: {
    primary: { light: '#0b0b0b', dark: '#ffffff' },
    secondary: { light: '#52514e', dark: '#c3c2b7' },
    muted: '#898781'
  },
  grid: { light: '#e1e0d9', dark: '#2c2c2a' },
  baseline: { light: '#c3c2b7', dark: '#383835' }
};

export function chromeFor(isDarkTheme: boolean): {
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  grid: string;
  baseline: string;
} {
  return {
    surface: isDarkTheme ? CHART_CHROME.surface.dark : CHART_CHROME.surface.light,
    textPrimary: isDarkTheme ? CHART_CHROME.ink.primary.dark : CHART_CHROME.ink.primary.light,
    textSecondary: isDarkTheme ? CHART_CHROME.ink.secondary.dark : CHART_CHROME.ink.secondary.light,
    textMuted: CHART_CHROME.ink.muted,
    grid: isDarkTheme ? CHART_CHROME.grid.dark : CHART_CHROME.grid.light,
    baseline: isDarkTheme ? CHART_CHROME.baseline.dark : CHART_CHROME.baseline.light
  };
}
