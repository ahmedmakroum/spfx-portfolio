import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IListSourceConfig } from '../models/IListSourceConfig';
import { ChartAccent } from './Charts/chartColors';

export interface IListAnalyticsDashboardProps {
  context: WebPartContext;
  listConfigs: IListSourceConfig[];
  useMockData: boolean;
  chartAccent: ChartAccent;
  defaultRangeStart: Date | undefined;
  defaultRangeEnd: Date | undefined;
  isDarkTheme: boolean;
}
