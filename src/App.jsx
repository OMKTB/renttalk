import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap } from "recharts";
import * as XLSX from "xlsx";

const ADMIN_PIN = "zubife6ezklm5nthmalu78gytklm3shan7nekomo";
const DELETE_PIN = "zbekbermraaaaaaatbatshufut3alm9";
const P = ["#E4677E","#F4A77E","#F7CE76","#7EC8A6","#6BAFCF","#A47ED4","#E88B9C","#82D4C4","#D4A06B","#B892D4","#E8A07E","#7EC8D4","#C97E7E","#7EAFC9","#C9B87E","#7EC9A4"];
const FUNC = "/.netlify/functions/data";
const BLOB = "https://jsonblob.com/api/jsonBlob/019d3aec-1fd0-7391-86f3-9e085eba2130";
const PROXY = "https://corsproxy.io/?";

const UK = {
  "London":["Central London","East London","West London","North London","South London","Zone 3–4","Zone 5–6"],
  "South East":["Brighton","Oxford","Reading","Canterbury","Guildford","Milton Keynes","Southampton"],
  "South West":["Bristol","Bath","Exeter","Plymouth","Bournemouth","Cheltenham","Swindon"],
  "East of England":["Cambridge","Norwich","Ipswich","Colchester","Luton","Peterborough","Southend"],
  "West Midlands":["Birmingham","Coventry","Wolverhampton","Stoke-on-Trent","Worcester","Solihull"],
  "East Midlands":["Nottingham","Leicester","Derby","Northampton","Lincoln","Loughborough"],
  "North West":["Manchester","Liverpool","Preston","Chester","Bolton","Blackpool","Warrington"],
  "North East":["Newcastle","Sunderland","Durham","Middlesbrough","Gateshead","Hartlepool"],
  "Yorkshire & Humber":["Leeds","Sheffield","York","Bradford","Hull","Huddersfield","Doncaster"],
  "Scotland":["Edinburgh","Glasgow","Aberdeen","Dundee","Inverness","Stirling","St Andrews"],
  "Wales":["Cardiff","Swansea","Newport","Bangor","Aberystwyth","Wrexham"],
  "Northern Ireland":["Belfast","Derry","Lisburn","Newry","Bangor NI","Craigavon"]
};

const REGION_META = {
  "London":{council:"Greater London Authority",news:["Evening Standard","BBC London"],lat:51.5,lng:-0.12,color:"#E4677E"},
  "South East":{council:"Various County Councils",news:["BBC South East","The Argus"],lat:51.2,lng:-0.5,color:"#F4A77E"},
  "South West":{council:"Various County Councils",news:["BBC West","Bristol Post"],lat:50.9,lng:-2.6,color:"#F7CE76"},
  "East of England":{council:"Various County Councils",news:["BBC East","Cambridge News"],lat:52.2,lng:0.9,color:"#7EC8A6"},
  "West Midlands":{council:"West Midlands Combined Authority",news:["BBC Midlands","Birmingham Mail"],lat:52.5,lng:-1.9,color:"#6BAFCF"},
  "East Midlands":{council:"Various County Councils",news:["BBC East Midlands","Nottingham Post"],lat:52.8,lng:-1.2,color:"#A47ED4"},
  "North West":{council:"Greater Manchester Combined Authority",news:["BBC North West","Manchester Evening News"],lat:53.5,lng:-2.3,color:"#E88B9C"},
  "North East":{council:"North East Combined Authority",news:["BBC North East","Chronicle Live"],lat:54.9,lng:-1.6,color:"#82D4C4"},
  "Yorkshire & Humber":{council:"Various Councils",news:["BBC Yorkshire","Yorkshire Post"],lat:53.8,lng:-1.5,color:"#D4A06B"},
  "Scotland":{council:"Scottish Government",news:["BBC Scotland","The Scotsman"],lat:56.5,lng:-4.0,color:"#B892D4"},
  "Wales":{council:"Welsh Government / Senedd",news:["BBC Wales","Wales Online"],lat:52.1,lng:-3.6,color:"#E8A07E"},
  "Northern Ireland":{council:"NI Executive",news:["BBC NI","Belfast Telegraph"],lat:54.6,lng:-6.7,color:"#7EC8D4"}
};

const LEGAL_DB = {
  "Rental affordability":{ laws:["Renters' Rights Bill 2025","Rent Repayment Orders (Housing Act 2004)","Local Housing Allowance rates"], impact:"Renters' Rights Bill aims to end Section 21 and regulate rent increases. LHA rates frozen since 2020, creating gap with market rents." },
  "Poor property conditions":{ laws:["Homes (Fitness for Human Habitation) Act 2018","Housing Health & Safety Rating System","Decent Homes Standard"], impact:"Landlords must ensure properties are fit for habitation. HHSRS gives councils power to enforce. New Decent Homes Standard extends to private rentals." },
  "Landlord/agent problems":{ laws:["Tenant Fees Act 2019","Renters' Rights Bill 2025","Property Ombudsman scheme"], impact:"Tenant Fees Act bans most letting fees. Renters' Rights Bill creates landlord register and ombudsman. Agents must belong to redress scheme." },
  "Tenure insecurity":{ laws:["Section 21 Housing Act 1988","Renters' Rights Bill 2025","Protection from Eviction Act 1977"], impact:"Section 21 no-fault evictions being abolished under Renters' Rights Bill. Currently 2 months notice required. Retaliatory evictions already banned." },
  "Market competition":{ laws:["Competition Act 1998","Consumer Rights Act 2015","Bidding transparency proposals"], impact:"No current legislation on rental bidding wars. Government exploring mandatory transparency in rental offers. Some councils piloting rent auction bans." },
  "Inadequate space":{ laws:["Housing Act 1985 (overcrowding)","Minimum room sizes (HMO regulations)","Building Regulations Part M"], impact:"HMOs must meet minimum room sizes (6.51m² single, 10.22m² double). Overcrowding standards exist but enforcement is weak." },
  "High upfront costs":{ laws:["Tenant Fees Act 2019","Deposit cap (5 weeks rent)","Zero Deposit schemes"], impact:"Deposits capped at 5 weeks rent. Agency fees banned. Government exploring deposit passporting to ease transitions between tenancies." },
  "Energy costs":{ laws:["Minimum Energy Efficiency Standards (MEES)","EPC requirements","Energy Act 2023"], impact:"Rental properties must have EPC rating of E or above. Government consulted on raising minimum to C by 2028. Landlords can spend up to £3,500 on improvements." },
  "No-pet policies":{ laws:["Renters' Rights Bill 2025","Model Tenancy Agreement 2021","Consumer Rights Act 2015"], impact:"Renters' Rights Bill will give tenants right to request pets. Landlords can only refuse with valid reason. Pet damage insurance permitted." },
  "Rental discrimination":{ laws:["Equality Act 2010","DSS discrimination case law (2020)","Right to Rent checks"], impact:"Blanket 'No DSS' bans ruled unlawful. Equality Act protects against discrimination. Right to Rent checks criticised for racial profiling." },
  "Mental health impact":{ laws:["Care Act 2014","Housing Act 1996 (homelessness duty)","Mental Health Act 1983"], impact:"Councils have duty to house those with mental health conditions affecting capacity. Poor housing recognised as determinant of mental health." },
  "Unable to save/build future":{ laws:["Lifetime ISA scheme","First Homes scheme","Help to Buy ISA (closed)"], impact:"Lifetime ISA provides 25% bonus up to £1000/year for first home. First Homes offers 30% discount. Shared Ownership reformed." }
};

const PROBLEM_CATEGORIES = {
  "Rental affordability":"Financial",
  "Poor property conditions":"Physical",
  "Landlord/agent problems":"Relational",
  "Tenure insecurity":"Legal/Structural",
  "Market competition":"Market",
  "Inadequate space":"Physical",
  "High upfront costs":"Financial",
  "Energy costs":"Financial",
  "No-pet policies":"Legal/Structural",
  "Rental discrimination":"Relational",
  "Mental health impact":"Wellbeing",
  "Unable to save/build future":"Financial",
  "General rental difficulty":"General",
  "Housing supply concerns":"Market"
};

