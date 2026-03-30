import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const ADMIN_PIN = "zubife6ezklm5nthmalu78gytklm3shan7nekomo";
const DELETE_PIN = "zbekbermraaaaaaatbatshufut3alm9";
const P = ["#2C2C2C","#6B6B6B","#999","#B5B5B5","#D4D4D4","#8B8B8B","#555","#777","#AAA","#CCC"];
const FUNC = "/.netlify/functions/data";
const BLOB = "https://jsonblob.com/api/jsonBlob/019d3aec-1fd0-7391-86f3-9e085eba2130";
const PROXY = "https://corsproxy.io/?";
const INTEL_FUNC = "/.netlify/functions/intel";

const UK = {
  "London":["Central","East","West","North","South","Zone 3–4","Zone 5–6"],
  "South East":["Brighton","Oxford","Reading","Canterbury","Guildford","Milton Keynes","Southampton"],
  "South West":["Bristol","Bath","Exeter","Plymouth","Bournemouth","Cheltenham","Swindon"],
  "East of England":["Cambridge","Norwich","Ipswich","Colchester","Luton","Peterborough","Southend"],
  "West Midlands":["Birmingham","Coventry","Wolverhampton","Stoke-on-Trent","Worcester","Solihull"],
  "East Midlands":["Nottingham","Leicester","Derby","Northampton","Lincoln","Loughborough"],
  "North West":["Manchester","Liverpool","Preston","Chester","Bolton","Blackpool","Warrington"],
  "North East":["Newcastle","Sunderland","Durham","Middlesbrough","Gateshead","Hartlepool"],
  "Yorkshire & Humber":["Leeds","Sheffield","York","Bradford","Hull","Huddersfield","Doncaster"],
  "Scotland":["Edinburgh","Glasgow","Aberdeen","Dundee","Inverness","Stirling"],
  "Wales":["Cardiff","Swansea","Newport","Bangor","Aberystwyth","Wrexham"],
  "Northern Ireland":["Belfast","Derry","Lisburn","Newry","Craigavon"]
};

const RMETA = {
  "London":{council:"Greater London Authority",news:["Evening Standard","BBC London"],lat:51.509,lng:-0.118},
  "South East":{council:"Various County Councils",news:["BBC South East","The Argus"],lat:51.27,lng:-0.52},
  "South West":{council:"Various County Councils",news:["BBC West","Bristol Post"],lat:50.95,lng:-2.59},
  "East of England":{council:"Various County Councils",news:["BBC East","Cambridge News"],lat:52.24,lng:0.90},
  "West Midlands":{council:"West Midlands Combined Authority",news:["BBC Midlands","Birmingham Mail"],lat:52.49,lng:-1.90},
  "East Midlands":{council:"Various County Councils",news:["BBC East Midlands","Nottingham Post"],lat:52.83,lng:-1.25},
  "North West":{council:"Greater Manchester Combined Authority",news:["BBC North West","MEN"],lat:53.48,lng:-2.24},
  "North East":{council:"North East Combined Authority",news:["BBC North East","Chronicle Live"],lat:54.97,lng:-1.61},
  "Yorkshire & Humber":{council:"Various Councils",news:["BBC Yorkshire","Yorkshire Post"],lat:53.80,lng:-1.55},
  "Scotland":{council:"Scottish Government",news:["BBC Scotland","The Scotsman"],lat:56.49,lng:-4.20},
  "Wales":{council:"Welsh Government / Senedd",news:["BBC Wales","Wales Online"],lat:52.13,lng:-3.63},
  "Northern Ireland":{council:"NI Executive",news:["BBC NI","Belfast Telegraph"],lat:54.60,lng:-6.65}
};

const LEGAL = {
  "Rental affordability":{laws:["Renters' Rights Bill 2025","Rent Repayment Orders","LHA rates"],impact:"Renters' Rights Bill aims to end Section 21 and regulate rent increases. LHA rates frozen since 2020."},
  "Poor conditions":{laws:["Homes (Fitness for Habitation) Act 2018","HHSRS","Decent Homes Standard"],impact:"Landlords must ensure fitness for habitation. HHSRS gives councils enforcement power."},
  "Landlord issues":{laws:["Tenant Fees Act 2019","Renters' Rights Bill 2025","Property Ombudsman"],impact:"Tenant Fees Act bans most letting fees. Renters' Rights Bill creates landlord register."},
  "Tenure insecurity":{laws:["Section 21 Housing Act 1988","Renters' Rights Bill 2025"],impact:"Section 21 no-fault evictions being abolished. Currently 2 months notice required."},
  "Market competition":{laws:["Competition Act 1998","Bidding transparency proposals"],impact:"No current legislation on rental bidding wars. Some councils piloting rent auction bans."},
  "High upfront costs":{laws:["Tenant Fees Act 2019","Deposit cap (5 weeks)"],impact:"Deposits capped at 5 weeks rent. Government exploring deposit passporting."},
  "Energy & bills":{laws:["MEES regulations","EPC requirements","Energy Act 2023"],impact:"Rental properties need EPC E minimum. Proposed upgrade to C by 2028."},
  "Discrimination":{laws:["Equality Act 2010","DSS case law 2020","Right to Rent"],impact:"Blanket 'No DSS' bans ruled unlawful. Right to Rent checks criticised for profiling."},
  "Mental health":{laws:["Care Act 2014","Housing Act 1996"],impact:"Councils have duty to house those with mental health conditions. Poor housing recognised as determinant."},
  "Unable to save":{laws:["Lifetime ISA","First Homes scheme"],impact:"Lifetime ISA provides 25% bonus up to £1000/year. First Homes offers 30% discount."}
};

const CATS = {"Rental affordability":"Financial","Poor conditions":"Physical","Landlord issues":"Relational","Tenure insecurity":"Legal","Market competition":"Market","High upfront costs":"Financial","Energy & bills":"Financial","Discrimination":"Relational","Mental health":"Wellbeing","Unable to save":"Financial"};

/* ═ CLOUD ═ */
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

/* ═ ANALYSER ═ */
function analyse(text){
  const t=text.toLowerCase(),pr=[];
  if(/rent|afford|expens|cost|price|money|pay|budget|salary|wage|income/.test(t))pr.push("Rental affordability");
  if(/damp|mould|mold|cold|repair|broken|condition|leak|heat|rot|pest|mice/.test(t))pr.push("Poor conditions");
  if(/landlord|agent|letting|unresponsive|ignore|manage|harass/.test(t))pr.push("Landlord issues");
  if(/evict|section 21|notice|insecur|tenure|renew|kick/.test(t))pr.push("Tenure insecurity");
  if(/compet|bidding|demand|applicat|fight|queue|outbid/.test(t))pr.push("Market competition");
  if(/deposit|upfront|fee|charge|guarantor|credit/.test(t))pr.push("High upfront costs");
  if(/energy|bill|utility|electric|gas|insul/.test(t))pr.push("Energy & bills");
  if(/discriminat|refus|reject|benefit|dss|universal credit/.test(t))pr.push("Discrimination");
  if(/mental|stress|anxi|depress|health|wellbeing/.test(t))pr.push("Mental health");
  if(/save|saving|mortgage|buy|own|future|stuck|trapped/.test(t))pr.push("Unable to save");
  if(pr.length===0)pr.push("Rental affordability");
  return pr.slice(0,6);
}

