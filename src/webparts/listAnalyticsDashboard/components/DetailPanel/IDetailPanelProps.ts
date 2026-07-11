import { IDrillDownSelection } from '../../models/IDrillDownSelection';

export interface IDetailPanelProps {
  selection: IDrillDownSelection | undefined;
  onDismiss: () => void;
}