/* ══ CLOUD ══ */
async function cloudLoad(){
  try{const r=await fetch(FUNC);if(r.ok){const d=await r.json();return Array.isArray(d.responses)?d.responses:[];}}catch(e){}
  try{const r=await fetch(PROXY+encodeURIComponent(BLOB),{headers:{"Accept":"application/json"}});if(r.ok){const d=await r.json();return Array.isArray(d.responses)?d.responses:[];}}catch(e){}
  return [];
}
async function cloudAppend(e){
  try{const r=await fetch(FUNC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(r.ok)return true;}catch(e){}
  try{const g=await fetch(PROXY+encodeURIComponent(BLOB),{headers:{"Accept":"application/json"}});const d=await g.json();const rs=Array.isArray(d.responses)?d.responses:[];rs.push({...e,ts:Date.now()});const p=await fetch(PROXY+encodeURIComponent(BLOB),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({responses:rs})});if(p.ok)return true;}catch(e){}
  return false;
}
async function cloudClear(){try{await fetch(FUNC,{method:"DELETE"});}catch(e){}}

/* ══ KEYWORD ANALYSER ══ */
function kwAnalyse(text){
  const t=text.toLowerCase(),pr=[],qs=[];
  if(/rent|afford|expens|cost|price|money|pay|budget|salary|wage|income/.test(t)){pr.push("Rental affordability");qs.push({id:"a1",q:"Which best describes your affordability issue?",o:["Rent rising faster than income","Can't find anything in budget","Sacrificing essentials to pay rent","Can't afford to move"]});}
  if(/damp|mould|mold|cold|repair|broken|condition|leak|heat|rot|pest|mice/.test(t)){pr.push("Poor property conditions");qs.push({id:"a2",q:"What condition issues are present?",o:["Damp or mould","Broken fixtures not repaired","Pest infestation","Poor heating/insulation","Multiple issues"]});}
  if(/landlord|agent|letting|unresponsive|ignore|manage/.test(t)){pr.push("Landlord/agent problems");qs.push({id:"a3",q:"How would you describe your landlord/agent?",o:["Completely unresponsive","Responsive but doesn't follow through","Hostile or intimidating","Charges unfair fees"]});}
  if(/evict|section 21|notice|insecur|tenure|renew/.test(t)){pr.push("Tenure insecurity");qs.push({id:"a4",q:"What does tenure insecurity look like for you?",o:["Fear of no-fault eviction","Short tenancy, no guarantee","Landlord selling property","Rent hike forcing me out"]});}
  if(/compet|bidding|demand|view|applicat|fight|queue|outbid/.test(t)){pr.push("Market competition");qs.push({id:"a5",q:"How intense is the competition?",o:["Properties go within hours","Outbid multiple times","Asked to pay months upfront","Dozens of applicants per viewing"]});}
  if(/space|small|tiny|cramped|overcrowd|room|size/.test(t)){pr.push("Inadequate space");qs.push({id:"a6",q:"What is your space concern?",o:["Can only afford tiny studio/room","Sharing with too many people","No space for WFH","Need more rooms"]});}
  if(/deposit|upfront|fee|charge|guarantor|credit/.test(t)){pr.push("High upfront costs");qs.push({id:"a7",q:"Which upfront costs are a barrier?",o:["Deposit too high","Agency/referencing fees","No suitable guarantor","3–6 months upfront"]});}
  if(/energy|bill|utility|electric|gas|insul/.test(t)){pr.push("Energy costs");qs.push({id:"a8",q:"How are energy costs affecting you?",o:["Bills unmanageable","Landlord won't upgrade","Low EPC rating","Choosing between heating and essentials"]});}
  if(/pet/.test(t))pr.push("No-pet policies");
  if(/discriminat|refus|reject|benefit|dss|universal credit/.test(t)){pr.push("Rental discrimination");qs.push({id:"a9",q:"What discrimination have you experienced?",o:["Rejected for benefits","Age discrimination","Ethnic discrimination","No UK guarantor"]});}
  if(/mental|stress|anxi|depress|health/.test(t))pr.push("Mental health impact");
  if(/save|saving|mortgage|buy|own|future|stuck/.test(t))pr.push("Unable to save/build future");
  if(pr.length===0)pr.push("General rental difficulty","Housing supply concerns");
  const base=[{id:"b1",q:"How long have these issues persisted?",o:["Under 3 months","3–6 months","6–12 months","Over a year"]},{id:"b2",q:"How severely is this affecting your daily life?",o:["Minor inconvenience","Moderate stress","Significant impact","Severely affecting wellbeing"]},{id:"b3",q:"Have you sought any help?",o:["Yes, family/friends","Renters' organisation","Legal advice","No, unsure where to turn"]}];
  const f=[...qs.slice(0,3)];let i=0;while(f.length<3&&i<base.length){f.push(base[i]);i++;}
  return{problems:pr.slice(0,6),questions:f.slice(0,3)};
}

