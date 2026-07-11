import { IListItem } from '../models/IListItem';
import { IListSourceConfig } from '../models/IListSourceConfig';
import { IDateRange } from '../models/IFilterState';

export interface IDataService {
  /**
   * Fetches and normalizes items from every configured list. `dateRange`
   * bounds the query itself (a $filter on Created) rather than being applied
   * after the fact, so callers control how much data actually crosses the wire.
   */
  getItems(configs: IListSourceConfig[], dateRange: IDateRange): Promise<IListItem[]>;
}
