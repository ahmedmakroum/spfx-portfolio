import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';

import styles from './ListAnalyticsDashboard.module.scss';
import { IListAnalyticsDashboardProps } from './IListAnalyticsDashboardProps';
import { createDataService } from '../services/DataServiceFactory';
import { MockDataService } from '../services/MockDataService';
import { applyClientFilters, rangeExceedsFetched, uniqueSorted } from '../services/dataUtils';
import { buildAggregates } from '../services/aggregations';
import { buildColorMap, chromeFor } from './Charts/chartColors';
import { createDefaultFilterState, IDateRange, IFilterState } from '../models/IFilterState';
import { IListItem } from '../models/IListItem';
import { IDataError, LoadStatus } from '../models/IDataLoadState';
import { IDrillDownSelection } from '../models/IDrillDownSelection';
import { DonutDimension, ITimelinePoint } from '../models/IAggregates';

import { FilterBar } from './FilterBar/FilterBar';
import { StatusBarChart } from './Charts/StatusBarChart';
import { TimelineAreaChart } from './Charts/TimelineAreaChart';
import { CategoryDonutChart } from './Charts/CategoryDonutChart';
import { DetailPanel } from './DetailPanel/DetailPanel';
import { LoadingState } from './StatusStates/LoadingState';
import { EmptyState } from './StatusStates/EmptyState';
import { ErrorState } from './StatusStates/ErrorState';

