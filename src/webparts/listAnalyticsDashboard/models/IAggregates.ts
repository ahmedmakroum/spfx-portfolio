export type DonutDimension = 'category' | 'assignedTo';

export interface IStatusCount {
  status: string;
  count: number;
}

export interface IDimensionCount {
  label: string;
  count: number;
}

export interface ITimelinePoint {
  periodKey: string;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  count: number;
}

export interface IAggregates {
  statusCounts: IStatusCount[];
  categoryCounts: IDimensionCount[];
  assigneeCounts: IDimensionCount[];
  timeline: ITimelinePoint[];
}
