import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneGroup,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldDateTimePicker, DateConvention, IDateTimeFieldValue } from '@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker';

import * as strings from 'ListAnalyticsDashboardWebPartStrings';
import { ListAnalyticsDashboard } from './components/ListAnalyticsDashboard';
import { IListAnalyticsDashboardProps } from './components/IListAnalyticsDashboardProps';
import { IListSourceConfig } from './models/IListSourceConfig';
import { ChartAccent, CHART_ACCENT_OPTIONS } from './components/Charts/chartColors';

export interface IListAnalyticsDashboardWebPartProps {
  list1Id: string;
  list2Id: string;
  list3Id: string;
  useMockData: boolean;
  chartAccent: ChartAccent;
  defaultRangeStart?: IDateTimeFieldValue;
  defaultRangeEnd?: IDateTimeFieldValue;
}

function getDateValue(fieldValue: IDateTimeFieldValue | undefined): Date | undefined {
  const rawValue = fieldValue?.value as Date | string | undefined;
  if (!rawValue) {
    return undefined;
  }

  const date = rawValue instanceof Date ? rawValue : new Date(rawValue);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default class ListAnalyticsDashboardWebPart extends BaseClientSideWebPart<IListAnalyticsDashboardWebPartProps> {
  private _isDarkTheme: boolean = false;

  public render(): void {
    const listConfigs: IListSourceConfig[] = [
      { id: this.properties.list1Id },
      { id: this.properties.list2Id },
      { id: this.properties.list3Id }
    ];

    const element: React.ReactElement<IListAnalyticsDashboardProps> = React.createElement(ListAnalyticsDashboard, {
      context: this.context,
      listConfigs,
      useMockData: !!this.properties.useMockData,
      chartAccent: this.properties.chartAccent || 'blue',
      defaultRangeStart: getDateValue(this.properties.defaultRangeStart),
      defaultRangeEnd: getDateValue(this.properties.defaultRangeEnd),
      isDarkTheme: this._isDarkTheme
    });

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    if (this.properties.useMockData === undefined) {
      this.properties.useMockData = true;
    }
    if (!this.properties.chartAccent) {
      this.properties.chartAccent = 'blue';
    }
    return Promise.resolve();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    this.render();
    if (propertyPath === 'useMockData') {
      this.context.propertyPane.refresh();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const useMockData = !!this.properties.useMockData;
    // @pnp/spfx-property-controls bundles its own copy of @microsoft/sp-component-base, so its
    // BaseComponentContext type is nominally distinct from ours despite being identical at runtime.
    const listPickerContext = this.context as unknown as Parameters<typeof PropertyFieldListPicker>[1]['context'];

    const listPickerGroup: IPropertyPaneGroup = useMockData
      ? {
          groupName: strings.DataSourceGroupName,
          groupFields: [
            PropertyPaneToggle('useMockData', {
              label: strings.UseMockDataLabel,
              onText: strings.MockDataOnText,
              offText: strings.MockDataOffText
            })
          ]
        }
      : {
          groupName: strings.DataSourceGroupName,
          groupFields: [
            PropertyPaneToggle('useMockData', {
              label: strings.UseMockDataLabel,
              onText: strings.MockDataOnText,
              offText: strings.MockDataOffText
            }),
            PropertyFieldListPicker('list1Id', {
              label: strings.List1Label,
              selectedList: this.properties.list1Id,
              orderBy: PropertyFieldListPickerOrderBy.Title,
              multiSelect: false,
              includeHidden: false,
              context: listPickerContext,
              onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
              properties: this.properties,
              key: 'list1IdField'
            }),
            PropertyFieldListPicker('list2Id', {
              label: strings.List2Label,
              selectedList: this.properties.list2Id,
              orderBy: PropertyFieldListPickerOrderBy.Title,
              multiSelect: false,
              includeHidden: false,
              context: listPickerContext,
              onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
              properties: this.properties,
              key: 'list2IdField'
            }),
            PropertyFieldListPicker('list3Id', {
              label: strings.List3Label,
              selectedList: this.properties.list3Id,
              orderBy: PropertyFieldListPickerOrderBy.Title,
              multiSelect: false,
              includeHidden: false,
              context: listPickerContext,
              onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
              properties: this.properties,
              key: 'list3IdField'
            })
          ]
        };

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            listPickerGroup,
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneDropdown('chartAccent', {
                  label: strings.ChartAccentLabel,
                  options: CHART_ACCENT_OPTIONS
                }),
                PropertyFieldDateTimePicker('defaultRangeStart', {
                  label: strings.DefaultRangeStartLabel,
                  initialDate: this.properties.defaultRangeStart,
                  dateConvention: DateConvention.Date,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'defaultRangeStartField'
                }),
                PropertyFieldDateTimePicker('defaultRangeEnd', {
                  label: strings.DefaultRangeEndLabel,
                  initialDate: this.properties.defaultRangeEnd,
                  dateConvention: DateConvention.Date,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  key: 'defaultRangeEndField'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
