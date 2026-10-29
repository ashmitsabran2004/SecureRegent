import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, RotateCcw, Mail, Phone } from 'lucide-react';
import { sales, operations, currency, prettyDate } from '../data/model';
import type { Dataset } from '../data/selectors';
import { useStore } from '../store';

function PageFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const navigate = useNavigate();
  return <div className="content utility-page"><div className="breadcrumbs"><button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={17}/></button><Link to="/">Analytics</Link><ChevronRight size={14}/><span>{title}</span></div><div className="page-head"><div><h1>{title}</h1><p>{description}</p></div></div>{children}</div>;
}

const faqs = [
  ['How do filters work?', 'Date range, owner and department filters update dashboard metrics and charts. Filter values are reflected in the URL so you can share or reload the same view.'],
  ['How is the previous-period comparison calculated?', 'The dashboard compares the selected period with the immediately preceding period of equal length. Percentage change is (current − previous) ÷ previous. When the previous value is zero, the comparison is shown as 100% when the current value is non-zero, and 0% when both are zero.'],
  ['How do I export CSV?', 'Select your date, user and department filters, then choose Export in the top filter bar. The download contains the filtered leads, quotations, deals, orders and payments.'],
  ['How do drill-downs work?', 'Click a KPI, chart segment or table row to preview a connected record. Choose Open full page to see its profile, linked CRM records and timeline.'],
  ['What does each KPI mean?', 'New Leads, Qualified Leads, Converted Leads and Unqualified Leads count leads by current status. Conversion Rate is converted leads ÷ leads created in the selected period, capped at 100%; it is shown as — when there are no leads. Quotations Created counts quotes linked to those leads. Deals Created counts accepted-quote deals. Invoices Generated counts linked orders. Collected Revenue is the sum of linked payments. Total Deal Value is the sum of deal values; Outstanding is deal value less collected payments.'],
  ['What is the revenue target gauge?', 'The gauge compares collected payments in the selected view with the monthly target configured in Settings. Achieved progress is capped at 100%.'],
];
export function HelpPage() {
  const [query, setQuery] = useState(''); const visible = faqs.filter(([q,a]) => `${q} ${a}`.toLowerCase().includes(query.toLowerCase()));
  return <PageFrame title="Help center" description="Answers for using Regent Analytics and understanding your demo data."><div className="help-layout"><section className="card panel help-faq"><label className="help-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search help articles..." aria-label="Search help articles"/></label><div className="faq-list">{visible.length?visible.map(([q,a])=><details key={q} className="faq-item"><summary>{q}<ChevronRight size={15}/></summary><p>{a}</p></details>):<div className="empty"><b>No matching answers</b><span>Try searching for filters, exports or KPIs.</span></div>}</div></section><aside className="card panel contact-card"><h3>Still need help?</h3><p>Contact the SecureRegent workspace team. We’ll point you in the right direction.</p><a href="mailto:support@secureregent.example"><Mail size={15}/>support@secureregent.example</a><a href="tel:+911800000000"><Phone size={15}/>+91 1800 000 000</a></aside></div></PageFrame>;
}

export function ProfilePage() { return <PageFrame title="Admin profile" description="Demo administrator account details."><div className="card panel profile-page-card"><div className="detail-avatar">AS</div><div><h2>Admin user</h2><p>Workspace administrator · SecureRegent</p></div><dl><div><dt>Email</dt><dd>admin@secureRegent.in</dd></div><div><dt>Role</dt><dd>Administrator</dd></div><div><dt>Workspace</dt><dd>SecureRegent Business Workspace</dd></div><div><dt>Account status</dt><dd><span className="pill completed">Active demo account</span></dd></div></dl></div></PageFrame>; }

