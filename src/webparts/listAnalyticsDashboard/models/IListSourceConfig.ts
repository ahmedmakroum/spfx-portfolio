/**
 * One configured data source, as chosen in the property pane. `id` holds
 * whatever PropertyFieldListPicker returned (a list GUID) or, for direct
 * text entry, either a GUID or a list title - SharePointDataService resolves
 * either.
 */
export interface IListSourceConfig {
  id: string;
  title?: string;
}
