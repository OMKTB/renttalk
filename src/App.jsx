import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";

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
  "London":{council:"Greater London Authority",news:["Evening Standard","BBC London"]},
  "South East":{council:"Various County Councils",news:["BBC South East","The Argus"]},
  "South West":{council:"Various County Councils",news:["BBC West","Bristol Post"]},
  "East of England":{council:"Various County Councils",news:["BBC East","Cambridge News"]},
  "West Midlands":{council:"West Midlands Combined Authority",news:["BBC Midlands","Birmingham Mail"]},
  "East Midlands":{council:"Various County Councils",news:["BBC East Midlands","Nottingham Post"]},
  "North West":{council:"Greater Manchester Combined Authority",news:["BBC North West","MEN"]},
  "North East":{council:"North East Combined Authority",news:["BBC North East","Chronicle Live"]},
  "Yorkshire & Humber":{council:"Various Councils",news:["BBC Yorkshire","Yorkshire Post"]},
  "Scotland":{council:"Scottish Government",news:["BBC Scotland","The Scotsman"]},
  "Wales":{council:"Welsh Government / Senedd",news:["BBC Wales","Wales Online"]},
  "Northern Ireland":{council:"NI Executive",news:["BBC NI","Belfast Telegraph"]}
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
function Survey({onAdmin}){
  const [s,setS]=useState(0);
  const [d,setD]=useState({
    age:"",employment:"",situation:"",region:"",area:"",pastAreas:[],
    propertyType:"",bedrooms:"",tenancyLength:"",howFound:"",
    rent:"",pctIncome:"",depositIssue:"",benefits:"",
    freeText:"",positive:"",problems:[],
    conditionRating:5,landlordRating:5,
    aiQuestions:[],answers:{},
    proposedFix:"",rentControl:"",brokenRating:5
  });
  const [sub,setSub]=useState(false);const [done,setDone]=useState(false);
  const [err,setErr]=useState(false);const [aiLoad,setAiLoad]=useState(false);
  const u=(k,v)=>setD(p=>({...p,[k]:v}));const nx=()=>setS(x=>x+1);const bk=()=>setS(x=>x-1);

  // AI-personalised questions based on region + problems
  const generateAIQuestions=async()=>{
    setAiLoad(true);
    const pr=analyse(d.freeText);u("problems",pr);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
          messages:[{role:"user",content:`You are a UK housing researcher creating personalised follow-up questions for a renter survey.

The respondent is: age ${d.age}, ${d.employment}, living in ${d.area} (${d.region}), ${d.situation}, paying ${d.rent} (${d.pctIncome} of income), ${d.propertyType}, tenancy ${d.tenancyLength}.

Their main challenges: "${d.freeText}"
Identified problems: ${pr.join(", ")}
${d.positive?"Positives they mentioned: "+d.positive:""}

Generate exactly 4 follow-up questions that are SPECIFIC to their region, situation and problems. Each question should help identify root causes and actionable data.

Return ONLY valid JSON array:
[{"id":"ai1","q":"question text","o":["option1","option2","option3","option4"]},...]

Make questions conversational, empathetic, specific to ${d.region}. Reference local context (e.g. local councils, transport links, university towns, local market conditions).`}]})});
      const data=await r.json();
      const txt=data.content?.filter(c=>c.type==="text").map(c=>c.text).join("");
      const qs=JSON.parse(txt.replace(/```json|```/g,"").trim());
      u("aiQuestions",qs);
    }catch(e){
      // Fallback: generate contextual questions without AI
      const qs=[];
      if(pr.includes("Rental affordability"))qs.push({id:"f1",q:`In ${d.region}, how is affordability affecting your daily life?`,o:["Skipping meals or essentials","Can't socialise anymore","Moved further from work","Considering leaving the area"]});
      if(pr.includes("Poor conditions"))qs.push({id:"f2",q:"Have you reported the condition issues?",o:["Yes, landlord fixed it","Yes, nothing happened","No, worried about eviction","Reported to council"]});
      if(pr.includes("Landlord issues"))qs.push({id:"f3",q:"What best describes your landlord situation?",o:["Completely unresponsive","Hostile or threatening","Enters without notice","Withholds deposit"]});
      if(pr.includes("Tenure insecurity"))qs.push({id:"f4",q:"What's driving the insecurity?",o:["Received eviction notice","Landlord selling up","Rolling monthly tenancy","Fear of retaliatory eviction"]});
      while(qs.length<3)qs.push({id:"fb"+qs.length,q:"How severely is this affecting your wellbeing?",o:["Minor inconvenience","Noticeable stress","Significant impact","Severely affecting me"]});
      u("aiQuestions",qs.slice(0,4));
    }
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
    <p style={{color:"#6B6B6B",fontSize:15,lineHeight:1.7}}>Your response has been recorded and will shape real research into UK rental challenges.</p>
  </div></>);

  const tot=8,pct=((s+1)/tot)*100;
  return(<><Nav/><div style={{maxWidth:500,margin:"0 auto",padding:"24px 20px 100px"}}>
    <div style={{marginBottom:28}}><div style={{height:2,borderRadius:1,background:"rgba(0,0,0,.06)"}}><div style={{height:"100%",borderRadius:1,background:"#1A1A1A",width:`${pct}%`,transition:"width .3s"}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:11,fontWeight:700,letterSpacing:".04em"}}>{s+1} of {tot}</span><span style={{fontSize:11,color:"rgba(0,0,0,.25)"}}>{Math.round(pct)}%</span></div></div>

    {/* STEP 0: Welcome */}
    {s===0&&<div className="fade"><div className="card" style={{textAlign:"center",padding:"44px 28px"}}>
      <h1 className="serif" style={{fontSize:26,lineHeight:1.3,marginBottom:12}}>Your renting experience<br/>matters to us</h1>
      <p style={{color:"#6B6B6B",fontSize:14,lineHeight:1.7,maxWidth:380,margin:"0 auto 8px"}}>An independent study into rental challenges facing 18–30 year olds across the UK. Anonymous. ~3 minutes.</p>
      <p style={{fontSize:12,color:"rgba(0,0,0,.2)",marginBottom:28}}>Questions adapt to your area and situation</p>
      <button className="btn primary" onClick={nx} style={{width:"100%"}}>Let's go</button>
    </div></div>}

    {/* STEP 1: About you */}
    {s===1&&<div className="fade"><div className="card">
      <p className="label">About you</p>
      <h2 className="serif q">How old are you?</h2>
      <Chips items={Array.from({length:13},(_,i)=>String(i+18))} sel={d.age} set={v=>u("age",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>What's your employment status?</h2>
      <Chips items={["Full-time employed","Part-time employed","Self-employed","Student","Unemployed","Zero-hours contract","Apprentice","Carer"]} sel={d.employment} set={v=>u("employment",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>What's your current living situation?</h2>
      <Chips items={["Renting alone","Renting with partner","House/flat share","Social housing","Student accommodation","Living with family","Lodger","Temporary/hostel"]} sel={d.situation} set={v=>u("situation",v)}/>
    </div><Btns bk={null} nx={nx} dis={!d.age||!d.employment||!d.situation}/></div>}

    {/* STEP 2: Location */}
    {s===2&&<div className="fade"><div className="card">
      <p className="label">Where you rent</p>
      <h2 className="serif q">Which region are you in?</h2>
      <Chips items={Object.keys(UK)} sel={d.region} set={v=>{u("region",v);u("area","");}}/>
      {d.region&&<><h2 className="serif q" style={{marginTop:20}}>Which area?</h2>
      <Chips items={UK[d.region]} sel={d.area} set={v=>u("area",v)}/></>}
      <h2 className="serif q" style={{marginTop:22}}>Rented anywhere else before? <span style={{fontWeight:400,color:"#999",fontSize:13}}>(select all)</span></h2>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {Object.entries(UK).flatMap(([reg,areas])=>areas.filter(a=>a!==d.area).map(a=>({a,reg}))).slice(0,40).map(({a})=>(
          <button key={a} className={`chip ${d.pastAreas.includes(a)?"on":""}`} style={{fontSize:12,padding:"7px 14px"}}
            onClick={()=>u("pastAreas",d.pastAreas.includes(a)?d.pastAreas.filter(x=>x!==a):[...d.pastAreas,a])}>{a}</button>
        ))}
      </div>
    </div><Btns bk={bk} nx={nx} dis={!d.region||!d.area}/></div>}

    {/* STEP 3: Your property */}
    {s===3&&<div className="fade"><div className="card">
      <p className="label">Your property</p>
      <h2 className="serif q">What type of property?</h2>
      <Chips items={["Studio","1-bed flat","2-bed flat","3+ bed flat","Terraced house","Semi-detached","Detached","HMO / shared house","Bedsit","Room in family home"]} sel={d.propertyType} set={v=>u("propertyType",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>How long have you been in this tenancy?</h2>
      <Chips items={["Under 3 months","3–6 months","6–12 months","1–2 years","2–5 years","5+ years"]} sel={d.tenancyLength} set={v=>u("tenancyLength",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>How did you find it?</h2>
      <Chips items={["Rightmove/Zoopla","Letting agent","SpareRoom","Facebook/Gumtree","Word of mouth","Council allocation","University","Other"]} sel={d.howFound} set={v=>u("howFound",v)}/>
    </div><Btns bk={bk} nx={nx} dis={!d.propertyType||!d.tenancyLength||!d.howFound}/></div>}

    {/* STEP 4: Financial */}
    {s===4&&<div className="fade"><div className="card">
      <p className="label">The financial picture</p>
      <h2 className="serif q">Monthly rent?</h2>
      <Chips items={["Under £400","£400–£600","£600–£800","£800–£1,000","£1,000–£1,500","£1,500–£2,000","£2,000+","Prefer not to say"]} sel={d.rent} set={v=>u("rent",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>What share of income goes to rent?</h2>
      <Chips items={["Under 20%","20–30%","30–40%","40–50%","Over 50%","Not sure"]} sel={d.pctIncome} set={v=>u("pctIncome",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>Any deposit difficulties?</h2>
      <Chips items={["No issues","Struggled to afford it","Deposit not protected","Previous deposit withheld","Needed guarantor","Paid multiple months upfront","N/A"]} sel={d.depositIssue} set={v=>u("depositIssue",v)}/>
      <h2 className="serif q" style={{marginTop:22}}>Receiving any housing support?</h2>
      <Chips items={["No benefits","Universal Credit (housing element)","Housing Benefit","Local Housing Allowance","Discretionary Housing Payment","Other support","Prefer not to say"]} sel={d.benefits} set={v=>u("benefits",v)}/>
    </div><Btns bk={bk} nx={nx} dis={!d.rent||!d.pctIncome||!d.depositIssue||!d.benefits}/></div>}

    {/* STEP 5: Challenges + condition/landlord ratings */}
    {s===5&&<div className="fade"><div className="card">
      <p className="label">Your experience</p>
      <h2 className="serif q">What challenges do you face renting?</h2>
      <p style={{color:"#6B6B6B",fontSize:13,marginBottom:14}}>Be specific — affordability, conditions, landlords, agents, competition, discrimination, anything.</p>
      <textarea className="ta" value={d.freeText} onChange={e=>u("freeText",e.target.value)} placeholder="Describe what's been difficult…" style={{minHeight:140}}/>
      <h2 className="serif q" style={{marginTop:22}}>Anything positive? <span style={{fontWeight:400,color:"#999",fontSize:13}}>(optional but valuable)</span></h2>
      <textarea className="ta" value={d.positive} onChange={e=>u("positive",e.target.value)} placeholder="Good landlord, nice neighbours, flexible lease…" style={{minHeight:80}}/>
      <h2 className="serif q" style={{marginTop:22}}>Rate your property's condition</h2>
      <input type="range" min={1} max={10} value={d.conditionRating} onChange={e=>u("conditionRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999",marginTop:4}}><span>1 = Terrible</span><span className="serif" style={{fontSize:22,color:"#1A1A1A"}}>{d.conditionRating}</span><span>10 = Excellent</span></div>
      <h2 className="serif q" style={{marginTop:22}}>Rate your landlord/agent</h2>
      <input type="range" min={1} max={10} value={d.landlordRating} onChange={e=>u("landlordRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999",marginTop:4}}><span>1 = Terrible</span><span className="serif" style={{fontSize:22,color:"#1A1A1A"}}>{d.landlordRating}</span><span>10 = Excellent</span></div>
    </div><div style={{display:"flex",gap:10,marginTop:20}}><button className="btn ghost" onClick={bk}>← Back</button>
      <button className="btn primary" onClick={generateAIQuestions} disabled={d.freeText.trim().length<10||aiLoad} style={{flex:1}}>{aiLoad?"Personalising questions…":"Continue"}</button>
    </div></div>}

    {/* STEP 6: AI-personalised follow-ups */}
    {s===6&&<div className="fade">
      <div className="card" style={{marginBottom:12}}>
        <p className="label">Based on your situation in {d.area}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{d.problems.map((p,i)=>(<span key={i} className="tag">{p}</span>))}</div>
      </div>
      {(d.aiQuestions||[]).map((q,qi)=>(<div key={q.id} className="card" style={{marginBottom:10}}>
        <p className="label">Question {qi+1} of {d.aiQuestions.length}</p>
        <h2 className="serif q">{q.q}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{q.o.map(o=>(<button key={o} className={`chip full ${d.answers[q.id]===o?"on":""}`} onClick={()=>u("answers",{...d.answers,[q.id]:o})}>{o}</button>))}</div>
      </div>))}
    <Btns bk={bk} nx={nx} dis={Object.keys(d.answers).length<(d.aiQuestions||[]).length}/></div>}

    {/* STEP 7: Solutions + policy + rating */}
    {s===7&&<div className="fade">
      <div className="card" style={{marginBottom:12}}>
        <p className="label">Looking forward</p>
        <h2 className="serif q">What changes would genuinely improve things?</h2>
        <textarea className="ta" value={d.proposedFix} onChange={e=>u("proposedFix",e.target.value)} placeholder="Rent caps, better inspections, longer tenancies, more social housing…"/>
      </div>
      <div className="card" style={{marginBottom:12}}>
        <h2 className="serif q">Do you support government rent controls?</h2>
        <Chips items={["Strongly support","Somewhat support","Neutral","Somewhat oppose","Strongly oppose"]} sel={d.rentControl} set={v=>u("rentControl",v)}/>
      </div>
      <div className="card">
        <h2 className="serif q">Rate the UK rental system for your age group</h2>
        <input type="range" min={1} max={10} value={d.brokenRating} onChange={e=>u("brokenRating",Number(e.target.value))} style={{width:"100%",accentColor:"#1A1A1A"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#999",marginTop:4}}><span>1 = Fine</span><span className="serif" style={{fontSize:26,color:"#1A1A1A"}}>{d.brokenRating}</span><span>10 = Broken</span></div>
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
    if(r.freeText)txts.push({text:r.freeText,positive:r.positive,area:r.area||r.region,age:r.age,rent:r.rent,problems:r.problems,situation:r.situation,employment:r.employment,pctIncome:r.pctIncome,answers:r.answers,pastAreas:r.pastAreas,propertyType:r.propertyType,tenancyLength:r.tenancyLength,conditionRating:r.conditionRating,landlordRating:r.landlordRating,benefits:r.benefits,depositIssue:r.depositIssue});
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
                <span style={{fontSize:12,fontWeight:700}}>Age {r.age} · {r.employment} · {r.situation}</span>
                <span style={{fontSize:11,color:"#999"}}>📍 {r.area} · {r.propertyType} · {r.rent} · {r.pctIncome}</span>
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
      {tab==="regional"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div className="card" style={{gridColumn:"1/-1"}}>
            <p className="label">Select a region</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
              {Object.keys(rC).map(r=>(<button key={r} className={`chip ${selR===r?"on":""}`} onClick={()=>setSelR(selR===r?null:r)}>{r} ({rC[r]})</button>))}
            </div>
            {selR&&<div style={{borderTop:"1px solid rgba(0,0,0,.06)",paddingTop:16}}>
              <h3 className="serif" style={{fontSize:18,marginBottom:6}}>📍 {selR}</h3>
              <div style={{fontSize:12,color:"#6B6B6B",marginBottom:10}}>Council: {RMETA[selR]?.council} · News: {RMETA[selR]?.news?.join(", ")}</div>
              {pL[selR]&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>
                {Object.entries(pL[selR]).sort((a,b)=>b[1]-a[1]).map(([p,c],i)=>(<span key={p} className="tag">{p} ({c})</span>))}
              </div>}
              {aiL&&!ai[selR]?<p style={{fontSize:12,color:"#999"}}>Loading analysis…</p>:ai[selR]&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12,lineHeight:1.6}}>
                  <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>📰 Local context</b><br/>{ai[selR].news}</div>
                  <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>🏛️ Council</b><br/>{ai[selR].council}</div>
                  <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}><b>🔗 Ecosystem</b><br/>{ai[selR].ecosystem}</div>
                  <div style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}>
                    <b>✅</b> {ai[selR].positive}<br/><b>⚠️</b> {ai[selR].negative}<br/>
                    <span style={{fontWeight:700,marginTop:6,display:"inline-block"}}>Severity: {(ai[selR].severity||"").toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>}
          </div>
          {/* Problems by location */}
          <div className="card" style={{gridColumn:"1/-1"}}><p className="label">All locations</p>
            <div style={{maxHeight:400,overflowY:"auto"}}>{Object.entries(pL).sort((a,b)=>Object.values(b[1]).reduce((s,v)=>s+v,0)-Object.values(a[1]).reduce((s,v)=>s+v,0)).map(([loc,probs])=>(
              <div key={loc} style={{marginBottom:12}}><span style={{fontWeight:700,fontSize:13}}>{loc}</span>
                <span style={{fontSize:10,color:"#999",marginLeft:8}}>{RMETA[loc]?.council||""}</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{Object.entries(probs).sort((a,b)=>b[1]-a[1]).map(([p,c])=>(<span key={p} className="tag">{p} ({c})</span>))}</div>
              </div>))}</div>
          </div>
        </div>
      </div>}

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
