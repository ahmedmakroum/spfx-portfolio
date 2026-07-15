import * as React from 'react';
import { DefaultButton, Icon, MessageBar, MessageBarType, Panel, PanelType, PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';
import styles from './KnowledgeDiscoveryHub.module.scss';

type ContentType = 'Guide' | 'Policy' | 'Template' | 'News';

interface IKnowledgeItem {
  id: string;
  title: string;
  excerpt: string;
  type: ContentType;
  topic: string;
  owner: string;
  updated: string;
  freshness: 'Fresh' | 'Review soon' | 'Needs review';
  readTime: string;
  tags: string[];
  promoted?: boolean;
  answer?: string;
}

interface ITopic {
  name: string;
  description: string;
  icon: string;
  color: 'violet' | 'blue' | 'teal' | 'orange';
}

const TOPICS: ITopic[] = [
  { name: 'Ways of working', description: 'Rituals, decisions, and team norms.', icon: 'People', color: 'violet' },
  { name: 'Customer knowledge', description: 'Personas, research, and market context.', icon: 'CustomerAssets', color: 'blue' },
  { name: 'Tools and access', description: 'Set-up guides and service support.', icon: 'Settings', color: 'teal' },
  { name: 'Policies and standards', description: 'The current rules and playbooks.', icon: 'PageCheckedOut', color: 'orange' }
];

const MOCK_ITEMS: IKnowledgeItem[] = [
  { id: 'remote-work', title: 'Hybrid working guide', excerpt: 'Plan flexible work in a way that keeps customer coverage, collaboration, and wellbeing in balance.', type: 'Guide', topic: 'Ways of working', owner: 'People Operations', updated: 'Updated 4 days ago', freshness: 'Fresh', readTime: '6 min read', tags: ['remote work', 'hybrid', 'team norms'], promoted: true, answer: 'For regular hybrid work, agree your team anchor days, keep calendars current, and use the workspace booking tool for office days. Your manager can approve an exception when a role needs a different pattern.' },
  { id: 'expense', title: 'Expenses: what you can claim and how', excerpt: 'A clear route for submitting travel, client, and home-working expenses before the monthly cut-off.', type: 'Policy', topic: 'Policies and standards', owner: 'Finance Operations', updated: 'Updated 12 days ago', freshness: 'Fresh', readTime: '5 min read', tags: ['expenses', 'travel', 'finance'], promoted: true, answer: 'Submit itemised receipts in the expenses portal within 30 days. Client travel needs manager approval before booking; home-working equipment is covered through the approved supplier catalogue.' },
  { id: 'customer-interview', title: 'Customer interview planning kit', excerpt: 'A practical template, consent checklist, and discussion guide for learning from customers with care.', type: 'Template', topic: 'Customer knowledge', owner: 'Research Practice', updated: 'Updated 3 weeks ago', freshness: 'Review soon', readTime: '8 min read', tags: ['research', 'customers', 'interviews'] },
  { id: 'software-access', title: 'Request software or workspace access', excerpt: 'Find the right request route for applications, shared sites, distribution lists, and product environments.', type: 'Guide', topic: 'Tools and access', owner: 'Service Operations', updated: 'Updated yesterday', freshness: 'Fresh', readTime: '4 min read', tags: ['access', 'software', 'teams'] },
  { id: 'decision-record', title: 'Team decision record template', excerpt: 'Capture the context, decision, owner, and follow-up so important choices remain easy to understand.', type: 'Template', topic: 'Ways of working', owner: 'Product Operations', updated: 'Updated 2 months ago', freshness: 'Needs review', readTime: '3 min read', tags: ['decisions', 'template', 'meetings'] },
  { id: 'security-reporting', title: 'How to report a security concern', excerpt: 'What to do when something feels suspicious, including urgent contacts and the information to preserve.', type: 'Policy', topic: 'Policies and standards', owner: 'Security', updated: 'Updated 6 days ago', freshness: 'Fresh', readTime: '3 min read', tags: ['security', 'incident', 'phishing'] },
  { id: 'research-roundup', title: 'Customer insights: Q2 research roundup', excerpt: 'The strongest patterns from recent customer interviews, support conversations, and usage research.', type: 'News', topic: 'Customer knowledge', owner: 'Customer Insights', updated: 'Updated 8 days ago', freshness: 'Fresh', readTime: '7 min read', tags: ['research', 'customers', 'insights'] }
];

function matches(item: IKnowledgeItem, query: string, topic: string): boolean {
  const normalized = query.trim().toLowerCase();
  const text = [item.title, item.excerpt, item.topic, item.type, item.owner, item.tags.join(' ')].join(' ').toLowerCase();
  return (topic === 'All topics' || item.topic === topic) && (!normalized || text.indexOf(normalized) >= 0);
}

const freshnessClass: Record<IKnowledgeItem['freshness'], string> = {
  Fresh: styles.fresh,
  'Review soon': styles.reviewSoon,
  'Needs review': styles.needsReview
};

export const KnowledgeDiscoveryHub: React.FC<{ title: string; useMockData: boolean }> = ({ title, useMockData }) => {
  const [query, setQuery] = React.useState('');
  const [activeTopic, setActiveTopic] = React.useState('All topics');
  const [selectedItem, setSelectedItem] = React.useState<IKnowledgeItem | undefined>();
  const [feedback, setFeedback] = React.useState<Record<string, 'useful' | 'notUseful'>>({});
  const [notice, setNotice] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const timer = React.useRef<number | undefined>();

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const runSearch = (): void => {
    window.clearTimeout(timer.current);
    setIsLoading(true);
    timer.current = window.setTimeout(() => setIsLoading(false), 280);
  };

  const results = useMockData ? MOCK_ITEMS.filter(item => matches(item, query, activeTopic)) : [];
  const promoted = results.filter(item => item.promoted).slice(0, 2);
  const regularResults = results.filter(item => !item.promoted);

  const provideFeedback = (item: IKnowledgeItem, value: 'useful' | 'notUseful'): void => {
    setFeedback(current => ({ ...current, [item.id]: value }));
    setNotice(value === 'useful' ? `Thanks — “${item.title}” has been marked useful.` : `Thanks — we will use your feedback to improve results for “${item.title}”.`);
  };

  const openTopic = (topic: string): void => {
    setActiveTopic(topic);
    setQuery('');
    runSearch();
  };

  return <div className={styles.root}>
    <section className={styles.hero} aria-labelledby="knowledge-title">
      <p className={styles.eyebrow}>Find the answer, then keep moving</p>
      <h1 id="knowledge-title">{title}</h1>
      <p>Search trusted guides, policies, and team knowledge—kept useful by the people who use it.</p>
      <div className={styles.searchRow} role="search">
        <Icon iconName="Search" aria-hidden="true" />
        <input aria-label="Search knowledge" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && runSearch()} placeholder="Try “hybrid work”, “expenses”, or “customer interviews”" />
        <PrimaryButton onClick={runSearch}>Search</PrimaryButton>
      </div>
      <div className={styles.suggestions} aria-label="Suggested searches"><span>Popular:</span>{['Hybrid work', 'Expenses', 'Software access'].map(suggestion => <button key={suggestion} onClick={() => { setQuery(suggestion); runSearch(); }}>{suggestion}</button>)}</div>
    </section>

    {notice && <MessageBar className={styles.notice} messageBarType={MessageBarType.success} isMultiline={false} onDismiss={() => setNotice('')}>{notice}</MessageBar>}

    <section className={styles.topicSection} aria-labelledby="browse-topics">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Browse with confidence</p><h2 id="browse-topics">Start with a topic</h2></div><button className={styles.clearButton} onClick={() => openTopic('All topics')} disabled={activeTopic === 'All topics'}>Clear topic</button></div>
      <div className={styles.topicGrid}>{TOPICS.map(topic => <button className={`${styles.topicCard} ${activeTopic === topic.name ? styles.topicActive : ''}`} key={topic.name} aria-pressed={activeTopic === topic.name} onClick={() => openTopic(topic.name)}><span className={`${styles.topicIcon} ${styles[topic.color]}`}><Icon iconName={topic.icon} /></span><span><strong>{topic.name}</strong><small>{topic.description}</small></span><Icon className={styles.arrow} iconName="ChevronRight" /></button>)}</div>
    </section>

    <section className={styles.resultsSection} aria-labelledby="results-title" aria-live="polite">
      <div className={styles.resultsHeading}><div><p className={styles.eyebrow}>Search results</p><h2 id="results-title">{query ? `Results for “${query}”` : activeTopic === 'All topics' ? 'Recommended knowledge' : activeTopic}</h2><p>{isLoading ? 'Looking through trusted knowledge…' : `${results.length} ${results.length === 1 ? 'result' : 'results'} from verified sources`}</p></div>{(query || activeTopic !== 'All topics') && <DefaultButton iconProps={{ iconName: 'ClearFilter' }} onClick={() => { setQuery(''); openTopic('All topics'); }}>Reset search</DefaultButton>}</div>

      {isLoading && <div className={styles.loading}><Spinner size={SpinnerSize.medium} label="Searching knowledge" /></div>}
      {!isLoading && results.length === 0 && <div className={styles.emptyState}><Icon iconName="SearchIssue" /><h3>No useful match yet</h3><p>Try a broader phrase, browse a topic, or ask the knowledge team to add an answer.</p><DefaultButton iconProps={{ iconName: 'Feedback' }} onClick={() => setNotice('Your knowledge request is ready to send to the content team.')}>Request an answer</DefaultButton></div>}
      {!isLoading && results.length > 0 && <div className={styles.resultLayout}>
        <main>
          {promoted.length > 0 && <section className={styles.promoted} aria-labelledby="promoted-title"><div className={styles.promotedHeading}><Icon iconName="Lightbulb" /><div><p className={styles.eyebrow}>Promoted answer</p><h3 id="promoted-title">Start here</h3></div></div>{promoted.map(item => <article className={styles.answer} key={item.id}><div><h4>{item.title}</h4><p>{item.answer || item.excerpt}</p><div className={styles.resultMeta}><span><Icon iconName="Page" /> {item.type}</span><span><Icon iconName="Clock" /> {item.readTime}</span><span className={`${styles.freshness} ${freshnessClass[item.freshness]}`}>{item.freshness}</span></div></div><div className={styles.answerActions}><DefaultButton onClick={() => setSelectedItem(item)}>Open guide</DefaultButton><div className={styles.feedback} aria-label={`Was ${item.title} useful?`}><span>Useful?</span><button className={feedback[item.id] === 'useful' ? styles.feedbackActive : ''} aria-label="Yes, useful" aria-pressed={feedback[item.id] === 'useful'} onClick={() => provideFeedback(item, 'useful')}><Icon iconName="Like" /></button><button className={feedback[item.id] === 'notUseful' ? styles.feedbackActive : ''} aria-label="No, not useful" aria-pressed={feedback[item.id] === 'notUseful'} onClick={() => provideFeedback(item, 'notUseful')}><Icon iconName="Dislike" /></button></div></div></article>)}</section>}
          {regularResults.length > 0 && <section className={styles.resultList} aria-labelledby="more-results"><h3 id="more-results">More results</h3>{regularResults.map(item => <article className={styles.resultCard} key={item.id}><button className={styles.resultTitle} onClick={() => setSelectedItem(item)}>{item.title}</button><p>{item.excerpt}</p><div className={styles.resultFooter}><div className={styles.resultMeta}><span>{item.type}</span><span>{item.topic}</span><span>{item.readTime}</span><span className={`${styles.freshness} ${freshnessClass[item.freshness]}`}>{item.freshness}</span></div><span className={styles.updated}>{item.updated}</span></div></article>)}</section>}
        </main>
        <aside className={styles.sidebar} aria-label="Knowledge quality"><section className={styles.sideCard}><Icon iconName="CompletedSolid" /><h3>Trusted content</h3><p>Every result shows its owner and freshness signal so you can judge it quickly.</p></section><section className={styles.sideCard}><p className={styles.eyebrow}>Keep it current</p><h3>Spot something outdated?</h3><p>Feedback reaches the content owner with the result context attached.</p><DefaultButton iconProps={{ iconName: 'Edit' }} onClick={() => setNotice('A content improvement request is ready to send.')}>Suggest an update</DefaultButton></section></aside>
      </div>}
    </section>

    <Panel isOpen={!!selectedItem} onDismiss={() => setSelectedItem(undefined)} type={PanelType.medium} headerText={selectedItem?.title || ''} closeButtonAriaLabel="Close knowledge item">
      {selectedItem && <div className={styles.panelContent}><div className={styles.resultMeta}><span>{selectedItem.type}</span><span>{selectedItem.topic}</span><span className={`${styles.freshness} ${freshnessClass[selectedItem.freshness]}`}>{selectedItem.freshness}</span></div><p className={styles.panelLead}>{selectedItem.answer || selectedItem.excerpt}</p><div className={styles.detailBox}><span>Content owner</span><strong>{selectedItem.owner}</strong><span>Last reviewed</span><strong>{selectedItem.updated}</strong><span>Estimated time</span><strong>{selectedItem.readTime}</strong></div><p className={styles.panelBody}>This demo keeps the detail surface intentionally focused. In a tenant implementation, this is the seam for Microsoft Search or Microsoft Graph result links, source metadata, permissions trimming, and a real feedback workflow.</p><div className={styles.panelActions}><PrimaryButton iconProps={{ iconName: 'NavigateExternalInline' }} onClick={() => setNotice(`“${selectedItem.title}” is ready to open from its SharePoint source.`)}>Open source</PrimaryButton><DefaultButton iconProps={{ iconName: 'Feedback' }} onClick={() => provideFeedback(selectedItem, 'useful')}>Mark useful</DefaultButton></div></div>}
    </Panel>
  </div>;
};