/* ══ EXCEL EXPORT ══ */
function exportToExcel(data, aggregated) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Raw Responses
  const raw = data.map((r,i) => ({
    "ID": i+1, "Timestamp": r.ts ? new Date(r.ts).toISOString() : "",
    "Age": r.age, "Region": r.region, "Area": r.area, "Living Situation": r.situation,
    "Monthly Rent": r.rent, "% Income to Rent": r.pctIncome,
    "Free Text Response": r.freeText, "Identified Problems": (r.problems||[]).join("; "),
    "Follow-up Q1 Answer": r.answers ? Object.values(r.answers)[0]||"" : "",
    "Follow-up Q2 Answer": r.answers ? Object.values(r.answers)[1]||"" : "",
    "Follow-up Q3 Answer": r.answers ? Object.values(r.answers)[2]||"" : "",
    "Proposed Solution": r.proposedFix, "Rent Control Stance": r.rentControl,
    "Broken Rating (1-10)": r.brokenRating
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(raw), "Raw Responses");

  // Sheet 2: Problem Frequency
  const probSheet = aggregated.probD.map(p => ({
    "Problem": p.name, "Count": p.value, "% of Respondents": ((p.value/data.length)*100).toFixed(1)+"%",
    "Category": PROBLEM_CATEGORIES[p.name]||"General",
    "Relevant Legislation": LEGAL_DB[p.name]?.laws?.join("; ")||"N/A",
    "Legal Impact Assessment": LEGAL_DB[p.name]?.impact||"N/A"
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(probSheet), "Problem Analysis");

  // Sheet 3: Regional Breakdown
  const regSheet = Object.entries(aggregated.probByLoc).map(([loc, probs]) => ({
    "Location": loc,
    "Total Responses": Object.values(probs).reduce((s,v)=>s+v,0),
    "Top Problem": Object.entries(probs).sort((a,b)=>b[1]-a[1])[0]?.[0]||"N/A",
    "All Problems": Object.entries(probs).map(([p,c])=>`${p} (${c})`).join("; "),
    "Council Authority": REGION_META[loc]?.council || Object.values(REGION_META).find(m=>UK[Object.keys(UK).find(k=>UK[k].includes(loc))])?.council || "Local Council",
    "Local News Sources": REGION_META[loc]?.news?.join(", ") || "Local media"
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(regSheet), "Regional Breakdown");

  // Sheet 4: Financial Analysis
  const finSheet = [
    ...Object.entries(aggregated.rentC).map(([k,v])=>({Metric:"Monthly Rent",Bracket:k,Count:v,Percentage:((v/data.length)*100).toFixed(1)+"%"})),
    ...Object.entries(aggregated.incC).map(([k,v])=>({Metric:"Income to Rent %",Bracket:k,Count:v,Percentage:((v/data.length)*100).toFixed(1)+"%"}))
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finSheet), "Financial Analysis");

  // Sheet 5: Solutions
  const solSheet = data.filter(r=>r.proposedFix).map((r,i)=>({
    "ID":i+1,"Region":r.region,"Area":r.area,"Age":r.age,"Proposed Solution":r.proposedFix,
    "Rent Control Position":r.rentControl,"Broken Rating":r.brokenRating,
    "Problems Experienced":(r.problems||[]).join("; ")
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(solSheet), "Proposed Solutions");

  // Sheet 6: Legal Landscape
  const legSheet = Object.entries(LEGAL_DB).map(([prob,info])=>({
    "Problem Area":prob,"Category":PROBLEM_CATEGORIES[prob]||"General",
    "Relevant Legislation":info.laws.join("; "),"Impact Assessment":info.impact,
    "Respondents Affected": aggregated.probC[prob]||0
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(legSheet), "Legal Landscape");

  // Sheet 7: Follow-up Answer Distribution
  const ansSheet = aggregated.ansD.map(a=>({Answer:a.name,Count:a.value,Percentage:((a.value/Object.values(aggregated.ansC).reduce((s,v)=>s+v,0))*100).toFixed(1)+"%"}));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ansSheet), "Follow-up Answers");

  XLSX.writeFile(wb, `RentTalk_Research_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/* ══ UK MAP SVG ══ */
function UKMap({ regionData, onSelect, selected }) {
  const regions = [
    {id:"Scotland",d:"M140,20 L180,20 200,60 210,100 180,120 190,140 170,150 140,140 130,100 120,60Z",cx:165,cy:85},
    {id:"Northern Ireland",d:"M60,130 L100,120 110,145 100,170 70,170 55,155Z",cx:80,cy:148},
    {id:"North East",d:"M190,145 L215,140 225,170 210,195 185,185Z",cx:203,cy:168},
    {id:"North West",d:"M145,155 L185,150 185,190 170,210 140,200 135,175Z",cx:160,cy:180},
    {id:"Yorkshire & Humber",d:"M185,155 L225,150 230,185 215,200 185,195Z",cx:205,cy:178},
    {id:"Wales",d:"M110,215 L140,205 145,240 135,270 110,275 95,255 100,230Z",cx:120,cy:242},
    {id:"West Midlands",d:"M145,205 L185,200 190,225 175,240 145,240Z",cx:165,cy:220},
    {id:"East Midlands",d:"M185,200 L225,195 230,225 210,240 185,235Z",cx:207,cy:218},
    {id:"East of England",d:"M215,230 L250,215 260,250 245,275 215,265Z",cx:237,cy:248},
    {id:"South West",d:"M80,275 L135,270 140,295 120,320 80,325 60,300Z",cx:105,cy:298},
    {id:"South East",d:"M155,270 L215,265 230,290 210,310 170,305 155,285Z",cx:190,cy:288},
    {id:"London",d:"M195,260 L215,255 220,270 210,280 195,275Z",cx:207,cy:268}
  ];
  return (
    <svg viewBox="30 10 260 330" style={{width:"100%",maxWidth:340}}>
      {regions.map(r => {
        const count = regionData[r.id] || 0;
        const maxC = Math.max(...Object.values(regionData),1);
        const intensity = count > 0 ? 0.2 + (count/maxC)*0.7 : 0.05;
        const fill = REGION_META[r.id]?.color || "#ccc";
        const isSelected = selected === r.id;
        return (
          <g key={r.id} onClick={() => onSelect(r.id)} style={{cursor:"pointer"}}>
            <path d={r.d} fill={fill} opacity={intensity} stroke={isSelected?"#2C2C2C":"rgba(0,0,0,0.15)"} strokeWidth={isSelected?2.5:1}
              style={{transition:"all 0.2s"}} />
            <text x={r.cx} y={r.cy} textAnchor="middle" fontSize={8} fontWeight={600} fill="#2C2C2C" opacity={0.7}
              style={{pointerEvents:"none",fontFamily:"'Nunito',sans-serif"}}>{r.id.length>10?r.id.slice(0,8)+"…":r.id}</text>
            {count > 0 && <text x={r.cx} y={r.cy+11} textAnchor="middle" fontSize={10} fontWeight={800} fill={fill}
              style={{pointerEvents:"none",fontFamily:"'Lora',serif"}}>{count}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ══ AI CONTEXT GENERATOR ══ */
async function getAIContext(region, problems, data) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
        messages:[{role:"user",content:`You are a UK housing policy analyst. For the region "${region}", given these rental problems reported by 18-30 year olds: ${problems.join(", ")}.

Return ONLY valid JSON:
{"news_context":"2-3 sentences about recent local news/developments relevant to these rental issues in ${region}","council_assessment":"2-3 sentences assessing the local council's performance on housing/rental issues","ecosystem_integration":"2-3 sentences on how these problems connect to the wider community — transport, employment, healthcare, education","positive_legal":"1-2 recent legal/policy developments that could help","negative_legal":"1-2 legal/policy gaps or negative developments","severity":"high/medium/low based on the combination of issues","recommendation":"1-2 actionable research recommendations"}`}]
      })
    });
    const d = await r.json();
    const txt = d.content?.filter(c=>c.type==="text").map(c=>c.text).join("");
    return JSON.parse(txt.replace(/```json|```/g,"").trim());
  } catch(e) {
    return {
      news_context:`Housing pressures in ${region} reflect national trends of rising rents and constrained supply. Local reports indicate growing demand from young professionals.`,
      council_assessment:`Local authority performance on housing varies. Planning approvals and social housing delivery remain key metrics to monitor.`,
      ecosystem_integration:`Rental challenges in ${region} connect to employment accessibility, transport costs, and local service provision.`,
      positive_legal:"Renters' Rights Bill 2025 promises stronger tenant protections nationwide.",
      negative_legal:"Local Housing Allowance freeze continues to create affordability gaps.",
      severity:problems.length>3?"high":problems.length>1?"medium":"low",
      recommendation:`Further investigation into ${problems[0]||"housing supply"} dynamics in ${region} is recommended.`
    };
  }
}

/* ══════════════════════════════════════
   APP
   ══════════════════════════════════════ */
export default function App(){
  const [view,setView]=useState("survey");
  const [pinOk,setPinOk]=useState(false);
  const [dd,setDD]=useState([]);
  const [dl,setDL]=useState(false);

  const reload=useCallback(async()=>{setDL(true);const d=await cloudLoad();setDD(d);setDL(false);},[]);
  useEffect(()=>{if(view==="dash")reload();},[view,reload]);

  return (
    <div style={{minHeight:"100vh",background:"#FBF8F3",fontFamily:"'Nunito',-apple-system,sans-serif",color:"#2C2C2C"}}>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      {view==="survey"&&<SurveyView onAdmin={()=>setView("pin")}/>}
      {view==="pin"&&<PinGate onUnlock={()=>{setPinOk(true);setView("dash");}} onBack={()=>setView("survey")}/>}
      {view==="dash"&&pinOk&&<DashView data={dd} loading={dl} reload={reload} onClear={async()=>{await cloudClear();setDD([]);}} onBack={()=>setView("survey")}/>}
    </div>
  );
}

function PinGate({onUnlock,onBack}){
  const [p,setP]=useState("");const [err,setErr]=useState(false);
  const go=()=>{if(p===ADMIN_PIN)onUnlock();else{setErr(true);setP("");}};
  return(<div style={{maxWidth:380,margin:"0 auto",padding:"100px 24px",textAlign:"center"}}><div className="cd an" style={{padding:"40px 32px"}}>
    <div style={{fontSize:40,marginBottom:12}}>🔒</div><div className="lb">Admin Access</div>
    <div className="hd" style={{fontSize:18,marginBottom:20}}>Enter Password</div>
    <input className="inp" type="password" value={p} onChange={e=>{setP(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Password" style={{marginBottom:12}}/>
    {err&&<p style={{color:"#E4677E",fontSize:13,marginBottom:10}}>Incorrect</p>}
    <button className="bt bp" onClick={go} style={{width:"100%",justifyContent:"center",marginBottom:10}}>Unlock Dashboard</button>
    <button className="bt bgh" onClick={onBack} style={{width:"100%",justifyContent:"center",fontSize:12}}>← Back</button>
  </div></div>);
}

/* ══ SURVEY (unchanged) ══ */
function SurveyView({onAdmin}){
  const [step,setStep]=useState(0);
  const [d,setD]=useState({age:"",region:"",area:"",situation:"",rent:"",pctIncome:"",freeText:"",problems:[],questions:[],answers:{},proposedFix:"",rentControl:"",brokenRating:5});
  const [sub,setSub]=useState(false);const [done,setDone]=useState(false);const [err,setErr]=useState(false);
  const u=(k,v)=>setD(p=>({...p,[k]:v}));const nx=()=>setStep(s=>s+1);const bk=()=>setStep(s=>s-1);
  const analyse=()=>{const r=kwAnalyse(d.freeText);u("problems",r.problems);u("questions",r.questions);nx();};
  const submit=async()=>{setSub(true);setErr(false);const ok=await cloudAppend(d);setSub(false);if(ok)setDone(true);else setErr(true);};
  const Nav=()=>(<div style={{position:"sticky",top:0,zIndex:100,background:"rgba(251,248,243,.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(0,0,0,.05)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="20" height="14" rx="2" fill="#E4677E" opacity=".15"/><path d="M3 13L14 4L25 13" stroke="#E4677E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="18" width="6" height="8" rx="1" fill="#E4677E" opacity=".3"/></svg><span style={{fontFamily:"'Lora',serif",fontWeight:700,fontSize:16}}>Rent<span style={{color:"#E4677E"}}>Talk</span><span style={{fontSize:11,fontWeight:400,color:"rgba(0,0,0,.3)",marginLeft:8}}>UK Rental Study</span></span></div><button onClick={onAdmin} style={{background:"none",border:"none",cursor:"pointer",opacity:.15,fontSize:14,padding:8}} title="Admin">🔒</button></div>);

  if(done)return(<><Nav/><div style={{maxWidth:480,margin:"0 auto",textAlign:"center",padding:"80px 20px"}}><div className="an" style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#7EC8A6,#B5E8D0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36,color:"#fff"}}>✓</div><h2 style={{fontFamily:"'Lora',serif",fontSize:26,fontWeight:700,marginBottom:10}}>Thank you</h2><p style={{color:"#4A4A4A",fontSize:15,lineHeight:1.7}}>Your response has been saved to our research database.</p></div></>);

  const tot=7,pct=((step+1)/tot)*100;
  return(<><Nav/><div style={{maxWidth:540,margin:"0 auto",padding:"28px 20px 100px"}}>
    <div style={{marginBottom:30}}><div style={{height:3,borderRadius:2,background:"rgba(0,0,0,.06)"}}><div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#E4677E,#7EC8A6)",width:`${pct}%`,transition:"width .35s"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:11,fontWeight:700,color:"#E4677E",letterSpacing:".06em",textTransform:"uppercase"}}>Q {step+1}/{tot}</span><span style={{fontSize:11,color:"rgba(0,0,0,.3)"}}>{Math.round(pct)}%</span></div></div>

    {step===0&&<div className="an"><div className="cd" style={{textAlign:"center",padding:"40px 28px"}}><div style={{fontSize:44,marginBottom:12}}>🏠</div><div className="lb">UK Rental Experience Study</div><h1 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:700,lineHeight:1.35,marginBottom:14}}>Rental Challenges Facing<br/>18–30 Year Olds in the UK</h1><p style={{color:"#4A4A4A",fontSize:14,lineHeight:1.7,maxWidth:400,margin:"0 auto 10px"}}>Anonymous research questionnaire. Responses saved to shared database for research.</p><p style={{fontSize:12,color:"rgba(0,0,0,.3)",marginBottom:28}}>~2–3 minutes</p><button className="bt bp" onClick={nx} style={{width:"100%",justifyContent:"center"}}>Begin →</button></div></div>}

    {step===1&&<div className="an"><div className="cd"><div className="lb">Section A — Demographics</div><div className="hd" style={{marginBottom:20}}>About You</div><FL>Age</FL><CG items={Array.from({length:13},(_,i)=>String(i+18))} sel={d.age} set={v=>u("age",v)}/><FL t={18}>Living arrangement</FL><CG items={["Renting privately","Social housing","House/flat share","With family","Student accommodation","Other"]} sel={d.situation} set={v=>u("situation",v)}/></div><NB bk={null} nx={nx} dis={!d.age||!d.situation}/></div>}

    {step===2&&<div className="an"><div className="cd"><div className="lb">Section A — Location</div><div className="hd" style={{marginBottom:6}}>Where do you live?</div><FL>Region</FL><CG items={Object.keys(UK)} sel={d.region} set={v=>{u("region",v);u("area","");}}/>{d.region&&<><FL t={18}>City / Area</FL><CG items={UK[d.region]} sel={d.area} set={v=>u("area",v)}/></>}</div><NB bk={bk} nx={nx} dis={!d.region||!d.area}/></div>}

    {step===3&&<div className="an"><div className="cd"><div className="lb">Section B — Financial</div><div className="hd" style={{marginBottom:18}}>Rent & Income</div><FL>Monthly rent</FL><CG items={["Under £400","£400–£600","£600–£800","£800–£1,000","£1,000–£1,500","£1,500–£2,000","£2,000+","N/A"]} sel={d.rent} set={v=>u("rent",v)}/><FL t={18}>% of income to rent</FL><CG items={["Under 20%","20–30%","30–40%","40–50%","Over 50%","N/A"]} sel={d.pctIncome} set={v=>u("pctIncome",v)}/></div><NB bk={bk} nx={nx} dis={!d.rent||!d.pctIncome}/></div>}

    {step===4&&<div className="an"><div className="cd"><div className="lb">Section C — Experience</div><div className="hd" style={{marginBottom:6}}>Describe the main challenges you face with renting</div><p style={{color:"#4A4A4A",fontSize:13,marginBottom:16}}>Be specific — affordability, conditions, landlords, competition, etc.</p><textarea className="ta" value={d.freeText} onChange={e=>u("freeText",e.target.value)} placeholder="Describe your rental challenges here…" style={{minHeight:160}}/></div><div style={{display:"flex",gap:10,marginTop:20}}><button className="bt bgh" onClick={bk}>← Back</button><button className="bt bc" onClick={analyse} disabled={d.freeText.trim().length<10} style={{flex:1,justifyContent:"center"}}>Continue →</button></div></div>}

    {step===5&&<div className="an"><div className="cd" style={{marginBottom:14}}><div className="lb">Identified Issues</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{d.problems.map((p,i)=>(<span key={i} className="tag" style={{background:`${P[i%P.length]}18`,color:P[i%P.length]}}>{p}</span>))}</div></div>{d.questions.map((q,qi)=>(<div key={q.id} className="cd" style={{marginBottom:12}}><div className="lb">Follow-up {qi+1}/3</div><div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:500,marginBottom:12,lineHeight:1.45}}>{q.q}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{q.o.map(o=>(<button key={o} className={`chip ${d.answers[q.id]===o?"s":""}`} onClick={()=>u("answers",{...d.answers,[q.id]:o})} style={{justifyContent:"flex-start"}}>{o}</button>))}</div></div>))}<NB bk={bk} nx={nx} dis={Object.keys(d.answers).length<d.questions.length}/></div>}

    {step===6&&<div className="an"><div className="cd" style={{marginBottom:14}}><div className="lb">Section D — Solutions</div><div className="hd" style={{marginBottom:6}}>What changes would improve renting?</div><textarea className="ta" value={d.proposedFix} onChange={e=>u("proposedFix",e.target.value)} placeholder="e.g. Rent caps, inspections, longer tenancies…"/></div><div className="cd" style={{marginBottom:14}}><div className="lb">Policy</div><div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:500,marginBottom:12}}>Do you support government rent controls?</div><CG items={["Strongly support","Somewhat support","Neutral","Somewhat oppose","Strongly oppose"]} sel={d.rentControl} set={v=>u("rentControl",v)}/></div><div className="cd"><div className="lb">Rating</div><div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:500,marginBottom:12}}>Rate the UK rental system (1–10)</div><input type="range" min={1} max={10} value={d.brokenRating} onChange={e=>u("brokenRating",Number(e.target.value))} style={{width:"100%",accentColor:"#E4677E"}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(0,0,0,.3)",marginTop:4}}><span>1 = Adequate</span><span style={{fontSize:22,fontFamily:"'Lora',serif",fontWeight:700,color:"#E4677E"}}>{d.brokenRating}</span><span>10 = Broken</span></div></div><div style={{display:"flex",gap:10,marginTop:20}}><button className="bt bgh" onClick={bk}>← Back</button><button className="bt bp" onClick={submit} disabled={!d.rentControl||d.proposedFix.trim().length<5||sub} style={{flex:1,justifyContent:"center"}}>{sub?"Saving…":"Submit ✓"}</button></div>{err&&<p style={{color:"#E4677E",fontSize:13,marginTop:12,textAlign:"center"}}>Error saving. Please try again.</p>}</div>}
  </div></>);
}

/* ══════════════════════════════════════
   RESEARCH INTELLIGENCE DASHBOARD
   ══════════════════════════════════════ */
function DashView({data,loading,reload,onClear,onBack}){
  const n=data.length;
  const [selRegion,setSelRegion]=useState(null);
  const [selProblem,setSelProblem]=useState(null);
  const [aiCtx,setAiCtx]=useState({});
  const [aiLoading,setAiLoading]=useState(false);
  const [notes,setNotes]=useState("");
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  const [deletePin,setDeletePin]=useState("");
  const [deletePinErr,setDeletePinErr]=useState(false);
  const [expandedWidget,setExpandedWidget]=useState(null);
  const tt={background:"#fff",border:"1px solid rgba(0,0,0,.06)",borderRadius:10,fontSize:12,fontFamily:"'Nunito',sans-serif"};

  // Aggregate
  const rC={},aC={},reC={},iC={},rcC={},sC={},pC={},anC={},pL={},agC={},catC={};
  let tR=0,o5=0,o4=0;const txts=[],fixes=[];
  data.forEach(r=>{
    if(r.region)rC[r.region]=(rC[r.region]||0)+1;
    if(r.area)aC[r.area]=(aC[r.area]||0)+1;
    if(r.rent)reC[r.rent]=(reC[r.rent]||0)+1;
    if(r.pctIncome)iC[r.pctIncome]=(iC[r.pctIncome]||0)+1;
    if(r.rentControl)rcC[r.rentControl]=(rcC[r.rentControl]||0)+1;
    if(r.situation)sC[r.situation]=(sC[r.situation]||0)+1;
    if(r.age)agC[r.age]=(agC[r.age]||0)+1;
    (r.problems||[]).forEach(p=>{pC[p]=(pC[p]||0)+1;const cat=PROBLEM_CATEGORIES[p]||"General";catC[cat]=(catC[cat]||0)+1;});
    tR+=Number(r.brokenRating)||0;
    if(r.pctIncome==="Over 50%")o5++;if(r.pctIncome==="40–50%"||r.pctIncome==="Over 50%")o4++;
    if(r.freeText)txts.push({text:r.freeText,area:r.area||r.region,age:r.age,rent:r.rent,problems:r.problems,situation:r.situation,pctIncome:r.pctIncome,answers:r.answers});
    if(r.proposedFix)fixes.push({text:r.proposedFix,area:r.area||r.region});
    const loc=r.area||r.region;
    if(loc)(r.problems||[]).forEach(p=>{if(!pL[loc])pL[loc]={};pL[loc][p]=(pL[loc][p]||0)+1;});
    if(r.answers)Object.values(r.answers).forEach(a=>{anC[a]=(anC[a]||0)+1;});
  });

  const sr=o=>Object.entries(o).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const pi=o=>Object.entries(o).map(([name,value])=>({name,value}));
  const pD=sr(pC),aD=sr(aC).slice(0,15),anD=sr(anC).slice(0,15),agD=sr(agC),catD=sr(catC);
  const avg=n?(tR/n).toFixed(1):"0";const topP=pD[0]?.name||"N/A";const topA=aD[0]?.name||"N/A";
  const p5=n?Math.round((o5/n)*100):0;const p4=n?Math.round((o4/n)*100):0;

  const aggForExport={probD:pD,probByLoc:pL,rentC:reC,incC:iC,ansD:anD,ansC:anC,probC:pC};

  // Load AI context for selected region
  const loadAI=async(region)=>{
    if(aiCtx[region])return;
    setAiLoading(true);
    const probs=pL[region]?Object.keys(pL[region]):Object.keys(pC).slice(0,3);
    const ctx=await getAIContext(region,probs,data);
    setAiCtx(prev=>({...prev,[region]:ctx}));
    setAiLoading(false);
  };

  useEffect(()=>{if(selRegion)loadAI(selRegion);},[selRegion]);

  const regionForProblem=selProblem?Object.entries(pL).filter(([_,probs])=>probs[selProblem]).map(([loc])=>loc):[];

  if(loading)return(<div style={{textAlign:"center",padding:80,color:"rgba(0,0,0,.3)"}}>Loading from cloud…</div>);

  return(
    <div style={{padding:"0 20px 60px",maxWidth:1200,margin:"0 auto"}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",padding:"22px 0 16px",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="20" height="14" rx="2" fill="#E4677E" opacity=".15"/><path d="M3 13L14 4L25 13" stroke="#E4677E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontFamily:"'Lora',serif",fontWeight:700,fontSize:16}}>Rent<span style={{color:"#E4677E"}}>Talk</span></span>
            <span style={{fontSize:11,background:"#E4677E",color:"#fff",padding:"2px 8px",borderRadius:100,fontWeight:700}}>RESEARCH DASHBOARD</span>
          </div>
          <p style={{color:"#4A4A4A",fontSize:12}}>{n} responses · Cloud database</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="bt bgh" onClick={onBack} style={{fontSize:11,padding:"7px 14px"}}>← Survey</button>
          <button className="bt bgh" onClick={reload} style={{fontSize:11,padding:"7px 14px"}}>↻ Refresh</button>
          {n>0&&<button className="bt bc" onClick={()=>exportToExcel(data,aggForExport)} style={{fontSize:11,padding:"7px 14px"}}>📥 Export Excel</button>}
          
        </div>
      </div>

      {n===0?(<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,opacity:.15,marginBottom:12}}>📊</div><h2 style={{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,marginBottom:6}}>No responses yet</h2><p style={{color:"#4A4A4A",fontSize:14}}>Responses from all users will appear here.</p></div>):(
      <>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:16}}>
          <KP l="Responses" v={n} c="#E4677E"/>
          <KP l="Broken Rating" v={`${avg}/10`} c="#D4A06B"/>
          <KP l="Top Problem" v={topP} c="#E4677E" sm/>
          <KP l="Top Area" v={topA} c="#7EC8A6" sm/>
          <KP l=">50% Income" v={`${p5}%`} c="#E4677E"/>
          <KP l=">40% Income" v={`${p4}%`} c="#F4A77E"/>
          <KP l="Regions Covered" v={Object.keys(rC).length} c="#6BAFCF"/>
          <KP l="Unique Problems" v={Object.keys(pC).length} c="#A47ED4"/>
        </div>

        {/* INSIGHT BANNER */}
        <div style={{background:"linear-gradient(135deg,rgba(228,103,126,.08),rgba(126,200,166,.06))",borderRadius:16,padding:"16px 22px",marginBottom:16,border:"1px solid rgba(228,103,126,.1)"}}>
          <div style={{fontFamily:"'Lora',serif",fontWeight:700,fontSize:14,marginBottom:4,color:"#E4677E"}}>📊 Research Summary</div>
          <div style={{fontSize:13,lineHeight:1.7}}>
            {n} respondents across {Object.keys(rC).length} UK regions. The dominant issue is <b>{topP}</b> ({pD[0]?.value||0} citations).
            {p4>30&&` ${p4}% of respondents spend over 40% of income on rent, exceeding the 30% affordability threshold.`}
            {` Most responses originate from ${topA}. Problem categories span ${Object.keys(catC).join(", ")}.`}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* UK MAP */}
          <BX t="🗺️ Regional Problem Map" s={2}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              <div style={{flex:"0 0 340px"}}><UKMap regionData={rC} onSelect={r=>setSelRegion(r===selRegion?null:r)} selected={selRegion}/></div>
              <div style={{flex:1,minWidth:300}}>
                {selRegion?(<>
                  <div style={{fontFamily:"'Lora',serif",fontWeight:700,fontSize:18,marginBottom:6}}>📍 {selRegion}</div>
                  <div style={{fontSize:12,color:"#4A4A4A",marginBottom:10}}>
                    <b>Council:</b> {REGION_META[selRegion]?.council} · <b>News:</b> {REGION_META[selRegion]?.news?.join(", ")}
                  </div>
                  <div style={{fontSize:12,marginBottom:10}}><b>Responses:</b> {rC[selRegion]||0}</div>
                  {pL[selRegion]&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
                    {Object.entries(pL[selRegion]).sort((a,b)=>b[1]-a[1]).map(([p,c],i)=>(
                      <span key={p} className="tag" style={{background:`${P[i%P.length]}18`,color:P[i%P.length]}}>{p} ({c})</span>))}
                  </div>}
                  {/* AI Context */}
                  {aiLoading&&!aiCtx[selRegion]?<p style={{fontSize:12,color:"rgba(0,0,0,.3)"}}>Loading AI analysis…</p>:aiCtx[selRegion]&&(<div style={{fontSize:12,lineHeight:1.65}}>
                    <div style={{marginBottom:8}}><b style={{color:"#E4677E"}}>📰 News Context:</b> {aiCtx[selRegion].news_context}</div>
                    <div style={{marginBottom:8}}><b style={{color:"#6BAFCF"}}>🏛️ Council Assessment:</b> {aiCtx[selRegion].council_assessment}</div>
                    <div style={{marginBottom:8}}><b style={{color:"#7EC8A6"}}>🔗 Ecosystem Integration:</b> {aiCtx[selRegion].ecosystem_integration}</div>
                    <div style={{marginBottom:8}}><b style={{color:"#27AE60"}}>✅ Positive Legal:</b> {aiCtx[selRegion].positive_legal}</div>
                    <div style={{marginBottom:8}}><b style={{color:"#E4677E"}}>⚠️ Negative Legal:</b> {aiCtx[selRegion].negative_legal}</div>
                    <div style={{padding:"6px 12px",borderRadius:8,background:aiCtx[selRegion].severity==="high"?"rgba(228,103,126,.1)":aiCtx[selRegion].severity==="medium"?"rgba(244,167,126,.1)":"rgba(126,200,166,.1)",display:"inline-block",fontWeight:700,color:aiCtx[selRegion].severity==="high"?"#E4677E":aiCtx[selRegion].severity==="medium"?"#F4A77E":"#7EC8A6"}}>Severity: {aiCtx[selRegion].severity?.toUpperCase()}</div>
                  </div>)}
                </>):(<p style={{color:"rgba(0,0,0,.3)",fontSize:13}}>Click a region on the map to view detailed analysis</p>)}
              </div>
            </div>
          </BX>

          {/* PROBLEMS RANKED */}
          <BX t="📊 Problems by Frequency" s={2}>
            <ResponsiveContainer width="100%" height={Math.max(160,pD.length*28)}>
              <BarChart data={pD} layout="vertical" margin={{left:170,right:20,top:4,bottom:4}}>
                <XAxis type="number" stroke="rgba(0,0,0,.06)" tick={{fill:"rgba(0,0,0,.4)",fontSize:10}}/>
                <YAxis type="category" dataKey="name" width={160} tick={{fill:"#2C2C2C",fontSize:11,fontWeight:500}}/>
                <Tooltip contentStyle={tt}/><Bar dataKey="value" radius={[0,6,6,0]} fill="#E4677E" cursor="pointer"
                  onClick={(d)=>setSelProblem(d.name===selProblem?null:d.name)}/>
              </BarChart>
            </ResponsiveContainer>
          </BX>

          {/* PROBLEM DEEP DIVE */}
          {selProblem&&LEGAL_DB[selProblem]&&<BX t={`🔍 Deep Dive: ${selProblem}`} s={2}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div style={{padding:16,borderRadius:14,background:"rgba(228,103,126,.04)",border:"1px solid rgba(228,103,126,.08)"}}>
                <div style={{fontWeight:700,fontSize:11,color:"#E4677E",textTransform:"uppercase",marginBottom:8}}>⚖️ Legal Framework</div>
                {LEGAL_DB[selProblem].laws.map((l,i)=><div key={i} style={{fontSize:12,marginBottom:4,paddingLeft:10,borderLeft:"2px solid #E4677E"}}>• {l}</div>)}
              </div>
              <div style={{padding:16,borderRadius:14,background:"rgba(126,200,166,.04)",border:"1px solid rgba(126,200,166,.08)"}}>
                <div style={{fontWeight:700,fontSize:11,color:"#7EC8A6",textTransform:"uppercase",marginBottom:8}}>📋 Impact Assessment</div>
                <div style={{fontSize:12,lineHeight:1.6}}>{LEGAL_DB[selProblem].impact}</div>
              </div>
              <div style={{padding:16,borderRadius:14,background:"rgba(107,175,207,.04)",border:"1px solid rgba(107,175,207,.08)"}}>
                <div style={{fontWeight:700,fontSize:11,color:"#6BAFCF",textTransform:"uppercase",marginBottom:8}}>📍 Where Reported</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {regionForProblem.map((loc,i)=><span key={loc} className="tag" style={{background:`${P[i%P.length]}15`,color:P[i%P.length]}}>{loc}</span>)}
                </div>
                <div style={{fontSize:11,marginTop:8,color:"rgba(0,0,0,.4)"}}>Category: <b>{PROBLEM_CATEGORIES[selProblem]}</b></div>
              </div>
            </div>
          </BX>}

          {/* CATEGORY BREAKDOWN */}
          <BX t="Problem Categories">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={catD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                style={{fontSize:10,fontFamily:"'Nunito',sans-serif",fill:"#4A4A4A"}}>
                {catD.map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip contentStyle={tt}/></PieChart>
            </ResponsiveContainer>
          </BX>

          {/* FOLLOW-UP ANSWERS */}
          <BX t="Follow-Up Answers">
            <ResponsiveContainer width="100%" height={Math.max(160,anD.length*24)}>
              <BarChart data={anD} layout="vertical" margin={{left:180,right:16,top:4,bottom:4}}>
                <XAxis type="number" stroke="rgba(0,0,0,.06)" tick={{fill:"rgba(0,0,0,.4)",fontSize:10}}/>
                <YAxis type="category" dataKey="name" width={170} tick={{fill:"#2C2C2C",fontSize:10,fontWeight:500}}/>
                <Tooltip contentStyle={tt}/><Bar dataKey="value" radius={[0,6,6,0]} fill="#7EC8A6"/>
              </BarChart>
            </ResponsiveContainer>
          </BX>

          {/* AGE + AREA + RENT CONTROL */}
          <BX t="Age Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agD.sort((a,b)=>Number(a.name)-Number(b.name))} margin={{left:10,right:10,top:4,bottom:4}}>
                <XAxis dataKey="name" stroke="rgba(0,0,0,.06)" tick={{fill:"#2C2C2C",fontSize:11}}/>
                <YAxis stroke="rgba(0,0,0,.06)" tick={{fill:"rgba(0,0,0,.4)",fontSize:10}}/>
                <Tooltip contentStyle={tt}/><Bar dataKey="value" radius={[4,4,0,0]} fill="#A47ED4"/>
              </BarChart>
            </ResponsiveContainer>
          </BX>

          <BX t="Rent Control Stance">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pi(rcC)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`}
                style={{fontSize:10,fontFamily:"'Nunito',sans-serif",fill:"#4A4A4A"}}>
                {pi(rcC).map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip contentStyle={tt}/></PieChart>
            </ResponsiveContainer>
          </BX>

          <BX t="Monthly Rent">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pi(reC)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fill:"#4A4A4A"}}>
                {pi(reC).map((_,i)=><Cell key={i} fill={P[(i+4)%P.length]}/>)}</Pie><Tooltip contentStyle={tt}/></PieChart>
            </ResponsiveContainer>
          </BX>

          <BX t="Income to Rent">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pi(iC)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                style={{fontSize:10,fontFamily:"'Nunito',sans-serif",fill:"#4A4A4A"}}>
                {pi(iC).map((_,i)=><Cell key={i} fill={P[(i+2)%P.length]}/>)}</Pie><Tooltip contentStyle={tt}/></PieChart>
            </ResponsiveContainer>
          </BX>

          {/* PROBLEMS BY LOCATION */}
          <BX t="📍 Problems Mapped by Location" s={2}>
            <div style={{maxHeight:320,overflowY:"auto"}}>
              {Object.entries(pL).sort((a,b)=>Object.values(b[1]).reduce((s,v)=>s+v,0)-Object.values(a[1]).reduce((s,v)=>s+v,0)).map(([loc,probs])=>(
                <div key={loc} style={{marginBottom:14}}>
                  <div style={{fontFamily:"'Lora',serif",fontWeight:600,fontSize:13,marginBottom:5}}>📍 {loc}
                    <span style={{fontSize:10,fontWeight:400,color:"rgba(0,0,0,.35)",marginLeft:8}}>
                      {REGION_META[loc]?.council||Object.entries(REGION_META).find(([_,m])=>UK[Object.keys(UK).find(k=>UK[k].includes(loc))])?.[1]?.council||""}
                    </span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {Object.entries(probs).sort((a,b)=>b[1]-a[1]).map(([p,c],i)=>(
                      <span key={p} className="tag" style={{background:`${P[i%P.length]}15`,color:P[i%P.length]}}>{p} ({c})</span>))}
                  </div>
                </div>
              ))}
            </div>
          </BX>

          {/* ALL RESPONSES */}
          <BX t={`📋 All Responses (${n})`} s={2}>
            <div style={{maxHeight:500,overflowY:"auto"}}>
              {txts.map((r,i)=>(
                <div key={i} style={{padding:"14px 16px",borderRadius:14,background:"#FBF8F3",border:"1px solid rgba(0,0,0,.04)",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:6}}>
                    <span style={{fontWeight:700,fontSize:12}}>Age {r.age} · {r.situation}</span>
                    <span style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>📍 {r.area} · {r.rent} · {r.pctIncome}</span>
                  </div>
                  <div style={{fontFamily:"'Lora',serif",fontSize:13,fontStyle:"italic",lineHeight:1.6,marginBottom:8}}>
                    &ldquo;{r.text}&rdquo;</div>
                  {r.problems?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                    {r.problems.map((p,j)=>(<span key={j} className="tag" style={{background:`${P[j%P.length]}12`,color:P[j%P.length]}}>{p}</span>))}
                  </div>}
                  {r.answers&&Object.keys(r.answers).length>0&&<div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>
                    Follow-ups: {Object.values(r.answers).join(" · ")}</div>}
                </div>
              ))}
            </div>
          </BX>

          {/* SOLUTIONS */}
          {fixes.length>0&&<BX t="💡 Proposed Solutions" s={2}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxHeight:340,overflowY:"auto"}}>
              {fixes.map((f,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"linear-gradient(135deg,rgba(126,200,166,.06),rgba(107,175,207,.04))",border:"1px solid rgba(126,200,166,.08)"}}>
                  <div style={{fontFamily:"'Lora',serif",fontSize:12.5,lineHeight:1.55}}>&ldquo;{f.text}&rdquo;</div>
                  <div style={{fontSize:10,color:"rgba(0,0,0,.3)",fontWeight:600,marginTop:5}}>📍 {f.area}</div>
                </div>
              ))}
            </div>
          </BX>}

          {/* NOTE-TAKING PAD */}
          <BX t="📝 Research Notes" s={2}>
            <p style={{fontSize:12,color:"rgba(0,0,0,.4)",marginBottom:10}}>Write observations, risks, and notable findings. Export as Word document.</p>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              style={{width:"100%",minHeight:200,padding:16,borderRadius:14,border:"1.5px solid rgba(0,0,0,.08)",background:"rgba(251,248,243,.6)",fontFamily:"'Lora',serif",fontSize:14,lineHeight:1.7,color:"#2C2C2C",resize:"vertical",outline:"none"}}
              placeholder="Type your research notes here. Observations, risk factors, notable patterns, judgment calls..." />
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button className="bt bc" onClick={()=>{
                const wb=XLSX.utils.book_new();
                const ws=XLSX.utils.aoa_to_sheet([["RentTalk Research Notes"],[""],[notes],[""],["Exported: "+new Date().toISOString()]]);
                XLSX.utils.book_append_sheet(wb,ws,"Notes");
                XLSX.writeFile(wb,"RentTalk_Notes_"+new Date().toISOString().split("T")[0]+".xlsx");
              }} style={{fontSize:11,padding:"8px 16px"}}>📥 Export Notes</button>
              <span style={{fontSize:11,color:"rgba(0,0,0,.3)",alignSelf:"center"}}>{notes.length} characters</span>
            </div>
          </BX>

          {/* UK HOUSING BENCHMARKS */}
          <BX t="📏 UK Housing Benchmarks Comparison" s={2}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
              <div style={{padding:14,borderRadius:12,background:"rgba(228,103,126,.04)",border:"1px solid rgba(228,103,126,.08)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#E4677E",textTransform:"uppercase",marginBottom:6}}>Affordability Threshold</div>
                <div style={{fontSize:20,fontFamily:"'Lora',serif",fontWeight:700}}>30%</div>
                <div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>Max recommended income-to-rent ratio (Shelter UK)</div>
                <div style={{fontSize:12,fontWeight:700,color:p4>30?"#E4677E":"#7EC8A6",marginTop:6}}>{p4>30?"⚠️ "+p4+"% of respondents EXCEED this":"✅ Within threshold"}</div>
              </div>
              <div style={{padding:14,borderRadius:12,background:"rgba(126,200,166,.04)",border:"1px solid rgba(126,200,166,.08)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#7EC8A6",textTransform:"uppercase",marginBottom:6}}>Avg UK Rent (2025)</div>
                <div style={{fontSize:20,fontFamily:"'Lora',serif",fontWeight:700}}>£1,332/mo</div>
                <div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>ONS Private Rental Index, England</div>
                <div style={{fontSize:12,fontWeight:700,marginTop:6}}>Survey median: {Object.keys(reC).length>0?Object.entries(reC).sort((a,b)=>b[1]-a[1])[0][0]:"N/A"}</div>
              </div>
              <div style={{padding:14,borderRadius:12,background:"rgba(107,175,207,.04)",border:"1px solid rgba(107,175,207,.08)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#6BAFCF",textTransform:"uppercase",marginBottom:6}}>Section 21 Status</div>
                <div style={{fontSize:20,fontFamily:"'Lora',serif",fontWeight:700}}>Pending Abolition</div>
                <div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>Renters' Rights Bill 2025 — Royal Assent pending</div>
                <div style={{fontSize:12,fontWeight:700,color:pC["Tenure insecurity"]?"#E4677E":"#7EC8A6",marginTop:6}}>{pC["Tenure insecurity"]?pC["Tenure insecurity"]+" respondents cite tenure insecurity":"Not reported"}</div>
              </div>
              <div style={{padding:14,borderRadius:12,background:"rgba(164,126,212,.04)",border:"1px solid rgba(164,126,212,.08)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#A47ED4",textTransform:"uppercase",marginBottom:6}}>Median Age of Renters</div>
                <div style={{fontSize:20,fontFamily:"'Lora',serif",fontWeight:700}}>26 yrs</div>
                <div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>English Housing Survey 2023-24</div>
                <div style={{fontSize:12,fontWeight:700,marginTop:6}}>Survey avg: {agD.length>0?(agD.reduce((s,a)=>s+Number(a.name)*a.value,0)/n).toFixed(1):"N/A"} yrs</div>
              </div>
            </div>
          </BX>

          {/* SEVERITY SCORING */}
          <BX t="🔴 Problem Severity Matrix" s={2}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8}}>
              {pD.map((p,i)=>{
                const pct=((p.value/n)*100);
                const severity=pct>50?"CRITICAL":pct>30?"HIGH":pct>15?"MEDIUM":"LOW";
                const sCol=severity==="CRITICAL"?"#E4677E":severity==="HIGH"?"#F4A77E":severity==="MEDIUM"?"#F7CE76":"#7EC8A6";
                return(<div key={p.name} style={{padding:12,borderRadius:10,background:`${sCol}08`,border:`1px solid ${sCol}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700}}>{p.name}</span>
                    <span style={{fontSize:10,fontWeight:800,color:sCol,padding:"2px 8px",borderRadius:100,background:`${sCol}15`}}>{severity}</span>
                  </div>
                  <div style={{fontSize:11,color:"rgba(0,0,0,.4)"}}>{p.value} reports ({pct.toFixed(0)}%) · {PROBLEM_CATEGORIES[p.name]||"General"}</div>
                  <div style={{height:4,borderRadius:2,background:"rgba(0,0,0,.06)",marginTop:6}}>
                    <div style={{height:"100%",borderRadius:2,background:sCol,width:`${Math.min(pct*2,100)}%`}}/>
                  </div>
                </div>);
              })}
            </div>
          </BX>

          {/* PROTECTED DELETE */}
          <BX t="⚠️ Data Management" s={2}>
            <p style={{fontSize:12,color:"rgba(0,0,0,.4)",marginBottom:12}}>Clearing data is permanent. An export will be forced before deletion.</p>
            {!showDeleteModal?
              <button className="bt bgh" onClick={()=>setShowDeleteModal(true)} style={{fontSize:12,padding:"8px 16px",color:"#E4677E"}}>
                🗑️ Request Data Clear</button>
            :<div style={{padding:20,borderRadius:14,background:"rgba(228,103,126,.04)",border:"1px solid rgba(228,103,126,.15)"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#E4677E",marginBottom:10}}>⚠️ Confirm Data Deletion</div>
              <p style={{fontSize:12,marginBottom:12}}>Step 1: Data will be exported automatically. Step 2: Enter deletion password.</p>
              <input className="inp" type="password" value={deletePin} onChange={e=>{setDeletePin(e.target.value);setDeletePinErr(false);}}
                placeholder="Enter deletion password" style={{marginBottom:10}}/>
              {deletePinErr&&<p style={{color:"#E4677E",fontSize:12,marginBottom:8}}>Incorrect deletion password.</p>}
              <div style={{display:"flex",gap:8}}>
                <button className="bt bgh" onClick={()=>{setShowDeleteModal(false);setDeletePin("");}} style={{fontSize:12,padding:"8px 16px"}}>Cancel</button>
                <button className="bt bp" onClick={()=>{
                  if(deletePin===DELETE_PIN){
                    exportToExcel(data,aggForExport);
                    setTimeout(()=>{onClear();setShowDeleteModal(false);setDeletePin("");},500);
                  }else{setDeletePinErr(true);setDeletePin("");}
                }} style={{fontSize:12,padding:"8px 16px",background:"#E4677E"}}>Export & Delete All Data</button>
              </div>
            </div>}
          </BX>

          {/* LEGAL LANDSCAPE */}
          <BX t="⚖️ Legal Landscape Overview" s={2}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxHeight:400,overflowY:"auto"}}>
              {Object.entries(LEGAL_DB).filter(([prob])=>pC[prob]).map(([prob,info],i)=>(
                <div key={prob} style={{padding:"14px 16px",borderRadius:14,background:"#FBF8F3",border:"1px solid rgba(0,0,0,.04)"}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                    <span>{prob}</span>
                    <span className="tag" style={{background:`${P[i%P.length]}15`,color:P[i%P.length]}}>{pC[prob]} reports</span>
                  </div>
                  <div style={{fontSize:11,marginBottom:6}}><b>Laws:</b> {info.laws.join("; ")}</div>
                  <div style={{fontSize:11,color:"#4A4A4A",lineHeight:1.5}}>{info.impact}</div>
                </div>
              ))}
            </div>
          </BX>
        </div>
      </>)}
    </div>
  );
}

/* ═══ COMPONENTS ═══ */
function FL({children,t}){return(<div style={{fontFamily:"'Lora',serif",fontSize:13,fontWeight:600,marginBottom:8,marginTop:t||0}}>{children}</div>)}
function CG({items,sel,set}){return(<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{items.map(v=>(<button key={v} className={`chip ${sel===v?"s":""}`} onClick={()=>set(v)}>{v}</button>))}</div>)}
function NB({bk,nx,dis}){return(<div style={{display:"flex",gap:10,marginTop:20}}>{bk&&<button className="bt bgh" onClick={bk}>← Back</button>}<button className="bt bp" onClick={nx} disabled={dis} style={{flex:1,justifyContent:"center"}}>Continue →</button></div>)}
function KP({l,v,c,sm}){return(<div className="bx" style={{padding:"14px 16px"}}><div style={{fontSize:9,fontWeight:700,color:"rgba(0,0,0,.3)",letterSpacing:".05em",textTransform:"uppercase",marginBottom:5}}>{l}</div><div style={{fontSize:sm?13:24,fontFamily:"'Lora',serif",fontWeight:700,color:c,lineHeight:1.2}}>{v}</div></div>)}
function BX({t,children,s}){return(<div className="bx" style={{gridColumn:s===2?"1/-1":undefined}}><div style={{fontFamily:"'Lora',serif",fontSize:14,fontWeight:600,marginBottom:14}}>{t}</div>{children}</div>)}

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}
.cd{background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.03);padding:32px 28px;position:relative;overflow:hidden}
.cd::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#E4677E,#7EC8A6);border-radius:20px 20px 0 0}
.lb{font-family:'Lora',serif;font-size:12px;font-weight:600;color:#E4677E;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
.hd{font-family:'Lora',serif;font-size:20px;font-weight:600;line-height:1.4}
.chip{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:100px;border:1.5px solid rgba(0,0,0,.08);background:#fff;color:#4A4A4A;font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;user-select:none}
.chip:hover{border-color:#E4677E;color:#E4677E}.chip.s{border-color:#E4677E;background:#E4677E;color:#fff}
.tag{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;font-family:'Nunito',sans-serif;display:inline-block}
.ta{width:100%;min-height:120px;padding:16px;border-radius:14px;border:1.5px solid rgba(0,0,0,.08);background:rgba(251,248,243,.6);font-family:'Lora',serif;font-size:15px;line-height:1.6;color:#2C2C2C;resize:vertical;outline:none}
.ta:focus{border-color:#E4677E}.ta::placeholder{color:rgba(0,0,0,.2);font-style:italic}
.bt{padding:14px 30px;border-radius:100px;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.bp{background:#2C2C2C;color:#fff}.bp:hover{background:#1a1a1a}.bp:disabled{background:rgba(0,0,0,.1);color:rgba(0,0,0,.2);cursor:not-allowed}
.bc{background:#E4677E;color:#fff}.bc:hover{background:#C4526A}
.bgh{background:transparent;color:#4A4A4A;border:1.5px solid rgba(0,0,0,.1)}
.inp{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid rgba(0,0,0,.08);background:rgba(251,248,243,.6);font-family:'Nunito',sans-serif;font-size:15px;color:#2C2C2C;outline:none}.inp:focus{border-color:#E4677E}
.bx{background:#fff;border-radius:16px;padding:22px;box-shadow:0 1px 10px rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.04)}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.an{animation:fi .4s ease forwards}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:3px}
`;
