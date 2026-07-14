import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyPaneTextField, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import * as strings from 'OnboardingCommandCenterWebPartStrings';
import { OnboardingCommandCenter } from './components/OnboardingCommandCenter';

export interface IOnboardingCommandCenterWebPartProps {
  title: string;
}

export default class OnboardingCommandCenterWebPart extends BaseClientSideWebPart<IOnboardingCommandCenterWebPartProps> {
  public render(): void {
    ReactDom.render(React.createElement(OnboardingCommandCenter, {
      title: this.properties.title || 'Welcome to Northstar'
    }), this.domElement);
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
          groupName: strings.DisplayGroupName,
          groupFields: [PropertyPaneTextField('title', { label: strings.TitleLabel })]
        }]
      }]
    };
  }
}
