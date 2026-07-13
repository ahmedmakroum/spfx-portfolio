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
import styles from './ProjectHealthBoard.module.scss';

type Health = 'On track' | 'At risk' | 'Critical';

interface IMilestone {
  date: string;
  title: string;
  owner: string;
  complete: boolean;
}

interface IProject {
  id: string;
  name: string;
  sponsor: string;
  manager: string;
  health: Health;
  progress: number;
  phase: string;
  nextMilestone: string;
  summary: string;
  milestones: IMilestone[];
}

interface IRisk {
  id: string;
  project: string;
  title: string;
  detail: string;
  owner: string;
  severity: 'High' | 'Medium';
}

interface IProjectHealthBoardProps {
  title: string;
  useMockData: boolean;
}

const PROJECTS: IProject[] = [
  { id: 'PRJ-21', name: 'Intranet refresh', sponsor: 'Comms & Culture', manager: 'Leah Kim', health: 'On track', progress: 72, phase: 'Build', nextMilestone: 'UAT starts 22 Jul', summary: 'A modern intranet with departmental hubs, employee news, and improved content governance.', milestones: [{ date: '18 Jul', title: 'Content migration complete', owner: 'Content team', complete: true }, { date: '22 Jul', title: 'User acceptance testing', owner: 'Leah Kim', complete: false }, { date: '08 Aug', title: 'Production launch', owner: 'Digital Workplace', complete: false }] },
  { id: 'PRJ-18', name: 'Finance planning platform', sponsor: 'Finance', manager: 'Owen Davis', health: 'At risk', progress: 48, phase: 'Configuration', nextMilestone: 'Data migration sign-off', summary: 'Replacement planning platform connecting annual budgeting, forecasting, and management reporting.', milestones: [{ date: '11 Jul', title: 'Chart of accounts mapping', owner: 'Finance systems', complete: true }, { date: '19 Jul', title: 'Data migration sign-off', owner: 'Owen Davis', complete: false }, { date: '02 Aug', title: 'Pilot launch', owner: 'Finance transformation', complete: false }] },
  { id: 'PRJ-15', name: 'Workplace consolidation', sponsor: 'Operations', manager: 'Amina Yusuf', health: 'Critical', progress: 34, phase: 'Planning', nextMilestone: 'Lease decision 25 Jul', summary: 'Consolidation of two office locations with a new hybrid-working floor plan and technology upgrade.', milestones: [{ date: '15 Jul', title: 'Employee consultation closes', owner: 'People Operations', complete: true }, { date: '25 Jul', title: 'Lease decision', owner: 'Amina Yusuf', complete: false }, { date: '14 Aug', title: 'Move plan approved', owner: 'Workplace', complete: false }] },
  { id: 'PRJ-12', name: 'Service catalogue rollout', sponsor: 'Technology', manager: 'Ben Carter', health: 'On track', progress: 86, phase: 'Readiness', nextMilestone: 'Go-live 29 Jul', summary: 'A single request catalogue for employee technology and workplace services with defined service targets.', milestones: [{ date: '10 Jul', title: 'Knowledge articles approved', owner: 'Service Operations', complete: true }, { date: '19 Jul', title: 'Support readiness review', owner: 'Ben Carter', complete: false }, { date: '29 Jul', title: 'Go-live', owner: 'Technology', complete: false }] }
];

const RISKS: IRisk[] = [
  { id: 'RSK-07', project: 'Finance planning platform', title: 'Source data quality is below migration threshold', detail: 'Three legacy cost-centre feeds still contain unmapped codes. Sign-off cannot proceed until the exceptions are resolved.', owner: 'Owen Davis', severity: 'High' },
  { id: 'RSK-04', project: 'Workplace consolidation', title: 'Lease option expires before the decision meeting', detail: 'Property partner needs a written extension before 18 July to preserve the preferred floor plan.', owner: 'Amina Yusuf', severity: 'High' },
  { id: 'RSK-11', project: 'Intranet refresh', title: 'Two department content owners are unconfirmed', detail: 'The migration schedule may need to move if owners are not nominated this week.', owner: 'Leah Kim', severity: 'Medium' }
];

