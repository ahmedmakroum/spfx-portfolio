import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  MessageBar,
  MessageBarType,
  Panel,
  PanelType,
  PrimaryButton,
  TextField,
  type IDropdownOption
} from '@fluentui/react';
import styles from './RequestApprovalHub.module.scss';

type RequestStatus = 'New' | 'In review' | 'Approved' | 'Rejected';
type RequestPriority = 'High' | 'Medium' | 'Low';
type RequestCategory = 'Access' | 'Equipment' | 'Facilities' | 'People';

interface IRequest {
  id: string;
  title: string;
  category: RequestCategory;
  requester: string;
  submitted: string;
  priority: RequestPriority;
  status: RequestStatus;
  approver: string;
  assignee: string;
  slaHours: number;
  description: string;
}

interface IRequestApprovalHubProps {
  title: string;
  useMockData: boolean;
}

const REQUESTS: IRequest[] = [
  { id: 'REQ-1048', title: 'Adobe Creative Cloud access', category: 'Access', requester: 'Maya Patel', submitted: 'Today, 09:12', priority: 'High', status: 'In review', approver: 'Lena Ortiz', assignee: 'IT Access', slaHours: 1, description: 'Access to the Creative Cloud team licence is needed for a new campaign starting this week.' },
  { id: 'REQ-1047', title: 'Ergonomic desk assessment', category: 'Facilities', requester: 'Noah Williams', submitted: 'Today, 08:35', priority: 'Medium', status: 'New', approver: 'Marco Silva', assignee: 'Workplace', slaHours: 7, description: 'A workstation assessment and equipment recommendation for a recurring wrist strain.' },
  { id: 'REQ-1046', title: 'New starter laptop bundle', category: 'Equipment', requester: 'Priya Shah', submitted: 'Yesterday, 15:40', priority: 'High', status: 'In review', approver: 'Lena Ortiz', assignee: 'IT Procurement', slaHours: 3, description: 'Standard laptop, dock, headset, and two monitors for a new finance analyst joining Monday.' },
  { id: 'REQ-1045', title: 'Temporary project site access', category: 'Access', requester: 'Ethan Brown', submitted: 'Yesterday, 11:08', priority: 'Low', status: 'Approved', approver: 'Lena Ortiz', assignee: 'IT Access', slaHours: 0, description: 'Guest access for the implementation partner to the project workspace through 31 August.' },
  { id: 'REQ-1044', title: 'Remote work equipment', category: 'Equipment', requester: 'Sofia Martinez', submitted: '12 Jul, 14:22', priority: 'Medium', status: 'Rejected', approver: 'Marco Silva', assignee: 'IT Procurement', slaHours: 0, description: 'Additional monitor requested for a home office. Existing allocation was confirmed.' },
  { id: 'REQ-1043', title: 'Update emergency contact', category: 'People', requester: 'Jordan Lee', submitted: '12 Jul, 09:16', priority: 'Low', status: 'Approved', approver: 'Nadia Ahmed', assignee: 'People Operations', slaHours: 0, description: 'Update the employee record with a new emergency contact phone number.' }
];

const statusOptions: IDropdownOption[] = [{ key: 'all', text: 'All statuses' }, ...(['New', 'In review', 'Approved', 'Rejected'] as RequestStatus[]).map(value => ({ key: value, text: value }))];
const categoryOptions: IDropdownOption[] = [{ key: 'all', text: 'All categories' }, ...(['Access', 'Equipment', 'Facilities', 'People'] as RequestCategory[]).map(value => ({ key: value, text: value }))];
const priorityOptions: IDropdownOption[] = [{ key: 'all', text: 'All priorities' }, ...(['High', 'Medium', 'Low'] as RequestPriority[]).map(value => ({ key: value, text: value }))];

function statusClass(status: RequestStatus): string {
  return status === 'New' ? styles.statusNew : status === 'In review' ? styles.statusReview : status === 'Approved' ? styles.statusApproved : styles.statusRejected;
}

function priorityClass(priority: RequestPriority): string {
  return priority === 'High' ? styles.priorityHigh : priority === 'Medium' ? styles.priorityMedium : styles.priorityLow;
}

