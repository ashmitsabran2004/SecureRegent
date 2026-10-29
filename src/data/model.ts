import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
export type LeadStatus='New'|'Qualified'|'Converted'|'Unqualified';
export type Lead={id:string,name:string,company:string,email:string,phone:string,source:string,status:LeadStatus,service:string,owner:string,department:'Sales'|'Operations',date:Date};
export type Quote={id:string,leadId:string,service:string,status:'Pending'|'Accepted'|'Rejected',amount:number,date:Date};
export type Deal={id:string,leadId:string,service:string,priority:'High'|'Medium'|'Low',value:number,owner:string,date:Date,stage:string};
export type Order={id:string,dealId:string,service:string,stage:string,status:'Pending'|'In Progress'|'Completed'|'On Hold',due:Date,date:Date,owner:string};
export type Payment={id:string,dealId:string,date:Date,amount:number,mode:string};
export const services=['Private Limited Company','LLP Registration','GST','Trademark','FSSAI License','Annual Compliance','ISO Certification','Startup India Registration','DSC & DIN','Website Development','Penalty'];
export const sources=['Google Ads','Website','Just Dial','Referral','Other'];
export const sales=['Aarav Mehta','Diya Shah','Kabir Rao','Anaya Iyer','Rohan Kapoor','Mira Joshi'];
export const operations=['Ishaan Patel','Sara Khan','Vihaan Das','Aditi Nair','Arjun Sen'];
const rng=(seed:number)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}; const pick=<T,>(r:()=>number,a:readonly T[])=>a[Math.floor(r()*a.length)];
const rand=(r:()=>number,min:number,max:number)=>Math.round(min+r()*(max-min));
export const leads:Lead[]=[], quotes:Quote[]=[], deals:Deal[]=[], orders:Order[]=[], payments:Payment[]=[];
const r=rng(241017); export const anchor=new Date(2026,9,17,12);
for(let i=0;i<600;i++){const daysAgo=Math.floor(r()*r()*365);const date=addDays(anchor,-daysAgo); const owner=pick(r,sales);const status=pick(r,['New','New','Qualified','Qualified','Converted','Unqualified'] as LeadStatus[]);const service=pick(r,services);const lead:Lead={id:`LD-${String(i+1).padStart(4,'0')}`,name:pick(r,['Aarav','Diya','Kabir','Anaya','Rohan','Mira','Ishaan','Sara','Vihaan','Aditi'])+' '+pick(r,['Sharma','Patel','Mehta','Rao','Nair','Kapoor','Iyer','Khan','Das','Sen']),company:pick(r,['Northstar','BluePeak','Cedar','Aster','BrightPath','UrbanNest','Meridian','Greenfield','Pinnacle','CloudNine'])+' '+pick(r,['Consulting','Solutions','Ventures','Enterprises','Labs','Foods','Technologies']),email:`contact${i+1}@example.in`,phone:`+91 ${rand(r,70000,99999)} ${rand(r,10000,99999)}`,source:pick(r,sources),status,service,owner,department:'Sales',date};leads.push(lead);
 let qCount=rand(r,1,3);for(let q=0;q<qCount;q++){const qService=q===0?service:pick(r,services);const qStatus=pick(r,['Pending','Accepted','Rejected','Rejected'] as const);const quote:Quote={id:`QT-${String(quotes.length+1).padStart(4,'0')}`,leadId:lead.id,service:qService,status:qStatus,amount:rand(r,7000,125000),date};quotes.push(quote);
 if(qStatus==='Accepted'){const deal:Deal={id:`DL-${String(deals.length+1).padStart(4,'0')}`,leadId:lead.id,service:qService,priority:pick(r,['High','Medium','Low'] as const),value:quote.amount+rand(r,0,30000),owner,date,stage:pick(r,['Onboarding','Documents','Government filing','Review','Completed'])};deals.push(deal);lead.status='Converted';let orderCount=rand(r,1,3);for(let o=0;o<orderCount;o++){const status=pick(r,['Pending','In Progress','Completed','On Hold','Completed'] as const);orders.push({id:`OR-${String(orders.length+1).padStart(4,'0')}`,dealId:deal.id,service:qService,stage:pick(r,['Document collection','Preparation','Submission','Verification','Delivery']),status,date,due:addDays(date,rand(r,4,25)),owner:pick(r,operations)});}let remaining=deal.value;const pCount=rand(r,1,3);for(let p=0;p<pCount;p++){const amount=p===pCount-1?rand(r,Math.max(1,Math.floor(remaining*.25)),Math.max(1,remaining)):rand(r,Math.max(1,Math.floor(remaining*.1)),Math.max(1,Math.floor(remaining*.45)));remaining=Math.max(0,remaining-amount);payments.push({id:`PM-${String(payments.length+1).padStart(4,'0')}`,dealId:deal.id,date,amount,mode:pick(r,['UPI','Bank transfer','Credit card','NEFT'])});}}
 }
}
export const periodDates=(range:string,customStart?:string,customEnd?:string)=>{const end=endOfDay(anchor); if(range==='Today')return{start:startOfDay(anchor),end}; if(range==='Last 7 Days')return{start:startOfDay(subDays(anchor,6)),end};if(range==='Last 30 Days')return{start:startOfDay(subDays(anchor,29)),end};if(range==='Custom'&&customStart&&customEnd)return{start:startOfDay(new Date(customStart+'T12:00:00')),end:endOfDay(new Date(customEnd+'T12:00:00'))};return{start:startOfDay(subDays(anchor,29)),end};};
export const previousPeriod=(start:Date,end:Date)=>{const days=Math.max(1,Math.round((startOfDay(end).getTime()-startOfDay(start).getTime())/86400000)+1);return{start:startOfDay(subDays(start,days)),end:endOfDay(subDays(start,1)),days};};
const fullCurrency=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const abbreviatedCurrency=(n:number)=>n>=10000000?`₹${(n/10000000).toFixed(1)}Cr`:n>=100000?`₹${(n/100000).toFixed(1)}L`:fullCurrency(n);
const abbreviatedPreference=()=>{try{return JSON.parse(localStorage.getItem('secure-regent-preferences')||'{}').currencyDisplay==='abbreviated'}catch{return false}};
export const currency=(n:number)=>abbreviatedPreference()?abbreviatedCurrency(n):fullCurrency(n);
export const shortCurrency=(n:number)=>abbreviatedPreference()?abbreviatedCurrency(n):fullCurrency(n);
export const prettyDate=(d:Date)=>format(d,'dd MMM yyyy');
export const inside=(date:Date,start:Date,end:Date)=>date>=start&&date<=end;