/* ═ EXCEL ═ */
function toExcel(data,pC,pL,reC,iC,anC){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data.map((r,i)=>({"#":i+1,Age:r.age,Employment:r.employment||"",Region:r.region,Area:r.area,"Past Areas":(r.pastAreas||[]).join("; "),Situation:r.situation,"Property Type":r.propertyType||"","Tenancy Length":r.tenancyLength||"","How Found":r.howFound||"",Rent:r.rent,"Income%":r.pctIncome,"Deposit Issue":r.depositIssue||"",Benefits:r.benefits||"","Condition Rating":r.conditionRating||"","Landlord Rating":r.landlordRating||"",Response:r.freeText,Positive:r.positive||"",Problems:(r.problems||[]).join("; "),Solution:r.proposedFix,"Rent Control":r.rentControl,Rating:r.brokenRating}))),"Responses");
  const pD=Object.entries(pC).map(([k,v])=>({Problem:k,Count:v,Category:CATS[k]||"",Laws:LEGAL[k]?.laws?.join("; ")||"",Impact:LEGAL[k]?.impact||""}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(pD),"Problems");
  const rD=Object.entries(pL).map(([loc,probs])=>({Location:loc,Total:Object.values(probs).reduce((s,v)=>s+v,0),Top:Object.entries(probs).sort((a,b)=>b[1]-a[1])[0]?.[0]||"",All:Object.entries(probs).map(([p,c])=>`${p}(${c})`).join("; "),Council:RMETA[loc]?.council||""}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rD),"Regional");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([...Object.entries(reC).map(([k,v])=>({Type:"Rent",Bracket:k,Count:v})),...Object.entries(iC).map(([k,v])=>({Type:"Income%",Bracket:k,Count:v}))]),"Financial");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data.filter(r=>r.proposedFix).map(r=>({Region:r.region,Area:r.area,Solution:r.proposedFix,Rating:r.brokenRating}))),"Solutions");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(Object.entries(LEGAL).map(([k,v])=>({Problem:k,Laws:v.laws.join("; "),Impact:v.impact,Reports:pC[k]||0}))),"Legal");
  XLSX.writeFile(wb,`RentTalk_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/* ═ AI ═ */
async function getAI(region,problems){
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
        messages:[{role:"user",content:`UK housing analyst. Region: "${region}". Problems: ${problems.join(", ")}. Return ONLY JSON: {"news":"2 sentences local news","council":"2 sentences council performance","ecosystem":"2 sentences community links","positive":"1 positive legal development","negative":"1 negative gap","severity":"high/medium/low","recommendation":"1 sentence"}`}]})});
    const d=await r.json();const txt=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("");
    return JSON.parse(txt.replace(/```json|```/g,"").trim());
  }catch(e){return{news:`Housing pressures in ${region} reflect national trends.`,council:"Local authority performance varies.",ecosystem:"Challenges connect to employment and transport.",positive:"Renters' Rights Bill 2025.",negative:"LHA freeze continues.",severity:problems.length>2?"high":"medium",recommendation:"Further investigation recommended."};}
}

/* ═══════════ APP ═══════════ */
export default function App(){
  const [view,setView]=useState("survey");
  const [pin,setPin]=useState(false);
  const [dd,setDD]=useState([]);
  const [dl,setDL]=useState(false);
  const reload=useCallback(async()=>{setDL(true);setDD(await cloudLoad());setDL(false);},[]);
  useEffect(()=>{if(view==="dash")reload();},[view,reload]);
  return(
    <div style={{minHeight:"100vh",background:"#FAF9F6",fontFamily:"'Nunito',-apple-system,sans-serif",color:"#1A1A1A"}}>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      {view==="survey"&&<Survey onAdmin={()=>setView("pin")}/>}
      {view==="pin"&&<PinGate onOk={()=>{setPin(true);setView("dash");}} onBack={()=>setView("survey")}/>}
      {view==="dash"&&pin&&<Dash data={dd} loading={dl} reload={reload} onClear={async()=>{await cloudClear();setDD([]);}} onBack={()=>setView("survey")}/>}
    </div>
  );
}

function PinGate({onOk,onBack}){
  const [p,setP]=useState("");const [e,setE]=useState(false);
  return(<div style={{maxWidth:360,margin:"0 auto",padding:"120px 24px",textAlign:"center"}}>
    <div className="card" style={{padding:"48px 32px"}}>
      <h2 className="serif" style={{fontSize:22,marginBottom:20}}>Admin Access</h2>
      <input type="password" value={p} onChange={x=>{setP(x.target.value);setE(false);}} onKeyDown={x=>x.key==="Enter"&&(p===ADMIN_PIN?onOk():(setE(true),setP("")))}
        placeholder="Enter password" style={{width:"100%",padding:"14px 18px",borderRadius:12,border:"1.5px solid #E0E0E0",fontSize:15,fontFamily:"inherit",outline:"none",marginBottom:12}}/>
      {e&&<p style={{color:"#C0392B",fontSize:13,marginBottom:10}}>Incorrect</p>}
      <button className="btn primary" onClick={()=>p===ADMIN_PIN?onOk():(setE(true),setP(""))} style={{width:"100%"}}>Enter</button>
      <button className="btn ghost" onClick={onBack} style={{width:"100%",marginTop:8,fontSize:12}}>← Back</button>
    </div>
  </div>);
}

/* ═══════════ SURVEY ═══════════ */

/* ═══════════ EXPANDED SURVEY ═══════════ */

/* ═══════════ SURVEY — RentShield-informed demographic intelligence ═══════════ */
function Survey({onAdmin}){
  const [s,setS]=useState(0);
  const [d,setD]=useState({
    // Personal
    age:"",gender:"",relationship:"",nationality:"",ukNational:"",rightToRent:"",
    // Income & employment (RentShield branching)
    incomeSource:"",employment:"",employer:"",
    // Student branch
    university:"",course:"",graduationYear:"",stayAfterGrad:"",
    // Benefits branch
    benefitType:"",benefitAmount:"",council:"",
    // Dependant branch
    supportedBy:"",
    // Guarantor
    hasGuarantor:"",guarantorType:"",
    // Living
    situation:"",region:"",area:"",pastAreas:[],
    propertyType:"",bedrooms:"",tenancyLength:"",howFound:"",
    // Financial
    rent:"",pctIncome:"",depositIssue:"",
    // Experience
    freeText:"",positive:"",conditionRating:5,landlordRating:5,
    // AI follow-ups
    problems:[],aiQuestions:[],answers:{},
    // Solutions
    proposedFix:"",rentControl:"",brokenRating:5
  });
  const [sub,setSub]=useState(false);const [done,setDone]=useState(false);
  const [err,setErr]=useState(false);const [aiLoad,setAiLoad]=useState(false);
  const u=(k,v)=>setD(p=>({...p,[k]:v}));const nx=()=>setS(x=>x+1);const bk=()=>setS(x=>x-1);

  // Build demographic profile string for AI context
  const profile=()=>{
    let p=`Age ${d.age}, ${d.gender}, ${d.relationship}, ${d.nationality}`;
    if(d.incomeSource==="Employed")p+=`, ${d.employment} at ${d.employer||"undisclosed"}`;
    if(d.incomeSource==="Student")p+=`, studying ${d.course||"undisclosed"} at ${d.university||"undisclosed"}, graduating ${d.graduationYear||"TBD"}${d.stayAfterGrad?", plans to stay: "+d.stayAfterGrad:""}`;
    if(d.incomeSource==="Benefits")p+=`, on ${d.benefitType||"benefits"}, council: ${d.council||"undisclosed"}`;
    if(d.incomeSource==="Dependant")p+=`, supported by ${d.supportedBy||"family"}`;
    p+=`. ${d.situation}, ${d.propertyType||""} in ${d.area} (${d.region}), paying ${d.rent} (${d.pctIncome} of income)`;
    if(d.hasGuarantor==="No")p+=", no guarantor";
    if(!d.ukNational||d.ukNational==="No")p+=`, nationality: ${d.nationality}, right to rent: ${d.rightToRent}`;
    return p;
  };

  // INTELLIGENT QUESTION ENGINE
  // 1. Loads existing cloud responses to learn common patterns
  // 2. Detects sentiment (positive vs negative experience)
  // 3. Generates balanced questions exploring both sides
  // 4. Every question is unique, context-aware, region-specific
  const generateAI=async()=>{
    setAiLoad(true);const pr=analyse(d.freeText);u("problems",pr);
    
    // Detect sentiment — is this person's experience mostly negative or has positives?
    const negWords=/terrible|awful|horrible|disgusting|unliveable|nightmare|hell|worst|broken|unsafe|freezing|mould|damp|harass|threaten|evict|discriminat/i;
    const posWords=/good|great|nice|lovely|fair|reasonable|responsive|helpful|friendly|clean|well-maintained|happy|comfortable|decent|quiet/i;
    const isNeg=negWords.test(d.freeText);
    const isPos=posWords.test(d.positive||"")||posWords.test(d.freeText);
    const sentiment=isPos&&!isNeg?"positive":isNeg&&!isPos?"negative":"mixed";
    
    // Load existing responses to understand common patterns in this region
    let commonProblems=[], avgRating=5;
    try{
      const existing=await cloudLoad();
      const regional=existing.filter(r=>r.region===d.region);
      if(regional.length>0){
        const pc={};regional.forEach(r=>(r.problems||[]).forEach(p=>{pc[p]=(pc[p]||0)+1;}));
        commonProblems=Object.entries(pc).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,5);
        avgRating=(regional.reduce((s,r)=>s+(Number(r.brokenRating)||5),0)/regional.length).toFixed(1);
      }
    }catch(e){}
    
    // Try AI via Netlify function
    try{
      const r=await fetch("/.netlify/functions/ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({profile:profile(),freeText:d.freeText,problems:pr,positive:d.positive,
          region:d.region,incomeSource:d.incomeSource,depositIssue:d.depositIssue,
          conditionRating:d.conditionRating,landlordRating:d.landlordRating,
          sentiment,commonProblems,avgRating})});
      if(r.ok){const data=await r.json();if(data.questions?.length>=3){u("aiQuestions",data.questions);setAiLoad(false);nx();return;}}
    }catch(e){}
    
    // SMART FALLBACK — sentiment-aware, balanced, region-specific, never repeats
    const area=d.area||d.region;
    const questions=[];
    
    // Question bank — grouped by theme, each with balanced positive+negative options
    const bank={
      affordability:[
        {id:"af1",q:`How does the cost of renting in ${area} compare to what you expected?`,o:["Much worse than expected","Slightly worse","About what I expected","Actually better than I feared"]},
        {id:"af2",q:"How is your rent level affecting your quality of life?",o:["Severely — cutting essentials","Noticeably — less socialising and saving","Manageable — tight but okay","Comfortable — I can live well"]},
      ],
      conditions:[
        {id:"co1",q:"How would you describe the physical state of your home?",o:["Unsafe or unhealthy conditions","Needs significant repairs","Minor issues but liveable","Good condition, well maintained"]},
        {id:"co2",q:"When you report maintenance issues, what typically happens?",o:["Nothing — completely ignored","Acknowledged but very slow","Fixed within a reasonable time","Handled quickly and well"]},
      ],
      landlord:[
        {id:"ll1",q:"How would you describe your relationship with your landlord or agent?",o:["Hostile or intimidating","Distant and unresponsive","Professional and adequate","Genuinely good and supportive"]},
        {id:"ll2",q:"Does your landlord respect your rights as a tenant?",o:["No — enters without notice, withholds deposit","Sometimes — inconsistent","Mostly yes","Fully — very respectful"]},
      ],
      security:[
        {id:"se1",q:`How secure do you feel staying in your current home in ${area}?`,o:["Very insecure — could lose it anytime","Somewhat worried about the future","Fairly stable for now","Very secure — long-term tenancy"]},
        {id:"se2",q:"What's your biggest concern about your tenancy continuing?",o:["Landlord selling the property","Rent being raised beyond affordability","Section 21 / no-fault eviction","No major concerns — I feel settled"]},
      ],
      market:[
        {id:"mk1",q:`How would you describe the rental market in ${area} right now?`,o:["Extremely competitive — impossible to find anything","Tough — limited options in budget","Manageable if flexible on location","Reasonable — found options fairly easily"]},
        {id:"mk2",q:"How many properties did you view before finding your current home?",o:["10+ and still felt pressured","5–10 with multiple rejections","2–5 before finding something","Found it within first few viewings"]},
      ],
      positive_explore:[
        {id:"po1",q:"What's the best thing about where you're currently renting?",o:["Location and neighbourhood","The property itself","My landlord/agent","The community and neighbours"]},
        {id:"po2",q:"If you could keep one thing about your rental experience and change everything else, what would you keep?",o:["The area I live in","The rent price","The property quality","The flexibility of renting"]},
      ],
      discrimination:[
        {id:"di1",q:"Have you ever been turned down for a rental for reasons unrelated to affordability?",o:["Yes — benefits status (DSS/UC)","Yes — nationality or immigration","Yes — age or student status","No — never experienced this"]},
      ],
      future:[
        {id:"fu1",q:"How has renting shaped your plans for the future?",o:["Can't save — homeownership feels impossible","Delayed major life decisions","Made me consider leaving ${area}","Hasn't significantly affected my plans"]},
        {id:"fu2",q:"What would make you rate the UK rental system higher?",o:["Rent controls tied to local wages","Mandatory minimum property standards","Longer tenancies as default","More affordable housing built"]},
      ],
      regional:[
        {id:"rg1",q:`Compared to other places you've lived, how does ${area} treat its renters?`,o:["Worse — fewer protections and higher costs","About the same as elsewhere","Better — more options and fairer","Much better — I chose to stay here"]},
      ],
      community:[
        {id:"cm1",q:`How connected do you feel to the community in ${area}?`,o:["Not at all — renting makes me feel temporary","Somewhat — but insecurity holds me back","Fairly connected — I've built a life here","Very connected — this is my home"]},
      ]
    };
    
    // Selection logic: pick based on problems, sentiment, and what's not yet covered
    const usedIds=new Set();
    const pick=(category)=>{
      const opts=bank[category]||[];
      for(const q of opts){if(!usedIds.has(q.id)){usedIds.add(q.id);questions.push(q);return true;}}
      return false;
    };
    
    // If positive sentiment detected, lead with positive exploration
    if(sentiment==="positive"||sentiment==="mixed"){pick("positive_explore");}
    
    // Pick based on identified problems
    const probToBank={"Rental affordability":"affordability","Poor conditions":"conditions","Landlord issues":"landlord","Tenure insecurity":"security","Market competition":"market","Discrimination":"discrimination","Unable to save":"future","Mental health":"future","High upfront costs":"affordability","Energy & bills":"conditions"};
    for(const p of pr){const cat=probToBank[p];if(cat&&questions.length<4)pick(cat);}
    
    // Fill remaining with diverse topics not yet covered
    const fillOrder=sentiment==="positive"
      ?["positive_explore","community","regional","future","market","security"]
      :["regional","future","community","positive_explore","market","security","discrimination"];
    for(const cat of fillOrder){if(questions.length>=4)break;pick(cat);}
    
    // Absolute last resort — should never reach here but guarantees 4 unique questions
    if(questions.length<4)pick("affordability");
    if(questions.length<4)pick("conditions");
    if(questions.length<4)pick("landlord");
    if(questions.length<4)pick("community");
    
    u("aiQuestions",questions.slice(0,4));
    setAiLoad(false);nx();
  };

  const submit=async()=>{setSub(true);setErr(false);const ok=await cloudAppend(d);setSub(false);ok?setDone(true):setErr(true);};

  const Nav=()=>(<div style={{position:"sticky",top:0,zIndex:100,background:"rgba(250,249,246,.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(0,0,0,.04)",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <span className="serif" style={{fontSize:17}}>rent<span style={{fontWeight:400,opacity:.4}}>talk</span></span>
    <button onClick={onAdmin} style={{background:"none",border:"none",cursor:"pointer",opacity:.08,fontSize:13,padding:8}}>●</button>
  </div>);

  if(done)return(<><Nav/><div style={{maxWidth:440,margin:"0 auto",textAlign:"center",padding:"100px 20px"}}>
    <div style={{fontSize:42,marginBottom:16}}>✓</div>
    <h2 className="serif" style={{fontSize:24,marginBottom:8}}>Thank you</h2>
    <p style={{color:"#6B6B6B",fontSize:15,lineHeight:1.7}}>Your response is recorded and will shape real research.</p>
  </div></>);

  const tot=9,pct=((s+1)/tot)*100;
  return(<><Nav/><div style={{maxWidth:500,margin:"0 auto",padding:"24px 20px 100px"}}>
    <div style={{marginBottom:28}}><div style={{height:2,borderRadius:1,background:"rgba(0,0,0,.06)"}}><div style={{height:"100%",borderRadius:1,background:"#1A1A1A",width:`${pct}%`,transition:"width .3s"}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:11,fontWeight:700,letterSpacing:".04em"}}>{s+1} of {tot}</span><span style={{fontSize:11,color:"rgba(0,0,0,.25)"}}>{Math.round(pct)}%</span></div></div>

    {/* STEP 0: Welcome */}
    {s===0&&<div className="fade"><div className="card" style={{textAlign:"center",padding:"44px 28px"}}>
      <h1 className="serif" style={{fontSize:26,lineHeight:1.3,marginBottom:12}}>Your renting experience<br/>matters to us</h1>
      <p style={{color:"#6B6B6B",fontSize:14,lineHeight:1.7,maxWidth:380,margin:"0 auto 8px"}}>An independent study into rental challenges facing 18–30 year olds in the UK. Anonymous. Questions adapt to your situation.</p>
      <p style={{fontSize:12,color:"rgba(0,0,0,.2)",marginBottom:28}}>~3 minutes · Your data shapes real research</p>
      <button className="btn primary" onClick={nx} style={{width:"100%"}}>Let's go</button>
    </div></div>}

    {/* STEP 1: Personal — demographics (from RentShield) */}
    {s===1&&<div className="fade"><div className="card">
      <p className="label">About you</p>
      <h2 className="serif q">How old are you?</h2>
      <Chips items={Array.from({length:13},(_,i)=>String(i+18))} sel={d.age} set={v=>u("age",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>Gender</h2>
      <Chips items={["Male","Female","Non-binary","Prefer not to say"]} sel={d.gender} set={v=>u("gender",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>Relationship status</h2>
      <Chips items={["Single","In a relationship","Engaged","Married","Prefer not to say"]} sel={d.relationship} set={v=>u("relationship",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>Are you a UK national?</h2>
      <Chips items={["Yes","No"]} sel={d.ukNational} set={v=>u("ukNational",v)}/>
      {d.ukNational==="No"&&<>
        <h2 className="serif q" style={{marginTop:18}}>Nationality</h2>
        <input type="text" value={d.nationality} onChange={e=>u("nationality",e.target.value)} placeholder="Your nationality" style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1.5px solid #E0E0E0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
        <h2 className="serif q" style={{marginTop:18}}>Do you have the right to rent in the UK?</h2>
        <Chips items={["Yes — British/Irish passport","Yes — settled/pre-settled status","Yes — valid visa","Applying / uncertain","No"]} sel={d.rightToRent} set={v=>u("rightToRent",v)}/>
      </>}
    </div><Btns bk={null} nx={nx} dis={!d.age||!d.gender||!d.relationship||!d.ukNational||(d.ukNational==="No"&&!d.rightToRent)}/></div>}

    {/* STEP 2: Income source — RentShield branching logic */}
    {s===2&&<div className="fade"><div className="card">
      <p className="label">Your income</p>
      <h2 className="serif q">What is your primary source of income?</h2>
      <Chips items={["Employed","Self-employed","Student","Benefits","Dependant (family support)","Investment income","Multiple sources"]} sel={d.incomeSource} set={v=>u("incomeSource",v)}/>

      {/* Employed branch */}
      {(d.incomeSource==="Employed"||d.incomeSource==="Multiple sources")&&<>
        <h2 className="serif q" style={{marginTop:20}}>Employment type</h2>
        <Chips items={["Full-time","Part-time","Zero-hours","Contract/freelance","Apprentice"]} sel={d.employment} set={v=>u("employment",v)}/>
      </>}

      {/* Self-employed branch */}
      {d.incomeSource==="Self-employed"&&<>
        <h2 className="serif q" style={{marginTop:20}}>What type of self-employment?</h2>
        <Chips items={["Sole trader","Limited company","Gig economy","Freelance","Other"]} sel={d.employment} set={v=>u("employment",v)}/>
      </>}

      {/* Student branch */}
      {d.incomeSource==="Student"&&<>
        <h2 className="serif q" style={{marginTop:20}}>Where do you study?</h2>
        <input type="text" value={d.university} onChange={e=>u("university",e.target.value)} placeholder="University / college name" style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1.5px solid #E0E0E0",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:14}}/>
        <h2 className="serif q">What are you studying? <span style={{fontWeight:400,color:"#999",fontSize:13}}>(optional)</span></h2>
        <input type="text" value={d.course} onChange={e=>u("course",e.target.value)} placeholder="Course / subject" style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1.5px solid #E0E0E0",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:14}}/>
        <h2 className="serif q">When do you expect to graduate?</h2>
        <Chips items={["2025","2026","2027","2028","2029+","Already graduated"]} sel={d.graduationYear} set={v=>u("graduationYear",v)}/>
        <h2 className="serif q" style={{marginTop:18}}>Planning to stay in the area after graduating?</h2>
        <Chips items={["Yes, definitely","Probably","Unsure","Probably not","No, moving away"]} sel={d.stayAfterGrad} set={v=>u("stayAfterGrad",v)}/>
      </>}

      {/* Benefits branch */}
      {d.incomeSource==="Benefits"&&<>
        <h2 className="serif q" style={{marginTop:20}}>What type of benefits?</h2>
        <Chips items={["Universal Credit","Housing Benefit","ESA","PIP","JSA","Pension Credit","Other"]} sel={d.benefitType} set={v=>u("benefitType",v)}/>
        <h2 className="serif q" style={{marginTop:18}}>Which council area?</h2>
        <input type="text" value={d.council} onChange={e=>u("council",e.target.value)} placeholder="e.g. Manchester City Council" style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1.5px solid #E0E0E0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
      </>}

      {/* Dependant branch */}
      {d.incomeSource==="Dependant (family support)"&&<>
        <h2 className="serif q" style={{marginTop:20}}>Who supports you financially?</h2>
        <Chips items={["Parents","Spouse/partner","Family trust","Other family","Guardian"]} sel={d.supportedBy} set={v=>u("supportedBy",v)}/>
      </>}

      {/* Investment branch */}
      {d.incomeSource==="Investment income"&&<>
        <h2 className="serif q" style={{marginTop:20}}>Type of investments?</h2>
        <Chips items={["Property","Stocks/shares","Trust fund","Inheritance","Crypto","Mixed portfolio"]} sel={d.employment} set={v=>u("employment",v)}/>
      </>}

      {/* Guarantor — everyone */}
      {d.incomeSource&&<>
        <h2 className="serif q" style={{marginTop:22}}>Do you have a UK-based guarantor?</h2>
        <Chips items={["Yes","No","Used a guarantor service","Wasn't asked for one"]} sel={d.hasGuarantor} set={v=>u("hasGuarantor",v)}/>
      </>}
    </div><Btns bk={bk} nx={nx} dis={!d.incomeSource||!d.hasGuarantor}/></div>}

    {/* STEP 3: Location */}
    {s===3&&<div className="fade"><div className="card">
      <p className="label">Where you rent</p>
      <h2 className="serif q">Which region?</h2>
      <Chips items={Object.keys(UK)} sel={d.region} set={v=>{u("region",v);u("area","");}}/>
      {d.region&&<><h2 className="serif q" style={{marginTop:20}}>Which area?</h2>
      <Chips items={UK[d.region]} sel={d.area} set={v=>u("area",v)}/></>}
      <h2 className="serif q" style={{marginTop:22}}>Rented anywhere else before? <span style={{fontWeight:400,color:"#999",fontSize:13}}>(select all that apply)</span></h2>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {Object.entries(UK).flatMap(([,areas])=>areas).filter(a=>a!==d.area).slice(0,35).map(a=>(
          <button key={a} className={`chip ${d.pastAreas.includes(a)?"on":""}`} style={{fontSize:11,padding:"6px 12px"}}
            onClick={()=>u("pastAreas",d.pastAreas.includes(a)?d.pastAreas.filter(x=>x!==a):[...d.pastAreas,a])}>{a}</button>))}
      </div>
    </div><Btns bk={bk} nx={nx} dis={!d.region||!d.area}/></div>}

    {/* STEP 4: Property */}
    {s===4&&<div className="fade"><div className="card">
      <p className="label">Your property</p>
      <h2 className="serif q">Property type</h2>
      <Chips items={["Studio","1-bed flat","2-bed flat","3+ bed flat","Terraced house","Semi-detached","HMO / shared","Bedsit","Room in home","Other"]} sel={d.propertyType} set={v=>u("propertyType",v)}/>
      <h2 className="serif q" style={{marginTop:20}}>Living situation</h2>
      <Chips items={["Renting alone","With partner","House/flat share","Social housing","Student halls","With family","Lodger","Temporary"]} sel={d.situation} set={v=>u("situation",v)}/>
      <h2 className="serif q" style={{marginTop:20}}>How long in this tenancy?</h2>
      <Chips items={["Under 3 months","3–6 months","6–12 months","1–2 years","2–5 years","5+ years"]} sel={d.tenancyLength} set={v=>u("tenancyLength",v)}/>
      <h2 className="serif q" style={{marginTop:20}}>How did you find it?</h2>
      <Chips items={["Rightmove/Zoopla","Letting agent","SpareRoom","Facebook/Gumtree","Word of mouth","Council","University","Other"]} sel={d.howFound} set={v=>u("howFound",v)}/>
    </div><Btns bk={bk} nx={nx} dis={!d.propertyType||!d.situation||!d.tenancyLength||!d.howFound}/></div>}

    {/* STEP 5: Financial */}
    {s===5&&<div className="fade"><div className="card">
      <p className="label">Finances</p>
      <h2 className="serif q">Monthly rent</h2>
      <Chips items={["Under £400","£400–£600","£600–£800","£800–£1,000","£1,000–£1,500","£1,500–£2,000","£2,000+","Prefer not to say"]} sel={d.rent} set={v=>u("rent",v)}/>
      <h2 className="serif q" style={{marginTop:20}}>What share of your income goes to rent?</h2>
      <Chips items={["Under 20%","20–30%","30–40%","40–50%","Over 50%","Not sure"]} sel={d.pctIncome} set={v=>u("pctIncome",v)}/>
      <h2 className="serif q" style={{marginTop:20}}>Any deposit difficulties?</h2>
      <Chips items={["None","Struggled to afford","Not protected by landlord","Previous deposit withheld","Needed guarantor for deposit","Paid months upfront","N/A"]} sel={d.depositIssue} set={v=>u("depositIssue",v)}/>
    </div><Btns bk={bk} nx={nx} dis={!d.rent||!d.pctIncome||!d.depositIssue}/></div>}

    {/* STEP 6: Experience */}
    {s===6&&<div className="fade"><div className="card">
      <p className="label">Your experience</p>
      <h2 className="serif q">What challenges do you face renting?</h2>
      <p style={{color:"#6B6B6B",fontSize:13,marginBottom:14}}>Be specific — affordability, conditions, landlords, agents, discrimination, anything at all.</p>
      <textarea className="ta" value={d.freeText} onChange={e=>u("freeText",e.target.value)} placeholder="What's been difficult…" style={{minHeight:140}}/>
      <h2 className="serif q" style={{marginTop:22}}>Anything positive about your experience? <span style={{fontWeight:400,color:"#999",fontSize:13}}>(optional but valuable)</span></h2>
      <textarea className="ta" value={d.positive} onChange={e=>u("positive",e.target.value)} placeholder="Good landlord, nice area, fair rent…" style={{minHeight:70}}/>
      <h2 className="serif q" style={{marginTop:20}}>Rate your property's condition</h2>
      <input type="range" min={1} max={10} value={d.conditionRating} onChange={e=>u("conditionRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999"}}><span>1 = Terrible</span><span className="serif" style={{fontSize:20,color:"#1A1A1A"}}>{d.conditionRating}</span><span>10 = Excellent</span></div>
      <h2 className="serif q" style={{marginTop:18}}>Rate your landlord / agent</h2>
      <input type="range" min={1} max={10} value={d.landlordRating} onChange={e=>u("landlordRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999"}}><span>1 = Terrible</span><span className="serif" style={{fontSize:20,color:"#1A1A1A"}}>{d.landlordRating}</span><span>10 = Excellent</span></div>
    </div><div style={{display:"flex",gap:10,marginTop:20}}><button className="btn ghost" onClick={bk}>← Back</button>
      <button className="btn primary" onClick={generateAI} disabled={d.freeText.trim().length<10||aiLoad} style={{flex:1}}>{aiLoad?"Personalising…":"Continue"}</button>
    </div></div>}

    {/* STEP 7: AI-personalised follow-ups */}
    {s===7&&<div className="fade">
      <div className="card" style={{marginBottom:12}}>
        <p className="label">Tailored to your situation in {d.area}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{d.problems.map((p,i)=>(<span key={i} className="tag">{p}</span>))}</div>
      </div>
      {(d.aiQuestions||[]).map((q,qi)=>(<div key={q.id} className="card" style={{marginBottom:10}}>
        <p className="label">{qi+1} of {d.aiQuestions.length}</p>
        <h2 className="serif q">{q.q}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{q.o.map(o=>(<button key={o} className={`chip full ${d.answers[q.id]===o?"on":""}`} onClick={()=>u("answers",{...d.answers,[q.id]:o})}>{o}</button>))}</div>
      </div>))}
    <Btns bk={bk} nx={nx} dis={Object.keys(d.answers).length<(d.aiQuestions||[]).length}/></div>}

    {/* STEP 8: Solutions + rating */}
    {s===8&&<div className="fade">
      <div className="card" style={{marginBottom:12}}>
        <p className="label">Looking forward</p>
        <h2 className="serif q">What changes would genuinely help?</h2>
        <textarea className="ta" value={d.proposedFix} onChange={e=>u("proposedFix",e.target.value)} placeholder="Rent caps, inspections, longer tenancies, more social housing…"/>
      </div>
      <div className="card" style={{marginBottom:12}}>
        <h2 className="serif q">Do you support government rent controls?</h2>
        <Chips items={["Strongly support","Somewhat support","Neutral","Somewhat oppose","Strongly oppose"]} sel={d.rentControl} set={v=>u("rentControl",v)}/>
      </div>
      <div className="card">
        <h2 className="serif q">Rate the UK rental system for your age group</h2>
        <input type="range" min={1} max={10} value={d.brokenRating} onChange={e=>u("brokenRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999"}}><span>1 = Fine</span><span className="serif" style={{fontSize:26,color:"#1A1A1A"}}>{d.brokenRating}</span><span>10 = Broken</span></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn ghost" onClick={bk}>← Back</button>
        <button className="btn primary" onClick={submit} disabled={!d.rentControl||d.proposedFix.trim().length<3||sub} style={{flex:1}}>{sub?"Saving…":"Submit"}</button></div>
      {err&&<p style={{color:"#C0392B",fontSize:13,marginTop:12,textAlign:"center"}}>Error saving. Try again.</p>}
    </div>}
  </div></>);
}

function Dash({data,loading,reload,onClear,onBack}){
  const n=data.length;
  const [tab,setTab]=useState("responses");
  const [selR,setSelR]=useState(null);
  const [ai,setAi]=useState({});
  const [aiL,setAiL]=useState(false);
  const [notes,setNotes]=useState("");
  const [delModal,setDelModal]=useState(false);
  const [delPin,setDelPin]=useState("");
  const [delErr,setDelErr]=useState(false);
  const [intel,setIntel]=useState(null);
  const [intL,setIntL]=useState(false);
  const [intR,setIntR]=useState("");

  // Aggregate
  const rC={},aC={},reC={},iC={},rcC={},pC={},anC={},pL={},agC={},catC={};
  let tR=0,o4=0;const txts=[],fixes=[];
  data.forEach(r=>{
    if(r.region)rC[r.region]=(rC[r.region]||0)+1;
    if(r.area)aC[r.area]=(aC[r.area]||0)+1;
    if(r.rent)reC[r.rent]=(reC[r.rent]||0)+1;
    if(r.pctIncome)iC[r.pctIncome]=(iC[r.pctIncome]||0)+1;
    if(r.rentControl)rcC[r.rentControl]=(rcC[r.rentControl]||0)+1;
    if(r.age)agC[r.age]=(agC[r.age]||0)+1;
    (r.problems||[]).forEach(p=>{pC[p]=(pC[p]||0)+1;const c=CATS[p]||"General";catC[c]=(catC[c]||0)+1;});
    tR+=Number(r.brokenRating)||0;
    if(r.pctIncome==="40–50%"||r.pctIncome==="Over 50%")o4++;
    if(r.freeText)txts.push({text:r.freeText,positive:r.positive,area:r.area||r.region,age:r.age,rent:r.rent,problems:r.problems,situation:r.situation,employment:r.employment||r.incomeSource,pctIncome:r.pctIncome,answers:r.answers,pastAreas:r.pastAreas,propertyType:r.propertyType,tenancyLength:r.tenancyLength,conditionRating:r.conditionRating,landlordRating:r.landlordRating,depositIssue:r.depositIssue,gender:r.gender,ukNational:r.ukNational,incomeSource:r.incomeSource,hasGuarantor:r.hasGuarantor,university:r.university,benefitType:r.benefitType});
    if(r.proposedFix)fixes.push({text:r.proposedFix,area:r.area||r.region,rating:r.brokenRating});
    const loc=r.area||r.region;if(loc)(r.problems||[]).forEach(p=>{if(!pL[loc])pL[loc]={};pL[loc][p]=(pL[loc][p]||0)+1;});
    if(r.answers)Object.values(r.answers).forEach(a=>{anC[a]=(anC[a]||0)+1;});
  });
  const sr=o=>Object.entries(o).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const pD=sr(pC),agD=sr(agC),catD=sr(catC);
  const avg=n?(tR/n).toFixed(1):"0";

  // AI + Intel
  const loadAI=async(region)=>{if(ai[region])return;setAiL(true);const pr=pL[region]?Object.keys(pL[region]):Object.keys(pC).slice(0,3);const ctx=await getAI(region,pr);setAi(prev=>({...prev,[region]:ctx}));setAiL(false);};
  useEffect(()=>{if(selR)loadAI(selR);},[selR]);
  const loadInt=async()=>{try{const r=await fetch(INTEL_FUNC);if(r.ok)setIntel(await r.json());}catch(e){}};
  useEffect(()=>{loadInt();},[]);
  const runScan=async(region)=>{setIntL(true);try{await fetch(INTEL_FUNC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({region:region||null,problems:Object.keys(pC),freeTexts:txts.map(t=>t.text)})});await loadInt();}catch(e){}setIntL(false);};

  if(loading)return(<div style={{textAlign:"center",padding:80,color:"#999"}}>Loading…</div>);
  const tabs=[["responses","Responses"],["analysis","Analysis"],["regional","Regional"],["intel","Intel"],["tools","Tools"]];

  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px 60px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0 12px",flexWrap:"wrap",gap:8}}>
        <div><span className="serif" style={{fontSize:18}}>rent<span style={{fontWeight:400,opacity:.3}}>talk</span></span>
          <span style={{fontSize:11,color:"#999",marginLeft:10}}>{n} responses</span></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn ghost sm" onClick={onBack}>← Survey</button>
          <button className="btn ghost sm" onClick={reload}>↻</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid rgba(0,0,0,.08)",marginBottom:20}}>
        {tabs.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{padding:"10px 20px",fontSize:13,fontWeight:tab===k?700:500,color:tab===k?"#1A1A1A":"#999",background:"none",border:"none",borderBottom:tab===k?"2px solid #1A1A1A":"2px solid transparent",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l}</button>))}
      </div>

      {n===0?<div style={{textAlign:"center",padding:"60px 0"}}><p className="serif" style={{fontSize:20,opacity:.3}}>No responses yet</p></div>:<>

      {/* ═ RESPONSES TAB ═ */}
      {tab==="responses"&&<div>
        {/* Quick stats row */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <Stat l="Avg Rating" v={`${avg}/10`}/><Stat l="Top Issue" v={pD[0]?.name||"—"}/><Stat l=">40% Income" v={`${n?Math.round((o4/n)*100):0}%`}/><Stat l="Regions" v={Object.keys(rC).length}/>
        </div>
        {/* Responses feed */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {txts.map((r,i)=>(
            <div key={i} className="card" style={{padding:"18px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:12,fontWeight:700}}>Age {r.age} · {r.gender} · {r.employment||r.incomeSource} · {r.situation}</span>
                <span style={{fontSize:11,color:"#999"}}>{r.area} · {r.propertyType} · {r.rent} · {r.pctIncome}{r.hasGuarantor==="No"?" · No guarantor":""}{r.ukNational==="No"?" · Non-UK":""}  </span>
              </div>
              <div className="serif" style={{fontSize:15,lineHeight:1.65,marginBottom:10,fontStyle:"italic",color:"#333"}}>"{r.text}"</div>
              {(r.conditionRating||r.landlordRating)&&<div style={{fontSize:11,color:"#999",marginBottom:6}}>Condition: {r.conditionRating}/10 · Landlord: {r.landlordRating}/10{r.tenancyLength?" · "+r.tenancyLength:""}{r.depositIssue&&r.depositIssue!=="No issues"?" · Deposit: "+r.depositIssue:""}{r.benefits&&r.benefits!=="No benefits"?" · "+r.benefits:""}</div>}
              {r.positive&&<div style={{fontSize:13,lineHeight:1.6,color:"#6B6B6B",marginBottom:10,paddingLeft:12,borderLeft:"2px solid #E0E0E0"}}>
                <span style={{fontWeight:700,fontSize:11,color:"#999",display:"block",marginBottom:2}}>POSITIVE</span>{r.positive}</div>}
              {r.problems?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                {r.problems.map((p,j)=>(<span key={j} className="tag">{p}</span>))}
              </div>}
              {r.pastAreas?.length>0&&<div style={{fontSize:11,color:"#999"}}>Past areas: {r.pastAreas.join(", ")}</div>}
              {r.answers&&Object.keys(r.answers).length>0&&<div style={{fontSize:11,color:"#AAA",marginTop:4}}>
                {Object.values(r.answers).join(" · ")}</div>}
            </div>
          ))}
        </div>
        {fixes.length>0&&<div style={{marginTop:24}}><h3 className="serif" style={{fontSize:16,marginBottom:12}}>Proposed solutions</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {fixes.map((f,i)=>(
              <div key={i} className="card" style={{padding:"14px 18px"}}>
                <div className="serif" style={{fontSize:13,lineHeight:1.55}}>"{f.text}"</div>
                <div style={{fontSize:10,color:"#999",marginTop:5}}>📍 {f.area} · Rating: {f.rating}/10</div>
              </div>))}
          </div>
        </div>}
      </div>}

      {/* ═ ANALYSIS TAB ═ */}
      {tab==="analysis"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="card" style={{gridColumn:"1/-1"}}>
          <p className="label">Problem severity</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginTop:10}}>
            {pD.map((p,i)=>{const pct=((p.value/n)*100);const sev=pct>50?"CRITICAL":pct>30?"HIGH":pct>15?"MEDIUM":"LOW";
              return(<div key={p.name} style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700}}>{p.name}</span>
                  <span style={{fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:100,background:sev==="CRITICAL"?"#1A1A1A":sev==="HIGH"?"#555":"#E0E0E0",color:sev==="CRITICAL"||sev==="HIGH"?"#fff":"#555"}}>{sev}</span>
                </div>
                <div style={{fontSize:11,color:"#999"}}>{p.value} reports ({pct.toFixed(0)}%)</div>
                <div style={{height:3,borderRadius:2,background:"rgba(0,0,0,.04)",marginTop:6}}><div style={{height:"100%",borderRadius:2,background:"#1A1A1A",width:`${Math.min(pct*2,100)}%`,opacity:pct>30?1:.5}}/></div>
              </div>)})}
          </div>
        </div>
        <div className="card"><p className="label">Categories</p>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={catD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} style={{fontSize:10,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{catD.map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
        </div>
        <div className="card"><p className="label">Rent control stance</p>
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={sr(rcC)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} style={{fontSize:10,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{sr(rcC).map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
        </div>
        <div className="card"><p className="label">Age</p>
          <ResponsiveContainer width="100%" height={180}><BarChart data={agD.sort((a,b)=>Number(a.name)-Number(b.name))}><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Bar dataKey="value" radius={[3,3,0,0]} fill="#2C2C2C"/></BarChart></ResponsiveContainer>
        </div>
        <div className="card"><p className="label">Rent brackets</p>
          <ResponsiveContainer width="100%" height={180}><BarChart data={sr(reC)} layout="vertical" margin={{left:100}}><XAxis type="number" tick={{fontSize:10}}/><YAxis type="category" dataKey="name" width={95} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="value" radius={[0,3,3,0]} fill="#6B6B6B"/></BarChart></ResponsiveContainer>
        </div>
        {/* Legal quick ref */}
        <div className="card" style={{gridColumn:"1/-1"}}><p className="label">Legal landscape</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
            {Object.entries(LEGAL).filter(([k])=>pC[k]).map(([k,v],i)=>(
              <div key={k} style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}>
                <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>{k} <span style={{fontWeight:500,color:"#999"}}>({pC[k]})</span></div>
                <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{v.laws.join(" · ")}</div>
                <div style={{fontSize:11,color:"#999",lineHeight:1.5}}>{v.impact}</div>
              </div>))}
          </div>
        </div>
      </div>}

      {/* ═ REGIONAL TAB ═ */}
      {tab==="regional"&&<RegionalTab data={data} rC={rC} pC={pC} pL={pL} pD={sr(pC)} n={n} txts={txts} selR={selR} setSelR={setSelR} ai={ai} aiL={aiL} loadAI={loadAI} fixes={fixes}/>}

      {/* ═ INTEL TAB ═ */}
      {tab==="intel"&&<div>
        <div className="card" style={{marginBottom:14}}>
          <p className="label">Intelligence scanner</p>
          <p style={{fontSize:12,color:"#999",marginBottom:12}}>Searches Reddit, Google News, and Companies House based on identified problems.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            <select value={intR} onChange={e=>setIntR(e.target.value)} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid #E0E0E0",fontFamily:"inherit",fontSize:13}}>
              <option value="">All regions</option>{Object.keys(rC).map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn primary sm" onClick={()=>runScan(intR)} disabled={intL||n===0}>{intL?"Scanning…":"Run scan"}</button>
            {intel?.lastRun&&<span style={{fontSize:11,color:"#999",alignSelf:"center"}}>Last: {new Date(intel.lastRun).toLocaleString()}</span>}
          </div>
        </div>
        {intel?.scans?.length>0&&(()=>{const s=intel.scans[intel.scans.length-1];return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {s.reddit?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">Reddit ({s.reddit.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:350,overflowY:"auto"}}>
              {s.reddit.map((p,i)=>(<div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:12}}>
                <div style={{fontWeight:700,marginBottom:3}}>{(p.title||"").slice(0,100)}</div>
                {p.text&&<div style={{color:"#6B6B6B",marginBottom:4,lineHeight:1.5}}>{p.text.slice(0,150)}{p.text.length>150?"…":""}</div>}
                <div style={{fontSize:10,color:"#999"}}>r/{p.subreddit} · ⬆{p.score} · 💬{p.comments} {p.problem&&<span className="tag" style={{marginLeft:4}}>{p.problem}</span>}</div>
                <a href={p.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>Open →</a>
              </div>))}
            </div>
          </div>}
          {s.news?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">News ({s.news.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {s.news.map((a,i)=>(<div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:12}}>
                <div style={{fontWeight:700,marginBottom:3}}>{(a.title||"").slice(0,100)}</div>
                <div style={{fontSize:10,color:"#999"}}>{a.publisher} · {a.date?new Date(a.date).toLocaleDateString():""}</div>
                <a href={a.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>Read →</a>
              </div>))}
            </div>
          </div>}
          {s.companies?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">Companies House ({s.companies.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {s.companies.map((c,i)=>(<div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:11}}>
                <div style={{fontWeight:700}}>{c.name}</div><div style={{color:"#999"}}>#{c.number} · {c.status}</div>
                <div style={{color:"#AAA",fontSize:10}}>{c.address}</div>
                <a href={c.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>View →</a>
              </div>))}
            </div>
          </div>}
        </div>);})()}
      </div>}

      {/* ═ TOOLS TAB ═ */}
      {tab==="tools"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="card" style={{gridColumn:"1/-1"}}><p className="label">Research notes</p>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",minHeight:180,padding:16,borderRadius:12,border:"1.5px solid #E0E0E0",fontFamily:"'DM Serif Display',serif",fontSize:14,lineHeight:1.7,color:"#1A1A1A",resize:"vertical",outline:"none",background:"transparent"}} placeholder="Write observations, risks, patterns…"/>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button className="btn primary sm" onClick={()=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Research Notes"],[new Date().toISOString()],[""],[notes]]),"Notes");XLSX.writeFile(wb,"Notes_"+new Date().toISOString().split("T")[0]+".xlsx");}}>Export notes</button>
            <span style={{fontSize:11,color:"#999",alignSelf:"center"}}>{notes.length} chars</span>
          </div>
        </div>
        <div className="card"><p className="label">Export</p>
          <p style={{fontSize:12,color:"#999",marginBottom:12}}>Full dataset as structured Excel (6 sheets).</p>
          <button className="btn primary" onClick={()=>toExcel(data,pC,pL,reC,iC,anC)}>📥 Export research data</button>
        </div>
        <div className="card"><p className="label">Data management</p>
          <p style={{fontSize:12,color:"#999",marginBottom:12}}>Permanent deletion. Exports automatically first.</p>
          {!delModal?<button className="btn ghost" onClick={()=>setDelModal(true)} style={{color:"#C0392B",fontSize:12}}>Request data clear</button>
          :<div style={{padding:16,borderRadius:12,border:"1px solid rgba(192,57,43,.15)"}}>
            <p style={{fontWeight:700,fontSize:13,marginBottom:8}}>Enter deletion password</p>
            <input type="password" value={delPin} onChange={e=>{setDelPin(e.target.value);setDelErr(false);}} placeholder="Password" style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #E0E0E0",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:8}}/>
            {delErr&&<p style={{color:"#C0392B",fontSize:12,marginBottom:6}}>Wrong password</p>}
            <div style={{display:"flex",gap:8}}>
              <button className="btn ghost sm" onClick={()=>{setDelModal(false);setDelPin("");}}>Cancel</button>
              <button className="btn primary sm" onClick={()=>{if(delPin===DELETE_PIN){toExcel(data,pC,pL,reC,iC,anC);setTimeout(()=>{onClear();setDelModal(false);setDelPin("");},500);}else{setDelErr(true);setDelPin("");}}} style={{background:"#C0392B"}}>Export & delete</button>
            </div>
          </div>}
        </div>
      </div>}

      </>}
    </div>
  );
}


/* ═══════════ REGIONAL TAB — 3D Map + Ticket System + KPIs ═══════════ */
function RegionalTab({data,rC,pC,pL,pD,n,txts,selR,setSelR,ai,aiL,loadAI,fixes}){
  const mapRef=useRef(null);
  const mapInst=useRef(null);
  const [selProblem,setSelProblem]=useState(null);
  const [tickets,setTickets]=useState([]);

  // Severity colors
  const SEV_COLORS={CRITICAL:"#C0392B",HIGH:"#E67E22",MEDIUM:"#F1C40F",LOW:"#27AE60",POSITIVE:"#2980B9"};
  const probColor=(prob,count)=>{const pct=n>0?(count/n)*100:0;return pct>40?SEV_COLORS.CRITICAL:pct>25?SEV_COLORS.HIGH:pct>10?SEV_COLORS.MEDIUM:SEV_COLORS.LOW;};

  // Dynamic threshold: base 2, +1 per 10 responses
  const threshold=Math.max(2,Math.floor(n/10)+1);

  // Priority score: considers solvability, count, and market opportunity
  const SOLVE_EASE={"Rental affordability":2,"Poor conditions":7,"Landlord issues":5,"Tenure insecurity":3,"Market competition":1,"High upfront costs":6,"Energy & bills":8,"Discrimination":4,"Mental health":3,"Unable to save":2};
  const PROFIT_OPP={"Rental affordability":3,"Poor conditions":8,"Landlord issues":6,"Tenure insecurity":4,"Market competition":5,"High upfront costs":7,"Energy & bills":9,"Discrimination":3,"Mental health":5,"Unable to save":4};

  const calcPriority=(prob,count)=>{
    const ease=SOLVE_EASE[prob]||5;
    const profit=PROFIT_OPP[prob]||5;
    const demand=Math.min((count/Math.max(n,1))*100,100);
    // Priority = weighted: 40% ease of solving + 30% demand + 30% profit opportunity
    return Math.round(ease*4+demand*0.3+profit*3);
  };

  // Generate tickets when problems cross threshold
  useEffect(()=>{
    const t=[];
    Object.entries(pC).forEach(([prob,count])=>{
      const priority=calcPriority(prob,count);
      const pct=n>0?((count/n)*100).toFixed(1):0;
      const severity=pct>40?"CRITICAL":pct>25?"HIGH":pct>10?"MEDIUM":"LOW";
      const meetsThreshold=count>=threshold;
      // Find related solutions from survey
      const solutions=fixes.filter(f=>txts.find(tx=>tx.area===f.area&&(tx.problems||[]).includes(prob))).map(f=>f.text).slice(0,3);
      // Find regions where this problem appears
      const regions=Object.entries(pL).filter(([,probs])=>probs[prob]).map(([loc,probs])=>({loc,count:probs[prob]})).sort((a,b)=>b.count-a.count);
      t.push({prob,count,pct,severity,priority,meetsThreshold,solutions,regions,ease:SOLVE_EASE[prob]||5,profit:PROFIT_OPP[prob]||5});
    });
    t.sort((a,b)=>b.priority-a.priority);
    setTickets(t);
  },[data]);


  // Initialize Leaflet map
  useEffect(()=>{
    if(!mapRef.current||mapInst.current)return;
    const map=L.map(mapRef.current,{zoomControl:true,scrollWheelZoom:true}).setView([54.5,-2],5.5);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{
      attribution:"OpenStreetMap",maxZoom:18,subdomains:"abcd"
    }).addTo(map);

    // Add region markers
    Object.entries(RMETA).forEach(([region,meta])=>{
      if(!meta.lat)return;
      const count=rC[region]||0;
      if(count===0)return;
      const regionProbs=pL[region]||{};
      const topProb=Object.entries(regionProbs).sort((a,b)=>b[1]-a[1])[0];
      const severity=count>n*0.3?"CRITICAL":count>n*0.15?"HIGH":count>n*0.05?"MEDIUM":"LOW";
      const color=SEV_COLORS[severity];
      const radius=Math.max(12,Math.min(35,count*3));

      const marker=L.circleMarker([meta.lat,meta.lng],{
        radius,color,fillColor:color,fillOpacity:0.35,weight:2
      }).addTo(map);

      marker.bindPopup(`<div style="font-family:Nunito,sans-serif;min-width:180px">
        <b style="font-size:14px">${region}</b><br/>
        <span style="font-size:11px;color:#666">${count} responses · ${severity}</span><br/>
        ${topProb?`<span style="font-size:12px;margin-top:4px;display:block">Top: <b>${topProb[0]}</b> (${topProb[1]})</span>`:""}
        <span style="font-size:10px;color:#999;display:block;margin-top:4px">${meta.council}</span>
      </div>`);

      marker.on("click",()=>setSelR(region));
    });

    // Add area-level markers (smaller)
    Object.entries(pL).forEach(([area,probs])=>{
      if(RMETA[area])return; // Skip regions, only do areas
      // Find parent region for coordinates
      let parentRegion=null;
      for(const [reg,areas] of Object.entries(UK)){if(areas.includes(area)){parentRegion=reg;break;}}
      if(!parentRegion||!RMETA[parentRegion])return;
      const base=RMETA[parentRegion];
      // Offset slightly from region center
      const hash=area.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
      const lat=base.lat+(hash%7-3)*0.15;
      const lng=base.lng+((hash*7)%5-2)*0.2;
      const total=Object.values(probs).reduce((s,v)=>s+v,0);
      const topP=Object.entries(probs).sort((a,b)=>b[1]-a[1])[0];
      const col=probColor(topP?.[0],topP?.[1]||0);

      L.circleMarker([lat,lng],{radius:Math.max(6,total*2),color:col,fillColor:col,fillOpacity:0.25,weight:1.5})
        .addTo(map)
        .bindPopup(`<div style="font-family:Nunito,sans-serif"><b>${area}</b><br/>${Object.entries(probs).map(([p,c])=>`${p}: ${c}`).join("<br/>")}</div>`);
    });

    mapInst.current=map;
    return()=>{map.remove();mapInst.current=null;};
  },[data]);


  // Get reviews for selected problem in selected region
  const getReviews=(prob,region)=>{
    return txts.filter(t=>(t.problems||[]).includes(prob)&&(region?t.area===region||Object.keys(UK).find(k=>UK[k].includes(t.area))===region:true)).slice(0,8);
  };

  return(<div>
    {/* COLOR LEGEND */}
    <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <span style={{fontSize:11,fontWeight:700,color:"#999"}}>SEVERITY:</span>
      {Object.entries(SEV_COLORS).map(([k,v])=>(<span key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
        <span style={{width:10,height:10,borderRadius:"50%",background:v,display:"inline-block"}}/>{k}
      </span>))}
      <span style={{fontSize:11,color:"#999",marginLeft:8}}>Threshold: {threshold} responses to raise ticket</span>
    </div>

    {/* MAP */}
    <div className="card" style={{padding:0,overflow:"hidden",marginBottom:14}}>
      <div ref={mapRef} style={{height:420,width:"100%",borderRadius:16}}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {/* REGION DETAIL */}
      {selR&&<div className="card" style={{gridColumn:"1/-1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <h3 className="serif" style={{fontSize:20,marginBottom:4}}>{selR}</h3>
            <div style={{fontSize:12,color:"#6B6B6B"}}>{RMETA[selR]?.council} · {RMETA[selR]?.news?.join(", ")}</div>
          </div>
          <button className="btn ghost sm" onClick={()=>setSelR(null)}>✕</button>
        </div>
        {pL[selR]&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
          {Object.entries(pL[selR]).sort((a,b)=>b[1]-a[1]).map(([p,c])=>{
            const col=probColor(p,c);
            return(<button key={p} className={`chip ${selProblem===p?"on":""}`} onClick={()=>setSelProblem(selProblem===p?null:p)}
              style={{borderColor:col,color:selProblem===p?"#fff":col,background:selProblem===p?col:"transparent"}}>{p} ({c})</button>);
          })}
        </div>}
        {/* AI Analysis */}
        {aiL&&!ai[selR]?<p style={{fontSize:12,color:"#999"}}>Loading analysis…</p>:ai[selR]&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12,lineHeight:1.6,marginBottom:14}}>
            <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>📰 Local context</b><br/>{ai[selR].news}</div>
            <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>🏛️ Council</b><br/>{ai[selR].council}</div>
            <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>🔗 Ecosystem</b><br/>{ai[selR].ecosystem}</div>
            <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>✅</b> {ai[selR].positive}<br/><b>⚠️</b> {ai[selR].negative}<br/><b>Severity: {(ai[selR].severity||"").toUpperCase()}</b></div>
          </div>
        )}
        {/* Reviews for selected problem */}
        {selProblem&&<div style={{borderTop:"1px solid rgba(0,0,0,.06)",paddingTop:12}}>
          <p className="label">Responses mentioning "{selProblem}" in {selR}</p>
          <div style={{maxHeight:300,overflowY:"auto"}}>
            {getReviews(selProblem,selR).map((r,i)=>(
              <div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",marginBottom:6,fontSize:12}}>
                <div className="serif" style={{fontStyle:"italic",lineHeight:1.5}}>"{r.text}"</div>
                {r.positive&&<div style={{color:"#27AE60",marginTop:4,fontSize:11}}>✅ {r.positive}</div>}
                <div style={{color:"#999",fontSize:10,marginTop:4}}>Age {r.age} · {r.employment} · {r.area} · {r.rent}</div>
              </div>
            ))}
            {getReviews(selProblem,selR).length===0&&<p style={{color:"#999",fontSize:12}}>No direct quotes for this problem in this region yet.</p>}
          </div>
        </div>}
      </div>}


      {/* PROBLEM TICKETS — Auto-generated workflow */}
      <div className="card" style={{gridColumn:"1/-1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <p className="label" style={{marginBottom:0}}>Problem tickets ({tickets.filter(t=>t.meetsThreshold).length} active / {tickets.length} total)</p>
          <span style={{fontSize:10,color:"#999"}}>Threshold: {threshold} responses · Auto-raises when crossed</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {tickets.map((t,i)=>(
            <div key={t.prob} style={{padding:14,borderRadius:10,border:`1.5px solid ${t.meetsThreshold?probColor(t.prob,t.count):"#E0E0E0"}`,opacity:t.meetsThreshold?1:0.5,background:t.meetsThreshold?"#fff":"#FAFAFA"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:probColor(t.prob,t.count)}}/>
                  <span style={{fontWeight:700,fontSize:13}}>{t.prob}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,
                    background:t.severity==="CRITICAL"?"#C0392B":t.severity==="HIGH"?"#E67E22":t.severity==="MEDIUM"?"#F1C40F":"#E0E0E0",
                    color:t.severity==="LOW"?"#555":"#fff"}}>{t.severity}</span>
                  {t.meetsThreshold&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:"#1A1A1A",color:"#fff"}}>ACTIVE TICKET</span>}
                  {!t.meetsThreshold&&<span style={{fontSize:10,color:"#999"}}>{t.count}/{threshold} to activate</span>}
                </div>
                <span style={{fontSize:11,fontWeight:700}}>Priority: {t.priority}</span>
              </div>
              {/* KPIs row */}
              <div style={{display:"flex",gap:12,marginBottom:6,flexWrap:"wrap"}}>
                <span style={{fontSize:10,color:"#555"}}><b>{t.count}</b> reports ({t.pct}%)</span>
                <span style={{fontSize:10,color:"#555"}}>Solvability: <b>{t.ease}/10</b></span>
                <span style={{fontSize:10,color:"#555"}}>Market opp: <b>{t.profit}/10</b></span>
                <span style={{fontSize:10,color:"#555"}}>Regions: <b>{t.regions.length}</b></span>
              </div>
              {/* Where it appears */}
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                {t.regions.slice(0,6).map(r=>(<span key={r.loc} style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"rgba(0,0,0,.04)"}}>{r.loc} ({r.count})</span>))}
              </div>
              {/* Proposed solutions from survey */}
              {t.solutions.length>0&&<div style={{marginTop:6,paddingTop:6,borderTop:"1px solid rgba(0,0,0,.04)"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#27AE60"}}>PROPOSED SOLUTIONS:</span>
                {t.solutions.map((s,j)=><div key={j} style={{fontSize:11,color:"#555",marginTop:2}}>• {s.slice(0,120)}</div>)}
              </div>}
            </div>
          ))}
        </div>
      </div>

      {/* ALL LOCATIONS */}
      <div className="card" style={{gridColumn:"1/-1"}}><p className="label">All locations</p>
        <div style={{maxHeight:350,overflowY:"auto"}}>{Object.entries(pL).sort((a,b)=>Object.values(b[1]).reduce((s,v)=>s+v,0)-Object.values(a[1]).reduce((s,v)=>s+v,0)).map(([loc,probs])=>(
          <div key={loc} style={{marginBottom:10}}><span style={{fontWeight:700,fontSize:13}}>{loc}</span>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:3}}>
              {Object.entries(probs).sort((a,b)=>b[1]-a[1]).map(([p,c])=>{
                const col=probColor(p,c);
                return(<span key={p} style={{fontSize:10,padding:"3px 10px",borderRadius:100,border:`1px solid ${col}40`,color:col,fontWeight:600}}>{p} ({c})</span>);
              })}
            </div>
          </div>))}</div>
      </div>
    </div>
  </div>);
}