export function SettingsPage() {
  const s=useStore(); const employees=['All users',...sales,...operations];
  return <PageFrame title="Settings" description="Set workspace defaults and dashboard display preferences."><div className="card panel settings-panel"><div className="settings-grid">
    <label>Theme preference<select value={s.theme} onChange={e=>s.setPreference('theme',e.target.value as 'light'|'dark'|'system')}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>
    <label>Default date range<select value={s.defaultRange} onChange={e=>s.setPreference('defaultRange',e.target.value)}>{['Today','Last 7 Days','Last 30 Days','Custom'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Default department<select value={s.defaultDepartment} onChange={e=>s.setPreference('defaultDepartment',e.target.value)}>{['All departments','Sales','Operations'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Default user<select value={s.defaultUser} onChange={e=>s.setPreference('defaultUser',e.target.value)}>{employees.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Currency display<select value={s.currencyDisplay} onChange={e=>s.setPreference('currencyDisplay',e.target.value as 'full'|'abbreviated')}><option value="full">Full (₹1,02,928)</option><option value="abbreviated">Abbreviated (₹1.0L)</option></select></label>
    <label>Monthly revenue target (₹)<input type="number" min="0" step="10000" value={s.monthlyTarget} onChange={e=>s.setPreference('monthlyTarget',Math.max(0,Number(e.target.value)||0))}/></label>
  </div><div className="settings-actions"><span>Preferences save on this device and apply immediately.</span><button className="outline-btn" onClick={s.resetPreferences}><RotateCcw size={14}/>Reset to defaults</button></div></div></PageFrame>;
}

export function TeamActivityPage({ data, onEmployee }: { data: Dataset; onEmployee: (name:string)=>void }) {
  const staff=[...sales.map(name=>({name,department:'Sales'})),...operations.map(name=>({name,department:'Operations'}))];
  const rows=staff.map(x=>({ ...x, leadCount:data.leads.filter(l=>l.owner===x.name).length,dealCount:data.deals.filter(d=>d.owner===x.name).length,orderCount:data.orders.filter(o=>o.owner===x.name).length,completed:data.orders.filter(o=>o.owner===x.name&&o.status==='Completed').length,pipeline:data.deals.filter(d=>d.owner===x.name).reduce((n,d)=>n+d.value,0)}));
  return <PageFrame title="Team activity" description="Lead pipeline for Sales and order delivery for Operations."><div className="card panel"><div className="panel-head"><div><h3>Employee performance</h3><p>Metrics follow the active dashboard filters.</p></div></div><div className="table-wrap"><table><thead><tr>{['Employee','Department','Leads','Deals','Orders','Completed','Pipeline value'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.name} className="click-row" onClick={()=>onEmployee(x.name)}><td>{x.name}</td><td>{x.department}</td><td>{x.leadCount}</td><td>{x.dealCount}</td><td>{x.orderCount}</td><td>{x.completed}</td><td>{currency(x.pipeline)}</td></tr>)}</tbody></table></div></div></PageFrame>;
}

type ActivityRow={date:Date;type:string;id:string;name:string;detail:string;amount:number;owner:string;leadId:string;dealId:string};
export function ActivityLogPage({ data, onOpen }: { data: Dataset; onOpen: (kind:string,id:string)=>void }) {
  const [query,setQuery]=useState('');const [type,setType]=useState('All activity');const [page,setPage]=useState(0);
  const rows:ActivityRow[]=useMemo(()=>[
    ...data.leads.map(x=>({date:x.date,type:'Lead',id:x.id,name:x.name,detail:`${x.status} · ${x.company}`,amount:0,owner:x.owner,leadId:x.id,dealId:''})),
    ...data.quotes.map(x=>({date:x.date,type:'Quotation',id:x.id,name:x.leadId,detail:`${x.status} · ${x.service}`,amount:x.amount,owner:data.leads.find(l=>l.id===x.leadId)?.owner||'',leadId:x.leadId,dealId:''})),
    ...data.deals.map(x=>({date:x.date,type:'Deal',id:x.id,name:x.leadId,detail:`${x.stage} · ${x.service}`,amount:x.value,owner:x.owner,leadId:x.leadId,dealId:x.id})),
    ...data.orders.map(x=>({date:x.date,type:'Order',id:x.id,name:x.dealId,detail:`${x.status} · ${x.stage}`,amount:0,owner:x.owner,leadId:'',dealId:x.dealId})),
    ...data.payments.map(x=>({date:x.date,type:'Payment',id:x.id,name:x.dealId,detail:x.mode,amount:x.amount,owner:'',leadId:'',dealId:x.dealId})),
  ].sort((a,b)=>b.date.getTime()-a.date.getTime()),[data]);
  const filtered=rows.filter(x=>(type==='All activity'||x.type===type)&&`${x.id} ${x.name} ${x.detail} ${x.owner}`.toLowerCase().includes(query.toLowerCase()));const pages=Math.max(1,Math.ceil(filtered.length/15));const visible=filtered.slice(page*15,(page+1)*15);
  const drill=(x:ActivityRow)=>onOpen(x.type==='Lead'||x.type==='Quotation'?'lead':'deal',x.type==='Lead'||x.type==='Quotation'?x.leadId:x.dealId||x.id);
  return <PageFrame title="Activity log" description="Search and filter all CRM events in the current date range."><div className="card panel"><div className="activity-controls"><label className="table-search"><Search size={14}/><input placeholder="Search activity..." value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}}/></label><select value={type} onChange={e=>{setType(e.target.value);setPage(0)}} aria-label="Filter activity type">{['All activity','Lead','Quotation','Deal','Order','Payment'].map(x=><option key={x}>{x}</option>)}</select><span>{filtered.length} events</span></div><div className="table-wrap"><table><thead><tr>{['Date','Type','Record','Details','Owner','Amount'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{visible.length?visible.map(x=><tr key={`${x.type}-${x.id}`} className="click-row" onClick={()=>drill(x)}><td>{prettyDate(x.date)}</td><td>{x.type}</td><td>{x.id}</td><td>{x.detail}</td><td>{x.owner||'—'}</td><td>{x.amount?currency(x.amount):'—'}</td></tr>):<tr><td colSpan={6} className="no-rows">No activity matches these filters.</td></tr>}</tbody></table></div>{filtered.length>15&&<div className="table-pager"><span>Showing {page*15+1}–{Math.min((page+1)*15,filtered.length)} of {filtered.length}</span><button disabled={!page} onClick={()=>setPage(page-1)} aria-label="Previous page">‹</button><b>{page+1} / {pages}</b><button disabled={page+1>=pages} onClick={()=>setPage(page+1)} aria-label="Next page">›</button></div>}</div></PageFrame>;
}

export function SignedOutPage({ onSignIn }: { onSignIn:()=>void }) { return <PageFrame title="Signed out (demo)" description="You’re safely signed out of this demo session."><div className="card panel signed-out"><div className="empty-icon">✓</div><h2>See you next time</h2><p>Your demo workspace is still here whenever you’re ready.</p><button className="open-full" onClick={onSignIn}>Sign back in</button></div></PageFrame>; }