const healthOptions: IDropdownOption[] = [{ key: 'all', text: 'All health states' }, ...(['On track', 'At risk', 'Critical'] as Health[]).map(value => ({ key: value, text: value }))];
const managerOptions: IDropdownOption[] = [{ key: 'all', text: 'All managers' }, ...PROJECTS.map(project => ({ key: project.manager, text: project.manager }))];

function healthClass(health: Health): string {
  return health === 'On track' ? styles.healthGood : health === 'At risk' ? styles.healthWarn : styles.healthBad;
}

export const ProjectHealthBoard: React.FC<IProjectHealthBoardProps> = ({ title, useMockData }) => {
  const [projects, setProjects] = React.useState(PROJECTS);
  const [risks, setRisks] = React.useState(RISKS);
  const [query, setQuery] = React.useState('');
  const [health, setHealth] = React.useState('all');
  const [manager, setManager] = React.useState('all');
  const [selected, setSelected] = React.useState<IProject | undefined>();
  const [notice, setNotice] = React.useState('');

  const filtered = projects.filter(project => {
    const term = query.trim().toLowerCase();
    return (!term || `${project.name} ${project.id} ${project.sponsor}`.toLowerCase().includes(term)) &&
      (health === 'all' || project.health === health) && (manager === 'all' || project.manager === manager);
  });
  const onTrack = projects.filter(project => project.health === 'On track').length;
  const atRisk = projects.filter(project => project.health === 'At risk').length;
  const critical = projects.filter(project => project.health === 'Critical').length;
  const averageProgress = Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);

  const updateProject = (changes: Partial<IProject>, message: string): void => {
    if (!selected) return;
    const updated = { ...selected, ...changes };
    setProjects(items => items.map(item => item.id === updated.id ? updated : item));
    setSelected(updated);
    setNotice(message);
  };

  const mitigateRisk = (risk: IRisk): void => {
    setRisks(items => items.filter(item => item.id !== risk.id));
    setNotice(`${risk.id} was marked mitigated.`);
  };

  return <div className={styles.root}>
    <div className={styles.header}>
      <div><p className={styles.eyebrow}>Delivery portfolio</p><h1 className={styles.title}>{title}</h1><p className={styles.subtitle}>See delivery confidence, focus the steering conversation, and remove blockers before they affect outcomes.</p></div>
      <DefaultButton iconProps={{ iconName: 'Refresh' }} onClick={() => setNotice('Portfolio data was refreshed.')}>Refresh</DefaultButton>
    </div>
    {!useMockData && <MessageBar messageBarType={MessageBarType.warning} className={styles.notice}>Live project-list integration is not configured in this portfolio build. The workflow below uses its demo dataset.</MessageBar>}
    {notice && <MessageBar messageBarType={MessageBarType.success} isMultiline={false} className={styles.notice} onDismiss={() => setNotice('')}>{notice}</MessageBar>}
    <div className={styles.metrics}>
      <div className={`${styles.metric} ${styles.metricGood}`}><span className={styles.metricLabel}>On track</span><span className={styles.metricValue}>{onTrack}</span></div>
      <div className={`${styles.metric} ${styles.metricWarn}`}><span className={styles.metricLabel}>At risk</span><span className={styles.metricValue}>{atRisk}</span></div>
      <div className={`${styles.metric} ${styles.metricBad}`}><span className={styles.metricLabel}>Critical</span><span className={styles.metricValue}>{critical}</span></div>
      <div className={styles.metric}><span className={styles.metricLabel}>Portfolio progress</span><span className={styles.metricValue}>{averageProgress}%</span></div>
    </div>
    <div className={styles.layout}>
      <section aria-label="Project portfolio">
        <div className={styles.filters}>
          <TextField className={styles.filter} label="Search projects" placeholder="Project name, ID, or sponsor" value={query} onChange={(_, value) => setQuery(value || '')} iconProps={{ iconName: 'Search' }} />
          <Dropdown className={styles.filter} label="Health" selectedKey={health} options={healthOptions} onChange={(_, option) => setHealth(String(option?.key || 'all'))} />
          <Dropdown className={styles.filter} label="Project manager" selectedKey={manager} options={managerOptions} onChange={(_, option) => setManager(String(option?.key || 'all'))} />
        </div>
        <div className={styles.tableWrap}>{filtered.length === 0 ? <div className={styles.empty}>No projects match the current filters.</div> : <table className={styles.table}>
          <thead><tr><th>Project</th><th>Health</th><th>Progress</th><th>Phase</th><th>Next milestone</th></tr></thead>
          <tbody>{filtered.map(project => <tr key={project.id}><td><button className={styles.projectButton} onClick={() => setSelected(project)}>{project.name}</button><div className={styles.subtext}>{project.id} · {project.manager}</div></td><td><span className={`${styles.health} ${healthClass(project.health)}`}>{project.health}</span></td><td><div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${project.progress}%` }} /></div><div className={styles.subtext}>{project.progress}% complete</div></td><td>{project.phase}</td><td>{project.nextMilestone}</td></tr>)}</tbody>
        </table>}</div>
      </section>
      <aside className={styles.side}>
        <h2 className={styles.sideTitle}>Open risks</h2><p className={styles.sideHint}>Items that need active ownership in the next steering cycle.</p>
        {risks.length === 0 ? <div className={styles.empty}>No open risks.</div> : risks.map(risk => <div className={styles.risk} key={risk.id}><div className={styles.riskTop}><span className={`${styles.health} ${risk.severity === 'High' ? styles.healthBad : styles.healthWarn}`}>{risk.severity}</span><DefaultButton onClick={() => mitigateRisk(risk)}>Mitigate</DefaultButton></div><div className={styles.riskTitle}>{risk.title}</div><div className={styles.riskBody}>{risk.detail}</div><div className={styles.riskMeta}>{risk.project} · Owner: {risk.owner}</div></div>)}
      </aside>
    </div>
    <Panel isOpen={!!selected} onDismiss={() => setSelected(undefined)} type={PanelType.medium} headerText={selected ? `${selected.id} · ${selected.name}` : ''} closeButtonAriaLabel="Close project details">
      {selected && <><div className={styles.panelGrid}><div><span className={styles.fieldLabel}>Health</span><span className={`${styles.health} ${healthClass(selected.health)}`}>{selected.health}</span></div><div><span className={styles.fieldLabel}>Progress</span><div className={styles.fieldValue}>{selected.progress}% complete</div></div><div><span className={styles.fieldLabel}>Project manager</span><div className={styles.fieldValue}>{selected.manager}</div></div><div><span className={styles.fieldLabel}>Sponsor</span><div className={styles.fieldValue}>{selected.sponsor}</div></div><div className={styles.full}><span className={styles.fieldLabel}>Delivery summary</span><div className={styles.fieldValue}>{selected.summary}</div></div></div>
      <h2 className={styles.sectionTitle}>Milestones</h2>{selected.milestones.map(milestone => <div className={styles.milestone} key={milestone.title}><span className={styles.milestoneDate}>{milestone.date}</span><div><div className={styles.milestoneTitle}>{milestone.title}</div><div className={styles.milestoneMeta}>Owner: {milestone.owner}</div></div><span className={`${styles.health} ${milestone.complete ? styles.healthGood : styles.healthWarn}`}>{milestone.complete ? 'Complete' : 'Planned'}</span></div>)}
      <div className={styles.actions}>{selected.health !== 'On track' && <PrimaryButton iconProps={{ iconName: 'CheckMark' }} onClick={() => updateProject({ health: 'On track' }, `${selected.name} was marked on track.`)}>Mark on track</PrimaryButton>}<DefaultButton iconProps={{ iconName: 'Edit' }} onClick={() => setNotice(`Update session opened for ${selected.name}.`)}>Update status</DefaultButton></div></>}
    </Panel>
  </div>;
};
