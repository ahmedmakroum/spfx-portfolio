import * as React from 'react';
import { DefaultButton, Icon, MessageBar, MessageBarType, Panel, PanelType, PrimaryButton } from '@fluentui/react';
import styles from './OnboardingCommandCenter.module.scss';

type TaskStatus = 'Done' | 'In progress' | 'Next up';
type TaskCategory = 'People' | 'Tools' | 'Learning';

interface IOnboardingTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  due: string;
  owner: string;
  status: TaskStatus;
  duration: string;
  helpText: string;
}

const INITIAL_TASKS: IOnboardingTask[] = [
  { id: 'task-1', title: 'Meet your onboarding buddy', description: 'Book a 30-minute introduction with Maya, your go-to person for the first month.', category: 'People', due: 'Today', owner: 'You + Maya Chen', status: 'Next up', duration: '30 min', helpText: 'Use this meeting to ask the practical questions that do not fit into a policy document: how the team works, where decisions happen, and who knows what.' },
  { id: 'task-2', title: 'Set up your workspace', description: 'Confirm access to Teams, project files, and the product workspace.', category: 'Tools', due: 'Today', owner: 'You', status: 'In progress', duration: '15 min', helpText: 'If an app is missing, choose “Request help” and the IT service desk will receive a pre-filled access request.' },
  { id: 'task-3', title: 'Understand how we work', description: 'Explore our team principles, customer commitments, and decision-making guide.', category: 'Learning', due: 'Tomorrow', owner: 'You', status: 'Next up', duration: '20 min', helpText: 'This is a short guided read, designed to make your first team conversations easier and more useful.' },
  { id: 'task-4', title: 'Complete HR essentials', description: 'Review your benefits choices and confirm your personal details.', category: 'People', due: 'Friday', owner: 'People Operations', status: 'Next up', duration: '10 min', helpText: 'Your information is saved securely. You can return to the benefits selection before the deadline.' },
  { id: 'task-5', title: 'Read the security quick start', description: 'Learn the essentials for safe collaboration and reporting suspicious activity.', category: 'Learning', due: 'Friday', owner: 'Security team', status: 'Done', duration: '12 min', helpText: 'Security training is complete. Keep the quick reference nearby for your first few weeks.' }
];

const categoryIcon: Record<TaskCategory, string> = { People: 'People', Tools: 'Settings', Learning: 'Education' };

function statusClass(status: TaskStatus): string {
  return status === 'Done' ? styles.statusDone : status === 'In progress' ? styles.statusProgress : styles.statusNext;
}

