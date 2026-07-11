import { IFilterState } from '../../models/IFilterState';

export interface IFilterBarProps {
  filters: IFilterState;
  statusOptions: string[];
  categoryOptions: string[];
  assigneeOptions: string[];
  isRefreshing: boolean;
  onChange: (filters: IFilterState) => void;
  onReset: () => void;
  onRefresh: () => void;
}