export const RequestApprovalHub: React.FC<IRequestApprovalHubProps> = ({ title, useMockData }) => {
  const [requests, setRequests] = React.useState<IRequest[]>(REQUESTS);
  const [selected, setSelected] = React.useState<IRequest | undefined>();
  const [showCreate, setShowCreate] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [category, setCategory] = React.useState('all');
  const [priority, setPriority] = React.useState('all');
  const [notice, setNotice] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<RequestCategory>('Access');
  const [newPriority, setNewPriority] = React.useState<RequestPriority>('Medium');
  const [newDescription, setNewDescription] = React.useState('');

  const filteredRequests = requests.filter(request => {
    const normalizedQuery = query.trim().toLowerCase();
    return (!normalizedQuery || `${request.id} ${request.title} ${request.requester}`.toLowerCase().includes(normalizedQuery)) &&
      (status === 'all' || request.status === status) &&
      (category === 'all' || request.category === category) &&
      (priority === 'all' || request.priority === priority);
  });

  const openRequests = requests.filter(request => request.status === 'New' || request.status === 'In review');
  const slaRisk = openRequests.filter(request => request.slaHours <= 3).length;
  const completedToday = requests.filter(request => request.status === 'Approved').length;

  const updateSelected = (changes: Partial<IRequest>, message: string): void => {
    if (!selected) return;
    const updated = { ...selected, ...changes };
    setRequests(items => items.map(item => item.id === updated.id ? updated : item));
    setSelected(updated);
    setNotice(message);
  };

  const createRequest = (): void => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    const created: IRequest = {
      id: `REQ-${1049 + requests.length - REQUESTS.length}`,
      title: newTitle.trim(),
      category: newCategory,
      requester: 'Alex Morgan',
      submitted: 'Just now',
      priority: newPriority,
      status: 'New',
      approver: 'Lena Ortiz',
      assignee: newCategory === 'Facilities' ? 'Workplace' : newCategory === 'People' ? 'People Operations' : 'IT Service Desk',
      slaHours: newPriority === 'High' ? 4 : 16,
      description: newDescription.trim()
    };
    setRequests(items => [created, ...items]);
    setShowCreate(false);
    setNewTitle('');
    setNewDescription('');
    setNotice(`${created.id} was submitted and routed to ${created.approver}.`);
  };

  return <div className={styles.root}>
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Service operations</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>Triage incoming work, keep approvals moving, and surface SLA risk early.</p>
      </div>
      <PrimaryButton iconProps={{ iconName: 'Add' }} onClick={() => setShowCreate(true)}>New request</PrimaryButton>
    </div>

    {!useMockData && <MessageBar messageBarType={MessageBarType.warning} className={styles.notice}>Live-list integration is not configured in this portfolio build. The queue below remains available as a workflow demonstration.</MessageBar>}
    {notice && <MessageBar messageBarType={MessageBarType.success} isMultiline={false} onDismiss={() => setNotice('')} className={styles.notice}>{notice}</MessageBar>}

    <div className={styles.summaryGrid}>
      <div className={styles.summary}><span className={styles.summaryLabel}>Open requests</span><span className={styles.summaryValue}>{openRequests.length}</span></div>
      <div className={`${styles.summary} ${styles.summaryWarning}`}><span className={styles.summaryLabel}>At SLA risk</span><span className={styles.summaryValue}>{slaRisk}</span></div>
      <div className={`${styles.summary} ${styles.summarySuccess}`}><span className={styles.summaryLabel}>Approved</span><span className={styles.summaryValue}>{completedToday}</span></div>
      <div className={`${styles.summary} ${styles.summaryAccent}`}><span className={styles.summaryLabel}>Median response</span><span className={styles.summaryValue}>2.4h</span></div>
    </div>

    <div className={styles.workspace}>
      <section className={styles.queue} aria-label="Request queue">
        <div className={styles.filters}>
          <TextField className={styles.filterField} label="Search queue" value={query} onChange={(_, value) => setQuery(value || '')} placeholder="Request ID, title, or requester" iconProps={{ iconName: 'Search' }} />
          <Dropdown className={styles.filterField} label="Status" selectedKey={status} options={statusOptions} onChange={(_, option) => setStatus(String(option?.key || 'all'))} />
          <Dropdown className={styles.filterField} label="Category" selectedKey={category} options={categoryOptions} onChange={(_, option) => setCategory(String(option?.key || 'all'))} />
          <Dropdown className={styles.filterField} label="Priority" selectedKey={priority} options={priorityOptions} onChange={(_, option) => setPriority(String(option?.key || 'all'))} />
        </div>
        <div className={styles.tableWrap}>
          {filteredRequests.length === 0 ? <div className={styles.empty}>No requests match the current filters.</div> : <table className={styles.table}>
            <thead><tr><th>Request</th><th>Status</th><th>Priority</th><th>Owner</th><th>SLA</th></tr></thead>
            <tbody>{filteredRequests.map(request => <tr key={request.id}>
              <td><button className={styles.requestButton} onClick={() => setSelected(request)}>{request.title}</button><div className={styles.requestMeta}>{request.id} · {request.category} · {request.requester}</div></td>
              <td><span className={`${styles.badge} ${statusClass(request.status)}`}>{request.status}</span></td>
              <td><span className={priorityClass(request.priority)}>{request.priority}</span></td>
              <td>{request.assignee}</td>
              <td className={request.slaHours > 0 && request.slaHours <= 3 ? styles.slaRisk : styles.slaGood}>{request.slaHours > 0 ? `${request.slaHours}h remaining` : 'Complete'}</td>
            </tr>)}</tbody>
          </table>}
        </div>
      </section>
      <aside className={styles.sidePanel}>
        <h2 className={styles.sideTitle}>Queue activity</h2>
        <p className={styles.sideHint}>The latest events across the service queue.</p>
        <div className={styles.activity}><div className={styles.activityTitle}>REQ-1048 assigned to IT Access</div><div className={styles.activityMeta}>8 minutes ago · by workflow</div></div>
        <div className={styles.activity}><div className={styles.activityTitle}>REQ-1045 approved by Lena Ortiz</div><div className={styles.activityMeta}>42 minutes ago · access request</div></div>
        <div className={styles.activity}><div className={styles.activityTitle}>REQ-1046 escalated for approval</div><div className={styles.activityMeta}>1 hour ago · high priority</div></div>
      </aside>
    </div>

    <Panel isOpen={!!selected} onDismiss={() => setSelected(undefined)} type={PanelType.medium} headerText={selected ? `${selected.id} · ${selected.title}` : ''} closeButtonAriaLabel="Close request details">
      {selected && <>
        <div className={styles.panelGrid}>
          <div><span className={styles.fieldLabel}>Status</span><span className={`${styles.badge} ${statusClass(selected.status)}`}>{selected.status}</span></div>
          <div><span className={styles.fieldLabel}>Priority</span><span className={priorityClass(selected.priority)}>{selected.priority}</span></div>
          <div><span className={styles.fieldLabel}>Requester</span><div className={styles.fieldValue}>{selected.requester}</div></div>
          <div><span className={styles.fieldLabel}>Submitted</span><div className={styles.fieldValue}>{selected.submitted}</div></div>
          <div><span className={styles.fieldLabel}>Approver</span><div className={styles.fieldValue}>{selected.approver}</div></div>
          <div><span className={styles.fieldLabel}>Assigned team</span><div className={styles.fieldValue}>{selected.assignee}</div></div>
          <div className={styles.fullWidth}><span className={styles.fieldLabel}>Request details</span><div className={styles.fieldValue}>{selected.description}</div></div>
          <div className={styles.fullWidth}><span className={styles.fieldLabel}>Service target</span><div className={selected.slaHours > 0 && selected.slaHours <= 3 ? styles.slaRisk : styles.slaGood}>{selected.slaHours > 0 ? `${selected.slaHours} hours remaining` : 'Completed'}</div></div>
        </div>
        {(selected.status === 'New' || selected.status === 'In review') && <div className={styles.panelActions}>
          <PrimaryButton iconProps={{ iconName: 'CheckMark' }} onClick={() => updateSelected({ status: 'Approved', slaHours: 0 }, `${selected.id} was approved.`)}>Approve</PrimaryButton>
          <DefaultButton iconProps={{ iconName: 'Cancel' }} onClick={() => updateSelected({ status: 'Rejected', slaHours: 0 }, `${selected.id} was rejected.`)}>Reject</DefaultButton>
          <DefaultButton iconProps={{ iconName: 'Forward' }} onClick={() => updateSelected({ status: 'In review', assignee: 'Service Operations' }, `${selected.id} was assigned to Service Operations.`)}>Assign</DefaultButton>
        </div>}
      </>}
    </Panel>

    <Panel isOpen={showCreate} onDismiss={() => setShowCreate(false)} type={PanelType.medium} headerText="New request" closeButtonAriaLabel="Close new request">
      <TextField label="Request title" required value={newTitle} onChange={(_, value) => setNewTitle(value || '')} />
      <Dropdown label="Category" selectedKey={newCategory} options={categoryOptions.slice(1)} onChange={(_, option) => setNewCategory(option?.key as RequestCategory)} />
      <Dropdown label="Priority" selectedKey={newPriority} options={priorityOptions.slice(1)} onChange={(_, option) => setNewPriority(option?.key as RequestPriority)} />
      <TextField label="Describe what is needed" required multiline rows={5} value={newDescription} onChange={(_, value) => setNewDescription(value || '')} />
      <div className={styles.panelActions}><PrimaryButton disabled={!newTitle.trim() || !newDescription.trim()} iconProps={{ iconName: 'Send' }} onClick={createRequest}>Submit request</PrimaryButton><DefaultButton onClick={() => setShowCreate(false)}>Cancel</DefaultButton></div>
    </Panel>
  </div>;
};
