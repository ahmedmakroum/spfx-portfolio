import { spfi, SPFI, SPFx as spSPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/items/get-all';
import { HttpRequestError } from '@pnp/queryable';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { IDataService } from './IDataService';
import { IListItem } from '../models/IListItem';
import { IListSourceConfig } from '../models/IListSourceConfig';
import { IDateRange } from '../models/IFilterState';
import { IDataError } from '../models/IDataLoadState';
import { isGuid } from './dataUtils';

const ITEM_SELECT = ['Id', 'Title', 'Status', 'Category', 'AssignedTo/Title', 'Created', 'Modified'];
const ITEM_EXPAND = ['AssignedTo'];
const PAGE_SIZE = 500;

/** Thrown instead of a raw PnPjs/HTTP error so the UI can show a specific, actionable message. */
export class ListAccessError extends Error implements IDataError {
  public reason: IDataError['reason'];
  public listIdentifier: string;

  constructor(reason: IDataError['reason'], listIdentifier: string, message: string) {
    super(message);
    this.reason = reason;
    this.listIdentifier = listIdentifier;
  }
}

interface IRawAssignedTo {
  Title: string;
}

interface IRawListItem {
  Id: number;
  Title: string;
  Status?: string;
  Category?: string;
  AssignedTo?: IRawAssignedTo | IRawAssignedTo[];
  Created: string;
  Modified: string;
}

function classifyError(config: IListSourceConfig, error: unknown): ListAccessError {
  const identifier = config.title || config.id;

  if (error instanceof HttpRequestError || (error as HttpRequestError)?.isHttpRequestError) {
    const status = (error as HttpRequestError).status;
    if (status === 404) {
      return new ListAccessError('not-found', identifier, `The list "${identifier}" could not be found. Check the identifier in the web part property pane.`);
    }
    if (status === 403 || status === 401) {
      return new ListAccessError('forbidden', identifier, `You do not have permission to read "${identifier}".`);
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  return new ListAccessError('unknown', identifier, `Could not load "${identifier}": ${message}`);
}

function normalizeAssignedTo(raw: IRawListItem['AssignedTo']): string {
  if (Array.isArray(raw)) {
    return raw.length > 0 ? raw[0].Title : 'Unassigned';
  }
  if (raw && raw.Title) {
    return raw.Title;
  }
  return 'Unassigned';
}

function normalizeItem(raw: IRawListItem, listId: string, listTitle: string): IListItem {
  return {
    id: raw.Id,
    listId,
    listTitle,
    title: raw.Title || '(no title)',
    status: raw.Status || 'Unspecified',
    category: raw.Category || 'Uncategorized',
    assignedTo: normalizeAssignedTo(raw.AssignedTo),
    created: new Date(raw.Created),
    modified: new Date(raw.Modified)
  };
}

export class SharePointDataService implements IDataService {
  private sp: SPFI;

  constructor(context: WebPartContext) {
    this.sp = spfi().using(spSPFx(context));
  }

  public async getItems(configs: IListSourceConfig[], dateRange: IDateRange): Promise<IListItem[]> {
    const activeConfigs = configs.filter(c => !!(c.id && c.id.trim()));
    const results = await Promise.all(activeConfigs.map(config => this.getListItems(config, dateRange)));
    return results.reduce((all, items) => all.concat(items), [] as IListItem[]);
  }

  private async getListItems(config: IListSourceConfig, dateRange: IDateRange): Promise<IListItem[]> {
    try {
      const list = isGuid(config.id) ? this.sp.web.lists.getById(config.id) : this.sp.web.lists.getByTitle(config.id);
      const listInfo = await list.select('Id', 'Title')();

      let query = list.items
        .select(...ITEM_SELECT)
        .expand(...ITEM_EXPAND)
        .orderBy('Created', false)
        .top(PAGE_SIZE);

      const filterClauses: string[] = [];
      if (dateRange.start) {
        filterClauses.push(`Created ge datetime'${dateRange.start.toISOString()}'`);
      }
      if (dateRange.end) {
        filterClauses.push(`Created le datetime'${dateRange.end.toISOString()}'`);
      }
      if (filterClauses.length > 0) {
        query = query.filter(filterClauses.join(' and '));
      }

      const rawItems = await query.getAll(PAGE_SIZE) as unknown as IRawListItem[];
      return rawItems.map(raw => normalizeItem(raw, listInfo.Id, listInfo.Title));
    } catch (error) {
      throw classifyError(config, error);
    }
  }
}
