/**
 * Unified shape every source list is normalized into, regardless of which
 * SharePoint columns actually back Status/Category/AssignedTo on that list.
 */
export interface IListItem {
  id: number;
  listId: string;
  listTitle: string;
  title: string;
  status: string;
  category: string;
  assignedTo: string;
  created: Date;
  modified: Date;
}
