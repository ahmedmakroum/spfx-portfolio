export interface IDateRange {
  start: Date | undefined;
  end: Date | undefined;
}

export interface IFilterState {
  dateRange: IDateRange;
  statuses: string[];
  categories: string[];
  assignees: string[];
}

export function createDefaultFilterState(dateRange: IDateRange): IFilterState {
  return {
    dateRange,
    statuses: [],
    categories: [],
    assignees: []
  };
}
