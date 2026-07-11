import { IListItem } from '../models/IListItem';
import { IAggregates, IDimensionCount, IStatusCount, ITimelinePoint } from '../models/IAggregates';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}`;
}

function countBy(items: IListItem[], selector: (item: IListItem) => string): IDimensionCount[] {
  const counts = new Map<string, number>();
  items.forEach(item => {
    const label = selector(item);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildTimeline(items: IListItem[]): ITimelinePoint[] {
  if (items.length === 0) {
    return [];
  }

  const sorted = [...items].sort((a, b) => a.created.getTime() - b.created.getTime());
  const firstOrdinal = sorted[0].created.getFullYear() * 12 + sorted[0].created.getMonth();
  const lastItem = sorted[sorted.length - 1].created;
  const lastOrdinal = lastItem.getFullYear() * 12 + lastItem.getMonth();

  const buckets = new Map<string, ITimelinePoint>();
  for (let ordinal = firstOrdinal; ordinal <= lastOrdinal; ordinal++) {
    const year = Math.floor(ordinal / 12);
    const month = ordinal % 12;
    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + 1, 0, 23, 59, 59);
    buckets.set(monthKey(periodStart), {
      periodKey: monthKey(periodStart),
      periodLabel: `${MONTH_LABELS[month]} ${year}`,
      periodStart,
      periodEnd,
      count: 0
    });
  }

  items.forEach(item => {
    const key = monthKey(item.created);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
    }
  });

  return Array.from(buckets.values());
}

export function buildAggregates(items: IListItem[]): IAggregates {
  const statusCounts: IStatusCount[] = countBy(items, i => i.status).map(c => ({
    status: c.label,
    count: c.count
  }));

  return {
    statusCounts,
    categoryCounts: countBy(items, i => i.category),
    assigneeCounts: countBy(items, i => i.assignedTo),
    timeline: buildTimeline(items)
  };
}
