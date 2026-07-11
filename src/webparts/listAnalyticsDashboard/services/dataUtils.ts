import { IListItem } from '../models/IListItem';
import { IFilterState } from '../models/IFilterState';

const GUID_REGEX = /^[{]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[}]?$/;

export function isGuid(value: string): boolean {
  return GUID_REGEX.test((value || '').trim());
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function applyClientFilters(items: IListItem[], filters: IFilterState): IListItem[] {
  const { dateRange, statuses, categories, assignees } = filters;

  return items.filter(item => {
    if (dateRange.start && item.created < dateRange.start) {
      return false;
    }
    if (dateRange.end && item.created > dateRange.end) {
      return false;
    }
    if (statuses.length > 0 && statuses.indexOf(item.status) === -1) {
      return false;
    }
    if (categories.length > 0 && categories.indexOf(item.category) === -1) {
      return false;
    }
    if (assignees.length > 0 && assignees.indexOf(item.assignedTo) === -1) {
      return false;
    }
    return true;
  });
}

/** True when `requested` reaches outside `fetched`, meaning cached data can no longer answer the query. */
export function rangeExceedsFetched(
  requested: { start: Date | undefined; end: Date | undefined },
  fetched: { start: Date | undefined; end: Date | undefined }
): boolean {
  if (requested.start && fetched.start && requested.start < fetched.start) {
    return true;
  }
  if (requested.start && !fetched.start) {
    return false;
  }
  if (requested.end && fetched.end && requested.end > fetched.end) {
    return true;
  }
  return false;
}
