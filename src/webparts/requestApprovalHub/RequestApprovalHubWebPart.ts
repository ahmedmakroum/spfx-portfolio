import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyPaneTextField, PropertyPaneToggle, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import * as strings from 'RequestApprovalHubWebPartStrings';
import { RequestApprovalHub } from './components/RequestApprovalHub';

export interface IRequestApprovalHubWebPartProps {
  title: string;
  useMockData: boolean;
}

export default class RequestApprovalHubWebPart extends BaseClientSideWebPart<IRequestApprovalHubWebPartProps> {
  public render(): void {
    const element = React.createElement(RequestApprovalHub, {
      title: this.properties.title || 'Request & Approval Hub',
      useMockData: this.properties.useMockData !== false
    });
    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    if (this.properties.useMockData === undefined) {
      this.properties.useMockData = true;
    }
    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.DataSourceGroupName,
          groupFields: [PropertyPaneToggle('useMockData', {
            label: strings.UseMockDataLabel,
            onText: strings.MockDataOnText,
            offText: strings.MockDataOffText
          })]
        }, {
          groupName: strings.DisplayGroupName,
          groupFields: [PropertyPaneTextField('title', { label: strings.TitleLabel })]
        }]
      }]
    };
  }
}
