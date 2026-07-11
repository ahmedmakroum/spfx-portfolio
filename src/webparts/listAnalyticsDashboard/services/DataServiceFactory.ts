import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';
import { SharePointDataService } from './SharePointDataService';

export function createDataService(context: WebPartContext, useMockData: boolean): IDataService {
  return useMockData ? new MockDataService() : new SharePointDataService(context);
}
