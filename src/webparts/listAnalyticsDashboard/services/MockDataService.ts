import { IDataService } from './IDataService';
import { IListItem } from '../models/IListItem';
import { IListSourceConfig } from '../models/IListSourceConfig';
import { IDateRange } from '../models/IFilterState';

interface IVirtualList {
  id: string;
  title: string;
  titles: string[];
  statuses: string[];
  categories: string[];
}

const ASSIGNEES = [
  'Avery Chen', 'Priya Nair', 'Jordan Blake', 'Sam Osei',
  'Maria Gonzalez', 'Liam Carter', 'Noor Haddad', 'Ethan Brooks'
];

const VIRTUAL_LISTS: IVirtualList[] = [
  {
    id: 'mock-list-1',
    title: 'IT Helpdesk Tickets',
    titles: ['Laptop will not boot', 'VPN connection drops', 'Password reset request', 'Monitor flickering', 'Printer offline', 'Software install request', 'Email sync issue', 'Network drive access'],
    statuses: ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Completed'],
    categories: ['Hardware', 'Software', 'Network', 'Access Request']
  },
  {
    id: 'mock-list-2',
    title: 'Facility Requests',
    titles: ['Meeting room AV setup', 'Broken chair replacement', 'Temperature complaint', 'Badge access issue', 'Parking permit request', 'Lighting repair'],
    statuses: ['Not Started', 'In Progress', 'Completed', 'Blocked'],
    categories: ['Facilities', 'Access Request', 'Hardware']
  },
  {
    id: 'mock-list-3',
    title: 'HR Onboarding Tasks',
    titles: ['New hire equipment order', 'Benefits enrollment', 'Orientation scheduling', 'Background check', 'Workstation setup', 'Team introduction'],
    statuses: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    categories: ['HR', 'Hardware', 'Facilities']
  }
];

/** Simple seeded PRNG (mulberry32) so a given session's mock data stays stable until reset(). */
function createRng(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, values: T[]): T {
  return values[Math.floor(rng() * values.length)];
}

export class MockDataService implements IDataService {
  private cache: IListItem[] | undefined;
  private seed: number = 42;

  /** Forces the next getItems() call to regenerate a fresh dataset (wired to the Refresh button). */
  public reset(): void {
    this.cache = undefined;
    this.seed = Date.now() & 0xffffffff;
  }

  public async getItems(configs: IListSourceConfig[], dateRange: IDateRange): Promise<IListItem[]> {
    if (!this.cache) {
      this.cache = this.generate();
    }

    return this.cache.filter(item => {
      if (dateRange.start && item.created < dateRange.start) {
        return false;
      }
      if (dateRange.end && item.created > dateRange.end) {
        return false;
      }
      return true;
    });
  }

  private generate(): IListItem[] {
    const rng = createRng(this.seed);
    const items: IListItem[] = [];
    const now = new Date();
    let nextId = 1;

    VIRTUAL_LISTS.forEach(list => {
      const itemCount = 60 + Math.floor(rng() * 40);

      for (let i = 0; i < itemCount; i++) {
        const monthsAgo = Math.floor(rng() * rng() * 15);
        const created = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1 + Math.floor(rng() * 27));
        const modified = new Date(created.getTime() + Math.floor(rng() * 5) * 86400000);

        items.push({
          id: nextId++,
          listId: list.id,
          listTitle: list.title,
          title: pick(rng, list.titles),
          status: pick(rng, list.statuses),
          category: pick(rng, list.categories),
          assignedTo: pick(rng, ASSIGNEES),
          created,
          modified
        });
      }
    });

    return items;
  }
}