export const OnboardingCommandCenter: React.FC<{ title: string }> = ({ title }) => {
  const [tasks, setTasks] = React.useState<IOnboardingTask[]>(INITIAL_TASKS);
  const [activeCategory, setActiveCategory] = React.useState<'All' | TaskCategory>('All');
  const [selectedTask, setSelectedTask] = React.useState<IOnboardingTask | undefined>();
  const [notice, setNotice] = React.useState('');

  const completedCount = tasks.filter(task => task.status === 'Done').length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const visibleTasks = tasks.filter(task => activeCategory === 'All' || task.category === activeCategory);
  const nextTask = tasks.find(task => task.status !== 'Done');

  const completeTask = (task: IOnboardingTask): void => {
    setTasks(items => items.map(item => item.id === task.id ? { ...item, status: 'Done' } : item));
    setSelectedTask(current => current && current.id === task.id ? { ...current, status: 'Done' } : current);
    setNotice(`Nice work — “${task.title}” is complete.`);
  };

  const requestHelp = (task: IOnboardingTask): void => {
    setNotice(`A support request for “${task.title}” is ready to send to ${task.owner}.`);
  };

  return <div className={styles.root}>
    <section className={styles.hero} aria-labelledby="onboarding-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Your first week · Day 2</p>
        <h1 id="onboarding-title" className={styles.title}>{title}, Jordan</h1>
        <p className={styles.subtitle}>A small, focused plan to help you feel confident, connected, and ready to contribute.</p>
      </div>
      <div className={styles.progressSummary} aria-label={`${progress}% of onboarding tasks complete`}>
        <div className={styles.progressRing} style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
        <div><strong>{completedCount} of {tasks.length} complete</strong><span>Great momentum so far</span></div>
      </div>
    </section>

    {notice && <MessageBar className={styles.notice} messageBarType={MessageBarType.success} isMultiline={false} onDismiss={() => setNotice('')}>{notice}</MessageBar>}

    <div className={styles.layout}>
      <main>
        <section className={styles.nextAction} aria-labelledby="next-action-title">
          <div className={styles.nextActionIcon}><Icon iconName="LightningBolt" /></div>
          <div className={styles.nextActionCopy}>
            <p className={styles.cardEyebrow}>Recommended next step</p>
            <h2 id="next-action-title">{nextTask ? nextTask.title : 'You are all set for now'}</h2>
            <p>{nextTask ? nextTask.description : 'You have completed every item in your first-week plan.'}</p>
          </div>
          {nextTask && <PrimaryButton onClick={() => setSelectedTask(nextTask)}>Open task</PrimaryButton>}
        </section>

        <section aria-labelledby="plan-title">
          <div className={styles.sectionHeader}><div><h2 id="plan-title">Your first-week plan</h2><p>Complete the essentials at your own pace. We will keep the important things visible.</p></div><span className={styles.taskCount}>{visibleTasks.length} tasks</span></div>
          <div className={styles.filters} aria-label="Filter onboarding tasks">
            {(['All', 'People', 'Tools', 'Learning'] as Array<'All' | TaskCategory>).map(category => <button key={category} className={`${styles.filterButton} ${activeCategory === category ? styles.filterActive : ''}`} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className={styles.taskList}>
            {visibleTasks.map(task => <article className={styles.task} key={task.id}>
              <div className={`${styles.taskIcon} ${task.status === 'Done' ? styles.taskIconDone : ''}`}><Icon iconName={task.status === 'Done' ? 'CheckMark' : categoryIcon[task.category]} /></div>
              <div className={styles.taskBody}><div className={styles.taskTopline}><span className={styles.category}>{task.category}</span><span className={`${styles.status} ${statusClass(task.status)}`}>{task.status}</span></div><h3>{task.title}</h3><p>{task.description}</p><div className={styles.taskMeta}><span><Icon iconName="Clock" /> {task.duration}</span><span><Icon iconName="Calendar" /> Due {task.due}</span><span><Icon iconName="Contact" /> {task.owner}</span></div></div>
              <DefaultButton className={styles.taskButton} onClick={() => setSelectedTask(task)}>{task.status === 'Done' ? 'View' : 'Continue'}</DefaultButton>
            </article>)}
          </div>
        </section>
      </main>

      <aside className={styles.sidebar} aria-label="Onboarding support">
        <section className={styles.sidebarCard}><div className={styles.avatar} aria-hidden="true">MC</div><p className={styles.cardEyebrow}>Your onboarding buddy</p><h2>Maya Chen</h2><p className={styles.sidebarText}>Product Operations · Here to help you navigate the people, tools, and unwritten rules.</p><DefaultButton iconProps={{ iconName: 'Chat' }} onClick={() => setNotice('A Teams chat with Maya Chen is ready to open.')}>Message Maya</DefaultButton></section>
        <section className={styles.sidebarCard}><p className={styles.cardEyebrow}>This week’s rhythm</p><ol className={styles.timeline}><li className={styles.timelineDone}><span>Mon</span><div><strong>Welcome and setup</strong><small>Completed</small></div></li><li className={styles.timelineCurrent}><span>Tue</span><div><strong>Meet the team</strong><small>Today</small></div></li><li><span>Wed</span><div><strong>Customer context</strong><small>2 short sessions</small></div></li><li><span>Fri</span><div><strong>Week-one check-in</strong><small>With your manager</small></div></li></ol></section>
        <section className={`${styles.sidebarCard} ${styles.helpCard}`}><Icon iconName="Help" /><div><h2>Need a hand?</h2><p>Ask a question or find the right support channel without losing your place.</p><button onClick={() => setNotice('The onboarding help centre is ready to open.')}>Visit help centre <Icon iconName="ChevronRight" /></button></div></section>
      </aside>
    </div>

    <Panel isOpen={!!selectedTask} onDismiss={() => setSelectedTask(undefined)} type={PanelType.medium} headerText={selectedTask?.title || ''} closeButtonAriaLabel="Close onboarding task">
      {selectedTask && <div className={styles.panelContent}>
        <div className={styles.panelBadges}><span className={styles.category}>{selectedTask.category}</span><span className={`${styles.status} ${statusClass(selectedTask.status)}`}>{selectedTask.status}</span></div>
        <p className={styles.panelLead}>{selectedTask.description}</p>
        <div className={styles.detailGrid}><div><span>Owner</span><strong>{selectedTask.owner}</strong></div><div><span>Time needed</span><strong>{selectedTask.duration}</strong></div><div><span>Target</span><strong>{selectedTask.due}</strong></div></div>
        <div className={styles.helpBox}><Icon iconName="Info" /><p>{selectedTask.helpText}</p></div>
        <div className={styles.panelActions}>{selectedTask.status !== 'Done' && <PrimaryButton iconProps={{ iconName: 'CheckMark' }} onClick={() => completeTask(selectedTask)}>Mark complete</PrimaryButton>}<DefaultButton iconProps={{ iconName: 'Help' }} onClick={() => requestHelp(selectedTask)}>Request help</DefaultButton></div>
      </div>}
    </Panel>
  </div>;
};
