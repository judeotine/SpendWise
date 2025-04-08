import{c as S,j as e,a as C,m as l,r as c,u as T,f as M,s as z,p as B,L as P,t as k,b as R}from"./index-BQP0fyHA.js";import{g as $,a as H,P as U,C as E,b as K}from"./storage-CypTBWy_.js";import{M as w}from"./MoneyAmount-CWBpIcKK.js";import{C as Y}from"./CategoryIcon-9rblxCWz.js";import{f as A}from"./categories-DStd93aM.js";import{s as I,f as L}from"./format-DlqhSfMX.js";import{B as O}from"./button-GPVt3lpZ.js";import{D as q,a as G,b as V,c as J,d as Q,e as X,f as Z}from"./dialog-BtKVVTZx.js";import{D as _}from"./dollar-sign-DQu1IkXk.js";import"./Logo-K4bnVDL9.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=S("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=S("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=S("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=S("Wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]]);function ne({value:m,max:s=100,className:r,indicatorClassName:h,showValue:p=!1,label:u,size:b="md",showAnimation:f=!0}){const n=Math.min(100,Math.max(0,m/s*100)),g={sm:"h-2",md:"h-4",lg:"h-6"},j=()=>n<30?"bg-gradient-to-r from-red-400 to-red-500":n<70?"bg-gradient-to-r from-yellow-400 to-yellow-500":"bg-gradient-to-r from-primary/80 to-primary";return e.jsxs("div",{className:"w-full space-y-1",children:[(u||p)&&e.jsxs("div",{className:"flex justify-between text-xs",children:[u&&e.jsx("span",{className:"text-muted-foreground",children:u}),p&&e.jsxs("span",{className:"font-medium",children:[m.toLocaleString()," / ",s.toLocaleString(),e.jsxs("span",{className:"ml-1 text-muted-foreground",children:["(",n.toFixed(0),"%)"]})]})]}),e.jsx("div",{className:C("relative overflow-hidden rounded-full bg-secondary/30",g[b],r),children:e.jsx(l.div,{className:C("h-full relative overflow-hidden rounded-full",h||j()),initial:{width:f?"0%":`${n}%`},animate:{width:`${n}%`},transition:{duration:.7,ease:"easeOut"},children:n>0&&e.jsx(l.div,{className:"absolute inset-0 w-full h-full",style:{background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",backgroundSize:"200% 100%"},animate:{backgroundPosition:["0% 0%","200% 0%"]},transition:{duration:1.5,repeat:1/0,ease:"linear"}})})})]})}function re(m,s){const r=I(m),h=I(s);return+r==+h}const ie=c.memo(function({expense:s,onClick:r,className:h}){const{amount:p,category:u,description:b,date:f,currency:n}=s,{activeCurrency:g}=T();return e.jsxs("div",{className:`flex items-center p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer ${h||""}`,onClick:r,children:[e.jsx(Y,{category:u}),e.jsxs("div",{className:"ml-3 flex-1",children:[e.jsx("div",{className:"font-medium",children:b}),e.jsxs("div",{className:"text-xs text-muted-foreground flex",children:[e.jsx("span",{children:A(u)}),e.jsx("span",{className:"mx-1",children:"•"}),e.jsx("span",{children:L(new Date(f),"MMM d")}),n&&n!==g&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"mx-1",children:"•"}),e.jsxs("span",{children:["Original: ",n]})]})]})]}),e.jsx(w,{amount:p,originalCurrency:n,isExpense:!0})]})}),oe=c.memo(function({expenses:s,onExpenseClick:r,className:h}){const{convertAmount:p,activeCurrency:u}=T(),[b,f]=c.useState({}),[n,g]=c.useState(!0);if(c.useEffect(()=>{let t=!0;const i=async()=>{if(s.length===0){t&&(f({}),g(!1));return}const d={},a={};s.forEach(N=>{const o=new Date(N.date).toISOString().split("T")[0];a[o]||(a[o]=[]),a[o].push(N)});for(const[N,o]of Object.entries(a)){let x=0;for(const y of o){const F=y.currency||"USD";if(F===u)x+=y.amount;else try{const D=await p(y.amount,F);x+=D}catch(D){console.error(`Error converting amount for expense ${y.id}:`,D),x+=y.amount}}d[N]=x}t&&(f(d),g(!1))};return g(!0),i(),()=>{t=!1}},[s,u,p]),s.length===0)return e.jsx("div",{className:"text-center py-8 text-muted-foreground",children:"No expenses found"});const j=[];return[...s].sort((t,i)=>new Date(i.date).getTime()-new Date(t.date).getTime()).forEach(t=>{const i=new Date(t.date),d=j.find(a=>re(new Date(a.date),i));d?d.expenses.push(t):j.push({date:t.date,expenses:[t]})}),e.jsx("div",{className:h,children:j.map(t=>{const i=new Date(t.date).toISOString().split("T")[0],d=b[i]||0;return e.jsxs("div",{className:"mb-6",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("h3",{className:"text-sm font-medium text-muted-foreground",children:L(new Date(t.date),"EEEE, MMMM d, yyyy")}),e.jsx("span",{className:"text-sm font-medium",children:n?e.jsx("span",{className:"inline-block w-20 h-4 bg-muted animate-pulse rounded"}):e.jsx(w,{amount:d})})]}),e.jsx("div",{className:"space-y-2",children:t.expenses.map(a=>e.jsx(ie,{expense:a,onClick:()=>r==null?void 0:r(a)},a.id))})]},t.date)})})}),W=c.forwardRef(({className:m,...s},r)=>e.jsx("textarea",{className:C("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",m),ref:r,...s}));W.displayName="Textarea";const le=()=>e.jsxs(l.div,{className:"relative h-8 w-8 flex items-center justify-center",initial:{scale:.8,opacity:0},animate:{scale:1,opacity:1},transition:{duration:.5},children:[e.jsx(l.div,{className:"absolute inset-0 bg-primary/20 rounded-full",animate:{scale:[1,1.2,1],opacity:[.7,.3,.7]},transition:{duration:2,repeat:1/0,repeatType:"reverse"}}),e.jsx(_,{className:"h-5 w-5 text-primary"})]}),ce=()=>{const[m,s]=c.useState(""),[r,h]=c.useState(!1),[p,u]=c.useState(!1),[b,f]=c.useState(!1),[n,g]=c.useState(""),j=async()=>{if(!m.trim()){k({title:"Feedback cannot be empty",description:"Please provide some feedback before submitting",variant:"destructive"});return}h(!0),g("");try{if(!await R(m))throw new Error("Failed to send feedback");s(""),f(!0),setTimeout(()=>{u(!1),f(!1)},2e3),k({title:"Feedback sent",description:"Thank you for your feedback!"})}catch{g("Unable to send feedback. Please try again later."),k({title:"Failed to send feedback",description:"Please try again later",variant:"destructive"})}finally{h(!1)}};return e.jsxs(q,{open:p,onOpenChange:u,children:[e.jsx(G,{asChild:!0,children:e.jsx(l.button,{className:"p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors",whileHover:{scale:1.1},whileTap:{scale:.95},initial:{y:-5,opacity:0},animate:{y:0,opacity:1},transition:{delay:.2},children:e.jsx(te,{className:"h-5 w-5"})})}),e.jsx(V,{className:"glassmorphism border border-white/20 sm:max-w-md",children:b?e.jsxs(l.div,{className:"flex flex-col items-center justify-center py-8 text-center",initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},transition:{duration:.3},children:[e.jsx(l.div,{className:"w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4",animate:{scale:[1,1.2,1],backgroundColor:["rgba(34, 197, 94, 0.2)","rgba(34, 197, 94, 0.4)","rgba(34, 197, 94, 0.2)"]},transition:{duration:1.5,repeat:1/0},children:e.jsx(ee,{className:"h-8 w-8 text-green-500"})}),e.jsx("h3",{className:"text-xl font-semibold mb-2",children:"Feedback Sent!"}),e.jsx("p",{className:"text-muted-foreground",children:"Thank you for helping us improve SpendWise."}),e.jsx("p",{className:"text-xs text-muted-foreground mt-2",children:"Sent via Formspree"})]}):e.jsxs(e.Fragment,{children:[e.jsxs(J,{children:[e.jsx(Q,{children:"Send Feedback"}),e.jsx(X,{children:"Share your thoughts about SpendWise. Your feedback will be sent via Formspree."})]}),e.jsxs("div",{className:"py-4",children:[e.jsx(W,{placeholder:"Tell us what you think about the app...",value:m,onChange:v=>s(v.target.value),className:"min-h-[100px] glassmorphism border border-white/20"}),n&&e.jsx("p",{className:"text-sm text-destructive mt-2",children:n})]}),e.jsx(Z,{children:e.jsx(O,{onClick:j,disabled:r,className:"w-full glassmorphism hover:bg-white/20 border border-primary/20",children:r?e.jsxs("div",{className:"flex items-center",children:[e.jsx(l.div,{className:"w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full mr-2",animate:{rotate:360},transition:{duration:1,repeat:1/0,ease:"linear"}}),"Sending..."]}):"Send Feedback"})})]})})]})},be=()=>{const[m,s]=c.useState([]),[r,h]=c.useState([]),[p,u]=c.useState([]),[b,f]=c.useState(0),{activeCurrency:n,convertAmount:g}=T();c.useEffect(()=>{const t=$();s(t);const i=H(5);h(i),(async()=>{try{const a=await K(),N=a.reduce((o,x)=>o+x.amount,0);u(a),f(N)}catch(a){console.error("Error calculating category spending:",a)}})()},[n]);const j={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},v=()=>{const t=new Date,i=new Date;i.setDate(t.getDate()-7);const d={},a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];for(let o=6;o>=0;o--){const x=new Date;x.setDate(t.getDate()-o);const y=a[x.getDay()];d[y]=0}return m.forEach(o=>{const x=new Date(o.date);if(x>=i&&x<=t){const y=a[x.getDay()];d[y]=(d[y]||0)+o.amount}}),[...a].map(o=>({name:o,value:d[o]||0}))};return e.jsxs("div",{className:"p-4 pb-20",children:[e.jsx(U,{title:e.jsxs("div",{className:"flex items-center gap-2",children:["SpendWise",e.jsx(le,{})]}),rightContent:e.jsx(ce,{})}),e.jsxs(l.div,{className:"space-y-6 mt-4",initial:"hidden",animate:"visible",variants:j,children:[e.jsx(l.div,{variants:M,children:e.jsxs(E,{className:"p-4 glassmorphism overflow-hidden border border-white/20 shadow-xl",children:[e.jsxs("h2",{className:"text-lg font-medium mb-2 flex items-center",children:[e.jsx(se,{className:"h-5 w-5 mr-2 text-primary"}),"Weekly Spending"]}),e.jsx("div",{className:"h-60 overflow-hidden",children:e.jsx("div",{className:"overflow-x-auto pb-2 -mx-4 px-4 h-full flex flex-col justify-center",style:{maxWidth:"100%"},children:v().map((t,i)=>e.jsxs(l.div,{className:"flex items-center mb-3",initial:{opacity:0,x:-10},animate:{opacity:1,x:0},transition:{delay:i*.05+.1},children:[e.jsx("span",{className:"w-8 text-xs font-medium",children:t.name}),e.jsx("div",{className:"flex-1 mx-2",children:e.jsx(l.div,{className:"h-6 bg-primary/10 rounded-full overflow-hidden",initial:{width:0},animate:{width:"100%",transition:{duration:.5,delay:i*.05}},children:e.jsx(l.div,{className:"h-full bg-gradient-to-r from-primary/70 to-primary",initial:{width:0},animate:{width:`${Math.min(100,t.value/(Math.max(...v().map(d=>d.value))||1)*100)}%`,transition:{duration:.7,delay:.3+i*.05}}})})}),e.jsx("span",{className:"w-20 text-right text-xs font-medium",children:e.jsx(w,{amount:t.value,size:"sm",showSymbol:!0})})]},t.name))})})]})}),e.jsx(l.div,{variants:z,children:e.jsxs(E,{className:"p-4 glassmorphism border border-white/20 shadow-lg",children:[e.jsxs("h2",{className:"text-lg font-medium mb-4 flex items-center",children:[e.jsx(ae,{className:"h-5 w-5 mr-2 text-primary"}),"Top Categories"]}),e.jsxs("div",{className:"space-y-3",children:[p.slice(0,3).map((t,i)=>e.jsxs(l.div,{className:"space-y-1",variants:B,children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-sm font-medium",children:A(t.category)}),e.jsx("span",{className:"text-sm",children:e.jsx(w,{amount:t.amount,size:"sm",showSymbol:!0})})]}),e.jsx(ne,{value:t.percentage,showAnimation:!0})]},t.category)),p.length===0&&e.jsx("p",{className:"text-sm text-muted-foreground text-center py-2",children:"No spending data yet"})]})]})}),e.jsx(l.div,{variants:M,children:e.jsxs(E,{className:"p-4 glassmorphism border border-white/20 shadow-lg",children:[e.jsx("h2",{className:"text-lg font-medium mb-3",children:"Recent Expenses"}),e.jsx(oe,{expenses:r}),r.length===0&&e.jsxs("div",{className:"text-center py-8",children:[e.jsx("p",{className:"text-sm text-muted-foreground mb-4",children:"No recent expenses"}),e.jsx(P,{to:"/add-expense",children:e.jsx(O,{size:"sm",className:"bg-primary/80 hover:bg-primary",children:"Add Your First Expense"})})]})]})})]})]})};export{be as default};
