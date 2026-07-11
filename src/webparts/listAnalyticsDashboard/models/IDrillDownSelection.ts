import { IListItem } from './IListItem';

/**
 * Captures what the reader clicked on (a bar, a donut slice, a month point)
 * so the DetailPanel can title itself and list exactly those items.
 */
export interface IDrillDownSelection {
  dimensionLabel: string;
  valueLabel: string;
  items: IListItem[];
}
