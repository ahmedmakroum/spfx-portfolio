import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, Panel, PanelType, SelectionMode } from '@fluentui/react';
import { IDetailPanelProps } from './IDetailPanelProps';
import { IListItem } from '../../models/IListItem';

const COLUMNS: IColumn[] = [
  { key: 'title', name: 'Title', fieldName: 'title', minWidth: 160, maxWidth: 260, isResizable: true },
  { key: 'status', name: 'Status', fieldName: 'status', minWidth: 100, maxWidth: 140, isResizable: true },
  { key: 'category', name: 'Category', fieldName: 'category', minWidth: 100, maxWidth: 140, isResizable: true },
  { key: 'assignedTo', name: 'Assigned to', fieldName: 'assignedTo', minWidth: 120, maxWidth: 160, isResizable: true },
  { key: 'listTitle', name: 'Source list', fieldName: 'listTitle', minWidth: 120, maxWidth: 170, isResizable: true },
  {
    key: 'created',
    name: 'Created',
    fieldName: 'created',
    minWidth: 100,
    maxWidth: 130,
    isResizable: true,
    onRender: (item: IListItem) => item.created.toLocaleDateString()
  }
];

export const DetailPanel: React.FC<IDetailPanelProps> = ({ selection, onDismiss }) => {
  const isOpen = !!selection;
  const items = selection ? selection.items : [];

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
      headerText={selection ? `${selection.dimensionLabel}: ${selection.valueLabel} (${items.length} item${items.length === 1 ? '' : 's'})` : ''}
      closeButtonAriaLabel="Close"
    >
      <DetailsList
        items={items}
        columns={COLUMNS}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        compact
      />
    </Panel>
  );
};
