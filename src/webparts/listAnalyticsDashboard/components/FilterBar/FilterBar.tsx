import * as React from 'react';
import { DatePicker, DefaultButton, Dropdown, IDropdownOption, PrimaryButton } from '@fluentui/react';
import { IFilterBarProps } from './IFilterBarProps';
import styles from './FilterBar.module.scss';

function toOptions(values: string[]): IDropdownOption[] {
  return values.map(value => ({ key: value, text: value }));
}

function toggleSelection(current: string[], key: string): string[] {
  return current.indexOf(key) === -1 ? [...current, key] : current.filter(v => v !== key);
}

export const FilterBar: React.FC<IFilterBarProps> = ({
  filters,
  statusOptions,
  categoryOptions,
  assigneeOptions,
  isRefreshing,
  onChange,
  onReset,
  onRefresh
}) => {
  return (
    <div className={styles.bar}>
      <div className={styles.field}>
        <DatePicker
          label="From"
          value={filters.dateRange.start}
          onSelectDate={date => onChange({ ...filters, dateRange: { ...filters.dateRange, start: date || undefined } })}
          allowTextInput
        />
      </div>
      <div className={styles.field}>
        <DatePicker
          label="To"
          value={filters.dateRange.end}
          onSelectDate={date => onChange({ ...filters, dateRange: { ...filters.dateRange, end: date || undefined } })}
          allowTextInput
        />
      </div>
      <div className={styles.field}>
        <Dropdown
          label="Status"
          multiSelect
          placeholder="All statuses"
          options={toOptions(statusOptions)}
          selectedKeys={filters.statuses}
          onChange={(_e, option) => option && onChange({ ...filters, statuses: toggleSelection(filters.statuses, option.key as string) })}
        />
      </div>
      <div className={styles.field}>
        <Dropdown
          label="Category"
          multiSelect
          placeholder="All categories"
          options={toOptions(categoryOptions)}
          selectedKeys={filters.categories}
          onChange={(_e, option) => option && onChange({ ...filters, categories: toggleSelection(filters.categories, option.key as string) })}
        />
      </div>
      <div className={styles.field}>
        <Dropdown
          label="Assigned to"
          multiSelect
          placeholder="Everyone"
          options={toOptions(assigneeOptions)}
          selectedKeys={filters.assignees}
          onChange={(_e, option) => option && onChange({ ...filters, assignees: toggleSelection(filters.assignees, option.key as string) })}
        />
      </div>
      <div className={styles.actions}>
        <DefaultButton text="Reset filters" onClick={onReset} />
        <PrimaryButton
          text={isRefreshing ? 'Refreshing…' : 'Refresh data'}
          iconProps={{ iconName: 'Refresh' }}
          onClick={onRefresh}
          disabled={isRefreshing}
        />
      </div>
    </div>
  );
};