export const ListAnalyticsDashboard: React.FC<IListAnalyticsDashboardProps> = props => {
  const { context, listConfigs, useMockData, chartAccent, defaultRangeStart, defaultRangeEnd, isDarkTheme } = props;

  const activeConfigs = React.useMemo(() => listConfigs.filter(c => !!(c.id && c.id.trim())), [listConfigs]);
  const configsKey = React.useMemo(
    () => useMockData ? 'mock-data' : activeConfigs.map(c => c.id).join('|'),
    [activeConfigs, useMockData]
  );

  const dataService = React.useMemo(() => createDataService(context, useMockData), [context, useMockData]);

  const [filters, setFilters] = React.useState<IFilterState>(() =>
    createDefaultFilterState({ start: defaultRangeStart, end: defaultRangeEnd })
  );
  const [fetchedRange, setFetchedRange] = React.useState<IDateRange>({ start: defaultRangeStart, end: defaultRangeEnd });
  const [rawItems, setRawItems] = React.useState<IListItem[]>([]);
  const [loadStatus, setLoadStatus] = React.useState<LoadStatus>('loading');
  const [dataError, setDataError] = React.useState<IDataError | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [drillDown, setDrillDown] = React.useState<IDrillDownSelection | undefined>(undefined);
  const [donutDimension, setDonutDimension] = React.useState<DonutDimension>('category');

  const loadData = React.useCallback(
    async (range: IDateRange, isBackgroundRefresh: boolean): Promise<void> => {
      if (!useMockData && activeConfigs.length === 0) {
        setLoadStatus('error');
        setDataError({
          reason: 'no-lists-configured',
          message: 'Select at least one SharePoint list in the web part property pane, or turn on mock data mode to see a populated demo.'
        });
        return;
      }

      if (isBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setLoadStatus('loading');
      }

      try {
        const items = await dataService.getItems(activeConfigs, range);
        setRawItems(items);
        setFetchedRange(range);
        setLoadStatus('loaded');
        setDataError(undefined);
      } catch (error) {
        const dataErr = error as IDataError;
        setDataError({
          reason: dataErr.reason || 'unknown',
          message: dataErr.message || 'An unexpected error occurred while loading list data.',
          listIdentifier: dataErr.listIdentifier
        });
        setLoadStatus('error');
      } finally {
        setIsRefreshing(false);
      }
    },
    [activeConfigs, configsKey, dataService, useMockData]
  );

  React.useEffect(() => {
    loadData(filters.dateRange, false).catch(() => { /* errors are surfaced via dataError state */ });
  }, [configsKey, dataService, loadData]);

  const handleFilterChange = (next: IFilterState): void => {
    setFilters(next);
    if (rangeExceedsFetched(next.dateRange, fetchedRange)) {
      loadData(next.dateRange, true).catch(() => { /* errors are surfaced via dataError state */ });
    }
  };

  const handleReset = (): void => {
    const defaults = createDefaultFilterState({ start: defaultRangeStart, end: defaultRangeEnd });
    handleFilterChange(defaults);
  };

  const handleRefresh = (): void => {
    if (useMockData) {
      (dataService as MockDataService).reset();
    }
    loadData(filters.dateRange, true).catch(() => { /* errors are surfaced via dataError state */ });
  };

  const filteredItems = React.useMemo(() => applyClientFilters(rawItems, filters), [rawItems, filters]);
  const aggregates = React.useMemo(() => buildAggregates(filteredItems), [filteredItems]);

  const statusOptions = React.useMemo(() => uniqueSorted(rawItems.map(i => i.status)), [rawItems]);
  const categoryOptions = React.useMemo(() => uniqueSorted(rawItems.map(i => i.category)), [rawItems]);
  const assigneeOptions = React.useMemo(() => uniqueSorted(rawItems.map(i => i.assignedTo)), [rawItems]);

  const categoryColorMap = React.useMemo(
    () => buildColorMap(categoryOptions, chartAccent, isDarkTheme),
    [categoryOptions, chartAccent, isDarkTheme]
  );
  const assigneeColorMap = React.useMemo(
    () => buildColorMap(assigneeOptions, chartAccent, isDarkTheme),
    [assigneeOptions, chartAccent, isDarkTheme]
  );

  const donutData = donutDimension === 'category' ? aggregates.categoryCounts : aggregates.assigneeCounts;
  const donutColorMap = donutDimension === 'category' ? categoryColorMap : assigneeColorMap;

  const handleStatusClick = (status: string): void => {
    setDrillDown({ dimensionLabel: 'Status', valueLabel: status, items: filteredItems.filter(i => i.status === status) });
  };

  const handleDonutClick = (label: string): void => {
    const dimensionLabel = donutDimension === 'category' ? 'Category' : 'Assigned to';
    const items = filteredItems.filter(i => (donutDimension === 'category' ? i.category : i.assignedTo) === label);
    setDrillDown({ dimensionLabel, valueLabel: label, items });
  };

  const handleTimelineClick = (point: ITimelinePoint): void => {
    const items = filteredItems.filter(i => i.created >= point.periodStart && i.created <= point.periodEnd);
    setDrillDown({ dimensionLabel: 'Created', valueLabel: point.periodLabel, items });
  };

  const chrome = chromeFor(isDarkTheme);
  const rootStyle: React.CSSProperties = {
    ['--chartSurface' as unknown as string]: chrome.surface,
    ['--chartBorder' as unknown as string]: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(11,11,11,0.1)',
    ['--chartTextSecondary' as unknown as string]: chrome.textSecondary
  };

  const showFullPageLoading = loadStatus === 'loading' && rawItems.length === 0;
  const showFullPageError = loadStatus === 'error' && rawItems.length === 0;

  if (showFullPageLoading) {
    return (
      <div className={styles.root} style={rootStyle}>
        <LoadingState />
      </div>
    );
  }

  if (showFullPageError && dataError) {
    return (
      <div className={styles.root} style={rootStyle}>
        <ErrorState error={dataError} onRetry={() => loadData(filters.dateRange, false)} />
      </div>
    );
  }

  const noItemsAtAll = rawItems.length === 0;
  const noItemsMatchFilters = !noItemsAtAll && filteredItems.length === 0;

  return (
    <div className={styles.root} style={rootStyle}>
      {dataError && !showFullPageError && (
        <MessageBar messageBarType={MessageBarType.warning} className={styles.banner}>
          {dataError.message}
        </MessageBar>
      )}

      <FilterBar
        filters={filters}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        assigneeOptions={assigneeOptions}
        isRefreshing={isRefreshing}
        onChange={handleFilterChange}
        onReset={handleReset}
        onRefresh={handleRefresh}
      />

      {noItemsAtAll && (
        <EmptyState
          title="No items found"
          message="The configured list(s) don't have any items yet. Add some items in SharePoint, or turn on mock data mode from the property pane to see a populated demo."
        />
      )}

      {noItemsMatchFilters && (
        <EmptyState
          title="No items match your filters"
          message="Try widening the date range or clearing a filter."
          actionText="Reset filters"
          onAction={handleReset}
        />
      )}

      {!noItemsAtAll && !noItemsMatchFilters && (
        <div className={styles.chartsGrid} style={{ opacity: isRefreshing ? 0.6 : 1, transition: 'opacity 150ms ease' }}>
          <StatusBarChart data={aggregates.statusCounts} accent={chartAccent} isDarkTheme={isDarkTheme} onSegmentClick={handleStatusClick} />
          <TimelineAreaChart data={aggregates.timeline} accent={chartAccent} isDarkTheme={isDarkTheme} onPointClick={handleTimelineClick} />
          <CategoryDonutChart
            data={donutData}
            colorMap={donutColorMap}
            dimension={donutDimension}
            isDarkTheme={isDarkTheme}
            onDimensionChange={setDonutDimension}
            onSliceClick={handleDonutClick}
          />
        </div>
      )}

      <DetailPanel selection={drillDown} onDismiss={() => setDrillDown(undefined)} />
    </div>
  );
};

export default ListAnalyticsDashboard;