/* ═ COMPONENTS ═ */
function Chips({items,sel,set}){return(<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{items.map(v=>(<button key={v} className={`chip ${sel===v?"on":""}`} onClick={()=>set(v)}>{v}</button>))}</div>)}
function Btns({bk,nx,dis}){return(<div style={{display:"flex",gap:10,marginTop:20}}>{bk&&<button className="btn ghost" onClick={bk}>← Back</button>}<button className="btn primary" onClick={nx} disabled={dis} style={{flex:1}}>Continue</button></div>)}
function Stat({l,v}){return(<div style={{flex:1,minWidth:120,padding:"12px 16px",borderRadius:12,border:"1px solid rgba(0,0,0,.06)",background:"#fff"}}><div style={{fontSize:9,fontWeight:700,color:"#999",letterSpacing:".04em",textTransform:"uppercase",marginBottom:4}}>{l}</div><div className="serif" style={{fontSize:16}}>{v}</div></div>)}

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}
.serif{font-family:'DM Serif Display',serif;font-weight:400}
.card{background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,.05);padding:28px 24px}
.label{font-size:11px;font-weight:700;color:#999;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px}
.q{font-size:17px;line-height:1.4;margin-bottom:14px}
.chip{display:inline-flex;align-items:center;padding:10px 18px;border-radius:100px;border:1.5px solid #E0E0E0;background:#fff;color:#555;font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .12s;user-select:none}
.chip:hover{border-color:#1A1A1A;color:#1A1A1A}
.chip.on{border-color:#1A1A1A;background:#1A1A1A;color:#fff}
.chip.full{width:100%;justify-content:flex-start;border-radius:12px}
.tag{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;background:rgba(0,0,0,.05);color:#555;display:inline-block}
.ta{width:100%;min-height:100px;padding:16px;border-radius:14px;border:1.5px solid #E0E0E0;background:transparent;font-family:'DM Serif Display',serif;font-size:15px;line-height:1.6;color:#1A1A1A;resize:vertical;outline:none}
.ta:focus{border-color:#1A1A1A}
.ta::placeholder{color:#CCC;font-style:italic}
.btn{padding:14px 28px;border-radius:100px;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn.primary{background:#1A1A1A;color:#fff}.btn.primary:hover{background:#000}.btn.primary:disabled{background:#E0E0E0;color:#999;cursor:not-allowed}
.btn.ghost{background:transparent;color:#555;border:1.5px solid #E0E0E0}.btn.ghost:hover{border-color:#1A1A1A}
.btn.sm{padding:8px 16px;font-size:12px}
@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade{animation:fi .3s ease forwards}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.08);border-radius:2px}
`;
