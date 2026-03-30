import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const ADMIN_PIN = "zubife6ezklm5nthmalu78gytklm3shan7nekomo";
const DELETE_PIN = "zbekbermraaaaaaatbatshufut3alm9";
const P = ["#2C2C2C","#6B6B6B","#999","#B5B5B5","#D4D4D4","#8B8B8B","#555","#777","#AAA","#CCC"];
const FUNC = "/.netlify/functions/data";
const BLOB = "https://jsonblob.com/api/jsonBlob/019d4029-e73b-7e5f-9d5a-f4c1958c41b9";
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
  
  // === KNOWN PATTERN MATCHING (context-aware) ===
  // Each rule requires the keyword in a meaningful context, not just presence
  
  // AFFORDABILITY — specifically about rent being too high relative to income
  if(/(?:rent|afford|expens|price|costly).*(?:high|too|much|increase|rise|hike|struggle|can't|cannot|barely|squeez)/i.test(t))pr.push('Rental affordability');
  if(/rent.*(?:too|very|incredibly|ridiculously|insanely).*(?:expensive|high|much)/i.test(t)&&!pr.includes('Rental affordability'))pr.push('Rental affordability');
  if(/(?:can't|cannot|barely|hardly|struggle to).*(?:afford|pay|cover).*(?:rent|bill)/i.test(t)&&!pr.includes('Rental affordability'))pr.push('Rental affordability');
  
  // POOR CONDITIONS — physical state of property
  if(/damp|mould|mold|leak|rot|pest|mice|rat|cockroach|filth|crumbl|crack|broken.*(?:window|door|boiler|heater|pipe|roof|wall|floor)|uninhabit|condemn|unsafe.*(?:propert|flat|house|home)|infest/i.test(t))pr.push('Poor conditions');
  
  // LANDLORD ISSUES — landlord behaviour specifically
  if(/landlord.*(?:ignor|unresponsiv|refuse|won't|never|doesn't|difficult|hostile|threaten|harass|enter|bully|rude|aggressive)/i.test(t))pr.push('Landlord issues');
  
  // LETTING AGENCY — agent-specific problems
  if(/(?:agent|agency|letting).*(?:ignor|unresponsiv|useless|terrible|awful|rude|fee|scam|dishonest)/i.test(t))pr.push('Letting agency issues');
  
  // CONTRACTOR/MAINTENANCE — getting repairs done
  if(/contractor|repair.*(?:hard|difficult|slow|wait|month|week|delay|impossible|ages|forever)/i.test(t))pr.push('Contractor/maintenance access');
  if(/(?:hard|difficult|impossible|can't|cannot).*(?:find|get|book).*(?:contractor|plumber|electrician|repair|tradesperson|builder)/i.test(t)&&!pr.includes('Contractor/maintenance access'))pr.push('Contractor/maintenance access');
  if(/(?:repair|fix|maintenance|service).*(?:slow|delay|wait|never|months|ages|forever)/i.test(t)&&!pr.includes('Contractor/maintenance access'))pr.push('Contractor/maintenance access');
  
  // TENURE INSECURITY
  if(/evict|section 21|no.fault|notice.*(?:leave|quit|vacate)|insecur.*tenan|fear.*(?:losing|lose).*home|selling.*(?:property|flat|house)/i.test(t))pr.push('Tenure insecurity');
  
  // MARKET COMPETITION
  if(/(?:compet|bid|bidding|outbid|dozens|queue|fight|scramble).*(?:view|flat|property|rental|place)/i.test(t))pr.push('Market competition');
  if(/(?:hard|difficult|impossible|nightmare).*(?:find|finding|get|search).*(?:flat|property|place|rental|home|room)/i.test(t)&&!pr.includes('Market competition'))pr.push('Market competition');
  if(/(?:applied|rejected|turned down).*(?:flat|propert|place|room)/i.test(t)&&!pr.includes('Market competition'))pr.push('Market competition');
  
  // UPFRONT COSTS vs UNABLE TO SAVE
  if(/(?:can't|cannot|can not|unable|impossible).*(?:save|saving)/i.test(t))pr.push('Unable to save/build future');
  if(/(?:deposit|upfront|advance|guarantor|months? upfront|6 months|pay.*advance)/i.test(t)&&!/(?:can't|cannot|can not).*save/i.test(t))pr.push('High upfront costs');
  
  // ENERGY & BILLS
  if(/(?:energy|electric|gas|heating|insulation|epc|cold|freezing).*(?:bill|cost|expensive|high|poor|terrible|single glaz)/i.test(t))pr.push('Energy & bills');
  if(/(?:bill|cost).*(?:energy|electric|gas|heating)/i.test(t)&&!pr.includes('Energy & bills'))pr.push('Energy & bills');
  
  // DISCRIMINATION
  if(/discriminat|no dss|won't.*(?:rent|let).*(?:benefit|student|foreign|international)|refused.*(?:because|due)/i.test(t))pr.push('Discrimination');
  if(/(?:reject|refused|turned down).*(?:benefit|nationality|race|age|student|immigrant|visa)/i.test(t)&&!pr.includes('Discrimination'))pr.push('Discrimination');
  
  // MENTAL HEALTH
  if(/(?:mental|stress|anxiety|depress|wellbeing|health).*(?:impact|affect|toll|suffer|struggle)/i.test(t))pr.push('Mental health impact');
  if(/(?:trapped|hopeless|desperate|overwhelm|breaking point|can't cope)/i.test(t)&&!pr.includes('Mental health impact'))pr.push('Mental health impact');
  
  // PET POLICIES
  if(/no.*pet|pet.*(?:policy|restrict|ban|not allowed|can't have)/i.test(t))pr.push('No-pet policies');
  
  // HOUSING SUPPLY
  if(/(?:no|lack|shortage|limited|scarce).*(?:housing|property|properties|supply|stock|option|choice)/i.test(t))pr.push('Housing supply concerns');
  
  // PROPERTY MANAGEMENT
  if(/(?:manag|hmo|shared).*(?:fail|terrible|awful|neglect|useless|poor|bad)/i.test(t))pr.push('Property management failures');
  if(/(?:clean|cleanliness|communal|shared).*(?:terrible|awful|filthy|disgusting|never|poor)/i.test(t)&&!pr.includes('Property management failures'))pr.push('Property management failures');
  
  // OVERCROWDING
  if(/(?:overcrowd|too many|cramped|tiny|small).*(?:room|space|people|person|tenant|flatmate)/i.test(t))pr.push('Overcrowding');
  
  // NOISE / NEIGHBOURS
  if(/(?:noise|noisy|loud|neighbours?[^h]|neighbors?[^h]|party|parties|antisocial|anti.social)/i.test(t))pr.push('Noise/neighbour issues');
  
  // COMMUTE / LOCATION TRADE-OFF
  if(/(?:commut|travel|transport|far from|moved further|long journey)/i.test(t))pr.push('Commute/location trade-off');
  
  // REGULATIONS / LEGAL AWARENESS
  if(/(?:rights|regulation|law|legal|tribunal|court|council.*(?:help|support|enforce))/i.test(t)&&/(?:vague|unclear|don't know|confusing|hard to understand)/i.test(t))pr.push('Unclear tenant rights');
  
  // PARKING
  if(/(?:parking|park|car.*space|no.*where.*park)/i.test(t))pr.push('Parking issues');
  
  // BROADBAND / CONNECTIVITY
  if(/(?:broadband|wifi|internet|signal|connectivity|mobile.*signal)/i.test(t))pr.push('Poor broadband/connectivity');
  
  // ACCESSIBILITY
  if(/(?:accessib|disability|wheelchair|lift|stair|mobility|disabled)/i.test(t))pr.push('Accessibility issues');
  
  // GARDEN / OUTDOOR SPACE
  if(/(?:garden|outdoor|yard|fence|overgrown)/i.test(t)&&/(?:bad|poor|broken|neglect|overgrown|refused|won't)/i.test(t))pr.push('Garden/outdoor neglect');
  
  // UNFAIR RULES / RESTRICTIONS
  if(/(?:rules?|restriction|not allowed|banned|forbid|can't.*(?:have|do|use)|policy.*unfair)/i.test(t)&&!pr.includes('No-pet policies'))pr.push('Unfair tenancy restrictions');

    // === DYNAMIC LABEL GENERATION ===
  // If no known patterns matched, extract the actual complaint and create a label
  if(pr.length===0&&t.length>15){
    // Extract what the person is actually complaining about
    const patterns=[
      /(?:problem|issue|struggle|difficulty|challenge|concern|complaint) (?:is |with |about )?(.{5,50}?)(?:\.|,|!|$)/i,
      /(?:hard|difficult|impossible|terrible|awful|bad|worst|nightmare) (?:to |with |getting )?(.{5,50}?)(?:\.|,|!|$)/i,
      /(?:can't|cannot|unable|no way) (?:to )?(.{5,40}?)(?:\.|,|!|$)/i,
      /(?:biggest|main|major|real) (?:problem|issue|concern|challenge) (?:is |was )?(.{5,50}?)(?:\.|,|!|$)/i,
      /(?:frustrated|annoyed|angry|upset) (?:about|with|by) (.{5,50}?)(?:\.|,|!|$)/i,
    ];
    
    let extracted=null;
    for(const pat of patterns){
      const m=t.match(pat);
      if(m&&m[1]){extracted=m[1].trim();break;}
    }
    
    if(extracted){
      // Clean up and create a proper label
      const cleaned=extracted
        .replace(/^(?:the|a|an|my|our|is|was|are|to|that|this|it|of|in|any|some|very|really|quite|so)\s+/gi,'')
        .replace(/\s+(?:in|of|at|the|a|an|for|with|to|from|near|my|our|this|that)\s+/gi,' ')
        .replace(/\s+/g,' ')
        .trim();
      if(cleaned.length>3&&cleaned.length<50){
        // Capitalise first letter, create readable label
        const label=cleaned.charAt(0).toUpperCase()+cleaned.slice(1);
        // Trim to max 5 words, clean up articles/prepositions at boundaries
        const words=label.split(' ').filter(w=>!['the','a','an','in','of','at','is','are','to','these','this','that','those','new'].includes(w.toLowerCase()));
        pr.push(words.slice(0,5).join(' '));
      }
    }
    
    // If still nothing, do semantic extraction — find the core noun phrase being complained about
    if(pr.length===0){
      // Look for negative adjective + noun patterns
      const negNoun=t.match(/(?:bad|poor|terrible|awful|broken|faulty|useless|slow|expensive|old|dated|outdated|cramped|dirty|noisy|cold|dark|small|unsafe|unfair|unreasonable|excessive)\s+([a-z\s]{3,30}?)(?:\.|,|!|and|but|$)/i);
      if(negNoun&&negNoun[1]){
        const topic=negNoun[1].trim().replace(/^(?:the|a|an)\s+/,'');
        if(topic.length>2&&topic.length<35){
          const tw=topic.split(' ').filter(w=>!['the','a','an','and','or','in','of','at','is','are','to'].includes(w.toLowerCase()));
          const topicLabel=tw.slice(0,5).join(' ');
          pr.push(topicLabel.charAt(0).toUpperCase()+topicLabel.slice(1));
        }
      }
    }
    
    // Absolute last resort
    if(pr.length===0){
      // Check if text is actually positive (no complaint)
      if(/(?:good|great|nice|lovely|fair|happy|comfortable|decent|excellent|perfect|love|enjoy|recommend|seamless|outstanding|brilliant|wonderful|fantastic|pleasant|satisfied)/i.test(t)&&
         !/(?:not|but|however|except|although|despite|unless)/i.test(t)){
        pr.push('Positive experience');
      }else{
        pr.push('General rental concern');
      }
    }
  }
  
  // For very short text that matched nothing
  if(pr.length===0){
    if(/(?:good|great|nice|lovely|fair|happy|fine|ok|seamless|outstanding|pleasant|satisfied)/i.test(t)) pr.push('Positive experience');
    else pr.push('General rental concern');
  }
  
  return [...new Set(pr)].slice(0,6);
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
const sr=o=>Object.entries(o).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

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
    if(r.freeText)txts.push({ts:r.ts,text:r.freeText,positive:r.positive,region:r.region,area:r.area||r.region,age:r.age,rent:r.rent,problems:r.problems,situation:r.situation,employment:r.employment||r.incomeSource,pctIncome:r.pctIncome,answers:r.answers,pastAreas:r.pastAreas,propertyType:r.propertyType,tenancyLength:r.tenancyLength,conditionRating:r.conditionRating,landlordRating:r.landlordRating,depositIssue:r.depositIssue,gender:r.gender,ukNational:r.ukNational,incomeSource:r.incomeSource,hasGuarantor:r.hasGuarantor,university:r.university,benefitType:r.benefitType,brokenRating:r.brokenRating,rentControl:r.rentControl,proposedFix:r.proposedFix,howFound:r.howFound,nationality:r.nationality,rightToRent:r.rightToRent,relationship:r.relationship});
    if(r.proposedFix)fixes.push({text:r.proposedFix,area:r.area||r.region,rating:r.brokenRating});
    const loc=r.area||r.region;if(loc)(r.problems||[]).forEach(p=>{if(!pL[loc])pL[loc]={};pL[loc][p]=(pL[loc][p]||0)+1;});
    if(r.answers)Object.values(r.answers).forEach(a=>{anC[a]=(anC[a]||0)+1;});
  });
  // sr is now global
  const pD=sr(pC),agD=sr(agC),catD=sr(catC);
  const avg=n?(tR/n).toFixed(1):"0";

  // AI + Intel
  const loadAI=async(region)=>{if(ai[region])return;setAiL(true);const pr=pL[region]?Object.keys(pL[region]):Object.keys(pC).slice(0,3);const ctx=await getAI(region,pr);setAi(prev=>({...prev,[region]:ctx}));setAiL(false);};
  useEffect(()=>{if(selR)loadAI(selR);},[selR]);
  const loadInt=async()=>{try{const r=await fetch(INTEL_FUNC);if(r.ok)setIntel(await r.json());}catch(e){}};
  const scanSocial=async()=>{
    setSocialLoading(true);
    const keywords=Object.keys(pC).slice(0,5).map(p=>p.toLowerCase().replace(/[^a-z ]/g,""));
    const regions=Object.keys(rC).slice(0,4);
    const results={instagram:[],tiktok:[],x:[],timestamp:new Date().toISOString()};
    // Scrape via Netlify intel function with social flag
    try{
      const r=await fetch(INTEL_FUNC,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({social:true,keywords,regions,problems:Object.keys(pC),freeTexts:txts.map(t=>t.text)})});
      if(r.ok){const d=await r.json();results.scan=d;}
    }catch(e){}
    setSocialData(results);setSocialLoading(false);
  };
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
      {tab==="responses"&&<ResponsesTab txts={txts} fixes={fixes} rC={rC} pC={pC} n={n} avg={avg} o4={o4} pD={sr(pC)} agD={sr(agC)}/>}

      {/* ═ ANALYSIS TAB ═ */}
      {tab==="analysis"&&<AnalysisDash data={data} pC={pC} pD={sr(pC)} rC={rC} reC={reC} iC={iC} agC={agC} rcC={rcC} catD={catD} n={n} avg={avg} o4={o4} txts={txts} fixes={fixes}/>}

      {/* ═ REGIONAL TAB ═ */}
      {tab==="regional"&&<RegionalTab data={data} rC={rC} pC={pC} pL={pL} pD={sr(pC)} n={n} txts={txts} selR={selR} setSelR={setSelR} ai={ai} aiL={aiL} loadAI={loadAI} fixes={fixes}/>}

      {/* ═ INTEL TAB ═ */}
      {tab==="intel"&&<IntelCentre data={data} txts={txts} fixes={fixes} rC={rC} pC={pC} pL={pL} n={n} avg={avg}/>}

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




/* ═══════════ INTELLIGENCE CENTRE ═══════════ */
function IntelCentre({data,txts,fixes,rC,pC,pL,n,avg}){
  const [view,setView]=useState("overview");
  const [selProb,setSelProb]=useState(null);
  const [intel,setIntel]=useState(null);
  const [intL,setIntL]=useState(false);
  const [intR,setIntR]=useState("");
  const INTEL_FUNC="/.netlify/functions/intel";
  const [socialData,setSocialData]=useState(null);
  const [pkg,setPkg]=useState(null);
  const loadPkg=()=>{fetch("https://jsonblob.com/api/jsonBlob/019d3b83-817c-7639-bdf9-1f25e2c1ee2d",{headers:{"Accept":"application/json"}}).then(r=>r.json()).then(d=>{if(d.intel_package)setPkg(d.intel_package);}).catch(()=>{});};
  useEffect(()=>{loadPkg();},[]);
  const [socialLoading,setSocialLoading]=useState(false);

  const loadInt=async()=>{try{const r=await fetch(INTEL_FUNC);if(r.ok)setIntel(await r.json());}catch(e){}};
  const scanSocial=async()=>{
    setSocialLoading(true);
    const keywords=Object.keys(pC).slice(0,5).map(p=>p.toLowerCase().replace(/[^a-z ]/g,""));
    const regions=Object.keys(rC).slice(0,4);
    const results={instagram:[],tiktok:[],x:[],timestamp:new Date().toISOString()};
    // Scrape via Netlify intel function with social flag
    try{
      const r=await fetch(INTEL_FUNC,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({social:true,keywords,regions,problems:Object.keys(pC),freeTexts:txts.map(t=>t.text)})});
      if(r.ok){const d=await r.json();results.scan=d;}
    }catch(e){}
    setSocialData(results);setSocialLoading(false);
  };
  useEffect(()=>{loadInt();},[]);
  const runScan=async(region)=>{setIntL(true);try{await fetch(INTEL_FUNC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({region:region||null,problems:Object.keys(pC),freeTexts:txts.map(t=>t.text)})});await loadInt();}catch(e){}setIntL(false);};

  // === TEMPORAL ANALYSIS ===
  const timestamps=data.filter(r=>r.ts).map(r=>({ts:r.ts,region:r.region,area:r.area,problems:r.problems||[]})).sort((a,b)=>a.ts-b.ts);
  const hourBuckets={};
  const dayBuckets={};
  timestamps.forEach(t=>{
    const d=new Date(t.ts);
    const hour=d.getHours();
    const day=d.toLocaleDateString("en-GB",{weekday:"short"});
    hourBuckets[hour]=(hourBuckets[hour]||0)+1;
    dayBuckets[day]=(dayBuckets[day]||0)+1;
  });
  const peakHour=Object.entries(hourBuckets).sort((a,b)=>b[1]-a[1])[0];
  const peakDay=Object.entries(dayBuckets).sort((a,b)=>b[1]-a[1])[0];

  // Submission velocity
  const now=Date.now();
  const last24=data.filter(r=>r.ts&&r.ts>now-86400000).length;
  const last48=data.filter(r=>r.ts&&r.ts>now-172800000).length;
  const velocity=last48>0?((last24/(last48-last24+0.01))*100-100).toFixed(0):0;

  // === PROBLEM CORRELATION MATRIX ===
  const coOccur={};
  data.forEach(r=>{
    const ps=r.problems||[];
    for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
      const key=[ps[i],ps[j]].sort().join(" × ");
      coOccur[key]=(coOccur[key]||0)+1;
    }
  });
  const topCorr=Object.entries(coOccur).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // === SENTIMENT BREAKDOWN ===
  const negWords=/terrible|awful|horrible|nightmare|unliveable|broken|unsafe|freezing|mould|harass|threaten|evict|stress|anxiety|depress|angry|frustrated|disgusting|filthy|rat|mice|cockroach/i;
  const posWords=/good|great|nice|lovely|fair|reasonable|responsive|helpful|friendly|clean|comfortable|decent|quiet|happy|lucky|excellent/i;
  let posCount=0,negCount=0,mixCount=0,neutralCount=0;
  txts.forEach(r=>{
    const neg=negWords.test(r.text);const pos=posWords.test(r.text)||posWords.test(r.positive||"");
    if(pos&&neg)mixCount++;else if(pos)posCount++;else if(neg)negCount++;else neutralCount++;
  });

  // === DEMOGRAPHIC RISK PROFILES ===
  const demoRisk={};
  data.forEach(r=>{
    const key=r.incomeSource||r.employment||"Unknown";
    if(!demoRisk[key])demoRisk[key]={count:0,totalRating:0,problems:{},o50:0};
    demoRisk[key].count++;
    demoRisk[key].totalRating+=Number(r.brokenRating)||0;
    if(r.pctIncome==="Over 50%"||r.pctIncome==="40–50%")demoRisk[key].o50++;
    (r.problems||[]).forEach(p=>{demoRisk[key].problems[p]=(demoRisk[key].problems[p]||0)+1;});
  });


  // === PROPOSED INTERVENTIONS ===
  const interventions=Object.entries(pC).sort((a,b)=>b[1]-a[1]).map(([prob,count])=>{
    const pct=((count/n)*100).toFixed(1);
    const affected=Object.entries(pL).filter(([,p])=>p[prob]).length;
    const isEasy={"Poor conditions":true,"Energy & bills":true,"High upfront costs":true}[prob];
    const isProfit={"Poor conditions":true,"Energy & bills":true,"Market competition":true}[prob];
    let shield="",mandate="";
    if(prob==="Rental affordability"){shield="Affordability Index Tool — real-time rent-to-income calculator per postcode";mandate="Local Housing Allowance rates updated quarterly to match market rents";}
    else if(prob==="Poor conditions"){shield="Condition Verification — pre-tenancy property inspection scoring";mandate="Mandatory annual property condition certificates for all rental properties";}
    else if(prob==="Landlord issues"){shield="Landlord Rating System — tenant reviews visible to future renters";mandate="Compulsory landlord licensing with enforceable response time standards";}
    else if(prob==="Tenure insecurity"){shield="Tenancy Stability Score — risk assessment for prospective tenants";mandate="Minimum 3-year tenancies as default with cause-only eviction";}
    else if(prob==="Market competition"){shield="Fair Queue System — first-qualified-first-served rental applications";mandate="Ban on rental bidding wars and above-asking-rent offers";}
    else if(prob==="High upfront costs"){shield="Deposit Passport — portable deposits between tenancies";mandate="Interest-free deposit loans for under-30s via local authorities";}
    else if(prob==="Energy & bills"){shield="Energy Cost Estimator — predicted bills based on EPC and usage data";mandate="Minimum EPC C for all rentals by 2027 with landlord-funded upgrades";}
    else if(prob==="Discrimination"){shield="Anonymous Applications — name/age/status blind until viewing stage";mandate="Extend Equality Act protections to explicitly cover housing benefit recipients";}
    else if(prob==="Mental health"){shield="Wellbeing Check-in — periodic mental health resource prompts for tenants";mandate="Require councils to fund renter mental health support services";}
    else if(prob==="Unable to save"){shield="Rent-to-Own Pathway — percentage of rent credited toward deposit";mandate="Employer-matched rental deposit savings scheme (like pension auto-enrolment)";}
    else{shield="Custom solution needed";mandate="Further research recommended";}
    return{prob,count,pct,affected,isEasy:!!isEasy,isProfit:!!isProfit,shield,mandate};
  });

  const views=[["overview","Overview"],["temporal","Timing"],["correlations","Correlations"],["demographics","Demographics"],["interventions","Interventions"],["social","Social Pulse"],["scanner","External Sources"]];


  return(<div>
    {/* Sub-navigation */}
    <div style={{display:"flex",gap:0,borderBottom:"1px solid rgba(0,0,0,.06)",marginBottom:16}}>
      {views.map(([k,l])=>(<button key={k} onClick={()=>setView(k)} style={{padding:"8px 14px",fontSize:11,fontWeight:view===k?700:500,color:view===k?"#1A1A1A":"#999",background:"none",border:"none",borderBottom:view===k?"2px solid #1A1A1A":"2px solid transparent",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>))}
    </div>

    {/* === OVERVIEW === */}
    {view==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:14}}>
        <Stat l="Responses" v={n}/><Stat l="Avg Broken" v={`${avg}/10`}/>
        <Stat l="Positive" v={posCount}/><Stat l="Negative" v={negCount}/><Stat l="Mixed" v={mixCount}/>
        <Stat l="24h Velocity" v={`${velocity>0?"+":""}${velocity}%`}/><Stat l="Peak Hour" v={peakHour?`${peakHour[0]}:00`:"-"}/>
      </div>
      {/* Sentiment gauge */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Sentiment distribution</p>
        <div style={{display:"flex",height:24,borderRadius:6,overflow:"hidden",marginTop:8}}>
          {posCount>0&&<div style={{flex:posCount,background:"#27AE60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>{posCount} positive</div>}
          {mixCount>0&&<div style={{flex:mixCount,background:"#F1C40F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{mixCount} mixed</div>}
          {neutralCount>0&&<div style={{flex:neutralCount,background:"#BDC3C7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{neutralCount} neutral</div>}
          {negCount>0&&<div style={{flex:negCount,background:"#C0392B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>{negCount} negative</div>}
        </div>
      </div>
      {/* Key findings */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Key intelligence findings</p>
        <div style={{fontSize:13,lineHeight:1.8}}>
          {n>0&&<>
            <div style={{marginBottom:8}}>Across {n} responses from {Object.keys(rC).length} regions, the dominant concern is <b>{Object.entries(pC).sort((a,b)=>b[1]-a[1])[0]?.[0]}</b> cited by {((Object.entries(pC).sort((a,b)=>b[1]-a[1])[0]?.[1]||0)/n*100).toFixed(0)}% of respondents.</div>
            {topCorr.length>0&&<div style={{marginBottom:8}}>The strongest problem correlation is <b>{topCorr[0][0]}</b> ({topCorr[0][1]} co-occurrences) — suggesting these issues share root causes or compound each other.</div>}
            <div style={{marginBottom:8}}>Sentiment is {negCount>posCount?"predominantly negative":"balanced"} — {negCount} negative vs {posCount} positive experiences. {mixCount>0?`${mixCount} respondents reported both good and bad aspects.`:""}</div>
            {peakHour&&<div>Submissions peak at <b>{peakHour[0]}:00</b>{peakDay?` on <b>${peakDay[0]}</b>`:""}. {last24>0?`${last24} responses in the last 24 hours.`:""} {velocity>20?"Submission rate is accelerating.":velocity<-20?"Submission rate is slowing.":"Rate is steady."}</div>}
          </>}
        </div>
      </div>
    </div>}


    {/* === TEMPORAL === */}
    {view==="temporal"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div className="card" style={{gridColumn:"1/-1"}}><p className="label">Submission timeline</p>
        <div style={{display:"flex",gap:4,alignItems:"flex-end",height:80,marginTop:10}}>
          {Array.from({length:24},(_, h)=>{const c=hourBuckets[h]||0;const max=Math.max(...Object.values(hourBuckets),1);
            return(<div key={h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:"100%",background:c>0?"#1A1A1A":"#F0F0F0",borderRadius:2,height:`${(c/max)*60}px`,minHeight:c>0?4:1,opacity:c>0?0.3+0.7*(c/max):0.3}}/>
              <span style={{fontSize:8,color:"#999"}}>{h}</span>
            </div>);
          })}
        </div>
        <div style={{fontSize:11,color:"#999",marginTop:8}}>Peak: {peakHour?`${peakHour[0]}:00 (${peakHour[1]} submissions)`:"—"}</div>
      </div>
      <div className="card"><p className="label">Velocity</p>
        <div className="serif" style={{fontSize:28,marginTop:8}}>{velocity>0?"+":""}{velocity}%</div>
        <div style={{fontSize:11,color:"#999"}}>24h vs prior 24h · {last24} responses today</div>
      </div>
      <div className="card"><p className="label">Response gaps</p>
        <div className="serif" style={{fontSize:28,marginTop:8}}>{timestamps.length>1?((timestamps[timestamps.length-1].ts-timestamps[0].ts)/(timestamps.length-1)/60000).toFixed(0):"—"}m</div>
        <div style={{fontSize:11,color:"#999"}}>Average time between submissions</div>
      </div>
      {/* Problem emergence over time */}
      <div className="card" style={{gridColumn:"1/-1"}}><p className="label">Problem emergence timeline</p>
        <div style={{fontSize:12,lineHeight:1.8,marginTop:8}}>
          {Object.entries(pC).sort((a,b)=>b[1]-a[1]).map(([prob])=>{
            const first=timestamps.find(t=>t.problems.includes(prob));
            const last=[...timestamps].reverse().find(t=>t.problems.includes(prob));
            return first?(<div key={prob} style={{marginBottom:4}}>
              <b>{prob}</b>: First reported {new Date(first.ts).toLocaleDateString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
              {last&&last.ts!==first.ts?` → Latest: ${new Date(last.ts).toLocaleDateString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}`:""}
              {` · ${pC[prob]} total`}
            </div>):null;
          })}
        </div>
      </div>
    </div>}

    {/* === CORRELATIONS === */}
    {view==="correlations"&&<div>
      <div className="card" style={{marginBottom:14}}><p className="label">Problem co-occurrence matrix</p>
        <p style={{fontSize:12,color:"#6B6B6B",marginBottom:10}}>Problems that appear together in the same response — indicating shared root causes or compounding effects.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {topCorr.map(([pair,count])=>{const pct=((count/n)*100).toFixed(0);
            return(<div key={pair} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)"}}>
              <div style={{flex:1}}><span style={{fontWeight:700,fontSize:13}}>{pair}</span></div>
              <span style={{fontSize:11,color:"#999"}}>{count} co-occurrences ({pct}%)</span>
              <div style={{width:100,height:6,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#1A1A1A",width:`${Math.min(parseInt(pct)*2,100)}%`}}/></div>
            </div>);
          })}
        </div>
      </div>
      {/* Positive vs negative per problem */}
      <div className="card"><p className="label">Problem sentiment breakdown</p>
        <div style={{fontSize:12,marginTop:8}}>
          {Object.entries(pC).sort((a,b)=>b[1]-a[1]).map(([prob,count])=>{
            const related=txts.filter(t=>(t.problems||[]).includes(prob));
            const neg=related.filter(t=>negWords.test(t.text)).length;
            const pos=related.filter(t=>posWords.test(t.text)||posWords.test(t.positive||"")).length;
            return(<div key={prob} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{width:160,fontWeight:600,fontSize:12}}>{prob}</span>
              <div style={{flex:1,display:"flex",height:14,borderRadius:4,overflow:"hidden"}}>
                {pos>0&&<div style={{flex:pos,background:"#27AE60"}}/>}
                {count-pos-neg>0&&<div style={{flex:count-pos-neg,background:"#BDC3C7"}}/>}
                {neg>0&&<div style={{flex:neg,background:"#C0392B"}}/>}
              </div>
              <span style={{fontSize:10,color:"#999",width:80,textAlign:"right"}}>{pos}+ {neg}−</span>
            </div>);
          })}
        </div>
      </div>
    </div>}


    {/* === DEMOGRAPHICS === */}
    {view==="demographics"&&<div>
      <div className="card" style={{marginBottom:14}}><p className="label">Demographic risk profiles</p>
        <p style={{fontSize:12,color:"#6B6B6B",marginBottom:10}}>Which demographics face the worst conditions — by income source, severity, and financial strain.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Object.entries(demoRisk).sort((a,b)=>b[1].totalRating/b[1].count-a[1].totalRating/a[1].count).map(([demo,s])=>{
            const avgR=(s.totalRating/s.count).toFixed(1);const topP=Object.entries(s.problems).sort((a,b)=>b[1]-a[1])[0];
            const o50pct=((s.o50/s.count)*100).toFixed(0);
            return(<div key={demo} style={{padding:12,borderRadius:10,border:"1px solid rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:13}}>{demo}</span>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:avgR>7?"#C0392B":avgR>5?"#E67E22":"#27AE60",color:"#fff",fontWeight:700}}>{avgR}/10 broken</span>
                  <span style={{fontSize:10,color:"#999"}}>{s.count} people</span>
                </div>
              </div>
              <div style={{fontSize:11,color:"#6B6B6B"}}>{o50pct}% paying &gt;40% income to rent · Top issue: {topP?topP[0]:"—"}</div>
            </div>);
          })}
        </div>
      </div>
      {/* Guarantor analysis */}
      <div className="card"><p className="label">Access barriers</p>
        <div style={{fontSize:12,lineHeight:1.8,marginTop:8}}>
          {(()=>{const noG=(data||[]).filter(r=>r.hasGuarantor==="No").length;const nonUK=(data||[]).filter(r=>r.ukNational==="No").length;const onBen=(data||[]).filter(r=>r.incomeSource==="Benefits").length;
            return(<>
              <div style={{marginBottom:6}}><b>{noG}</b> respondents ({((noG/n)*100).toFixed(0)}%) have <b>no UK guarantor</b> — a major barrier to securing rental properties.</div>
              <div style={{marginBottom:6}}><b>{nonUK}</b> ({((nonUK/n)*100).toFixed(0)}%) are <b>non-UK nationals</b> — facing additional documentation and discrimination hurdles.</div>
              <div><b>{onBen}</b> ({((onBen/n)*100).toFixed(0)}%) rely on <b>benefits</b> as primary income — despite DSS discrimination being ruled unlawful.</div>
            </>);
          })()}
        </div>
      </div>
    </div>}

    {/* === INTERVENTIONS === */}
    {view==="interventions"&&<div>
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Proposed interventions — RentShield features & policy mandates</p>
        <p style={{fontSize:12,color:"#6B6B6B",marginBottom:14}}>Each problem generates two proposals: a commercial product feature for RentShield and a government-level policy mandate. Ranked by report frequency.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {interventions.map((iv,i)=>(
            <div key={iv.prob} style={{padding:16,borderRadius:12,border:"1px solid rgba(0,0,0,.06)",background:i===0?"rgba(0,0,0,.02)":"transparent"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14}}>{iv.prob}</span>
                  <span style={{fontSize:10,color:"#999",marginLeft:8}}>{iv.count} reports ({iv.pct}%) · {iv.affected} regions</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {iv.isEasy&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"rgba(39,174,96,.1)",color:"#27AE60",fontWeight:700}}>SOLVABLE</span>}
                  {iv.isProfit&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"rgba(41,128,185,.1)",color:"#2980B9",fontWeight:700}}>MARKET OPP</span>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{padding:10,borderRadius:8,background:"rgba(0,0,0,.02)"}}>
                  <div style={{fontWeight:700,fontSize:10,color:"#1A1A1A",marginBottom:4}}>🛡️ RENTSHIELD FEATURE</div>
                  <div style={{fontSize:12,lineHeight:1.5}}>{iv.shield}</div>
                </div>
                <div style={{padding:10,borderRadius:8,background:"rgba(0,0,0,.02)"}}>
                  <div style={{fontWeight:700,fontSize:10,color:"#1A1A1A",marginBottom:4}}>🏛️ POLICY MANDATE</div>
                  <div style={{fontSize:12,lineHeight:1.5}}>{iv.mandate}</div>
                </div>
              </div>
              {/* Solutions from respondents */}
              {(()=>{const sols=fixes.filter(f=>txts.find(t=>t.area===f.area&&(t.problems||[]).includes(iv.prob)));
                return sols.length>0?(<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(0,0,0,.04)"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#999"}}>RESPONDENT PROPOSALS:</span>
                  {sols.slice(0,3).map((s,j)=><div key={j} style={{fontSize:11,color:"#555",marginTop:2}}>• {s.text.slice(0,150)}</div>)}
                </div>):null;
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>}

    {/* === SOCIAL PULSE === */}
    {view==="social"&&<div>
      {/* LOAD / REFRESH */}
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <button className="btn primary sm" onClick={()=>{scanSocial();loadPkg();}}>{socialLoading?"Scanning…":"Run social scan"}</button>
        <button className="btn ghost sm" onClick={loadPkg}>Refresh indexes</button>
        {pkg&&<span style={{fontSize:10,color:"#999"}}>Package built: {new Date(pkg.generated).toLocaleString()}</span>}
      </div>

      {/* DECISION INDEXES */}
      {pkg&&<>
      {/* Problem Severity Index */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Problem Severity Index</p>
        <p style={{fontSize:11,color:"#6B6B6B",marginBottom:10}}>Ranked by combined survey reports + social media mentions + sentiment weighting</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Object.entries(pkg.indexes?.problem_severity||{}).map(([prob,v])=>{
            const maxScore=Object.values(pkg.indexes?.problem_severity||{}).reduce((m,x)=>Math.max(m,x.score),1);
            const trend=pkg.indexes?.trend_direction?.[prob];
            return(<div key={prob} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,.04)"}}>
              <span style={{width:20,fontSize:12,fontWeight:700,color:"#999"}}>#{v.rank}</span>
              <span style={{width:160,fontWeight:600,fontSize:12}}>{prob}</span>
              <div style={{flex:1,height:8,borderRadius:4,background:"#F0F0F0"}}>
                <div style={{height:"100%",borderRadius:4,background:v.rank<=2?"#C0392B":v.rank<=4?"#E67E22":"#27AE60",width:`${(v.score/maxScore)*100}%`}}/>
              </div>
              <span style={{width:50,fontSize:11,fontWeight:700,textAlign:"right"}}>{v.score}</span>
              <span style={{width:70,fontSize:10,color:"#999"}}>Survey: {v.survey_reports}</span>
              <span style={{width:70,fontSize:10,color:"#999"}}>Social: {v.social_hits}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,fontWeight:700,
                background:trend==="accelerating"?"rgba(192,57,43,.1)":trend==="decelerating"?"rgba(39,174,96,.1)":"rgba(0,0,0,.04)",
                color:trend==="accelerating"?"#C0392B":trend==="decelerating"?"#27AE60":"#999"}}>
                {trend==="accelerating"?"↑ Rising":trend==="decelerating"?"↓ Falling":"→ Stable"}</span>
            </div>);
          })}
        </div>
      </div>


      {/* Regional Priority Index */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Regional Priority Index</p>
        <p style={{fontSize:11,color:"#6B6B6B",marginBottom:10}}>Which regions need intervention first — combining broken rating, response count, and social media mentions</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8}}>
          {Object.entries(pkg.indexes?.regional_priority||{}).map(([region,v],i)=>(
            <div key={region} style={{padding:12,borderRadius:10,border:i===0?"2px solid #C0392B":i===1?"2px solid #E67E22":"1px solid rgba(0,0,0,.06)",background:i===0?"rgba(192,57,43,.02)":"transparent"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:13}}>{region}</span>
                <span style={{fontSize:12,fontWeight:700}}>{v.score}</span>
              </div>
              <div style={{fontSize:11,color:"#6B6B6B"}}>
                <div>{v.responses} responses · Avg broken: <b style={{color:v.avg_broken>7?"#C0392B":v.avg_broken>5?"#E67E22":"#27AE60"}}>{v.avg_broken}/10</b></div>
                <div>Social mentions: {v.social_mentions}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Opportunity Index */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Market Opportunity Index</p>
        <p style={{fontSize:11,color:"#6B6B6B",marginBottom:10}}>Problems ranked by commercial potential — solvability × profit × demand</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Object.entries(pkg.indexes?.market_opportunity||{}).slice(0,6).map(([prob,v],i)=>(
            <div key={prob} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,.04)"}}>
              <span style={{fontWeight:700,fontSize:13,flex:1}}>{prob}</span>
              <div style={{display:"flex",gap:12,fontSize:11}}>
                <span>Solvability: <b>{v.solvability}/10</b></span>
                <span>Profit: <b>{v.profit}/10</b></span>
                <span>Demand: <b>{v.demand_pct}%</b></span>
              </div>
              <span style={{fontWeight:700,fontSize:13,width:50,textAlign:"right"}}>{v.score}</span>
              {v.solvability>=7&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:100,background:"rgba(39,174,96,.1)",color:"#27AE60",fontWeight:700}}>QUICK WIN</span>}
              {v.profit>=8&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:100,background:"rgba(41,128,185,.1)",color:"#2980B9",fontWeight:700}}>HIGH PROFIT</span>}
            </div>
          ))}
        </div>
      </div>


      {/* Credibility + Cross-reference */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div className="card">
          <p className="label">Credibility Index</p>
          <div style={{fontSize:28,fontWeight:700,marginTop:8}} className="serif">{pkg.indexes?.credibility?.credibility_pct||0}%</div>
          <div style={{fontSize:11,color:"#6B6B6B"}}>verified sources ({pkg.indexes?.credibility?.verified_sources||0} of {pkg.indexes?.credibility?.total_sources||0})</div>
          <div style={{fontSize:11,marginTop:8}}><b>{pkg.indexes?.credibility?.survey_backed||0}</b> claims backed by survey data</div>
          <div style={{fontSize:11}}><b>{pkg.indexes?.credibility?.social_only||0}</b> social-only claims (unverified by survey)</div>
        </div>
        <div className="card">
          <p className="label">Scanner Summary</p>
          <div style={{fontSize:11,lineHeight:1.8,marginTop:8}}>
            <div>News articles: <b>{pkg.scanner_summary?.total_news||0}</b> ({pkg.scanner_summary?.verified_news||0} verified)</div>
            <div>Reddit posts: <b>{pkg.scanner_summary?.reddit_posts||0}</b></div>
            <div>Locations detected: <b>{Object.keys(pkg.scanner_summary?.locations||{}).join(", ")||"none"}</b></div>
            <div>Agencies found: <b>{(pkg.scanner_summary?.agencies||[]).join(", ")||"none"}</b></div>
            <div>Sentiment: <span style={{color:"#27AE60"}}>+{pkg.scanner_summary?.sentiment?.positive||0}</span> / <span style={{color:"#C0392B"}}>-{pkg.scanner_summary?.sentiment?.negative||0}</span> / ~{pkg.scanner_summary?.sentiment?.neutral||0}</div>
          </div>
        </div>
      </div>

      {/* Cross-reference: Social vs Survey */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Cross-reference — social media vs survey data</p>
        <p style={{fontSize:11,color:"#6B6B6B",marginBottom:10}}>Does public discourse match what respondents actually report?</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
          {Object.entries(pkg.cross_reference||{}).map(([city,v])=>(
            <div key={city} style={{padding:10,borderRadius:8,border:`1.5px solid ${v.alignment==="confirmed"?"#27AE60":v.alignment==="social_only"?"#E67E22":"#2980B9"}20`,background:v.alignment==="confirmed"?"rgba(39,174,96,.02)":"transparent"}}>
              <div style={{fontWeight:700,fontSize:13}}>{city}</div>
              <div style={{fontSize:10,color:"#999"}}>{v.region}</div>
              <div style={{display:"flex",gap:12,marginTop:4,fontSize:11}}>
                <span>Social: <b>{v.social_mentions}</b></span>
                <span>Survey: <b>{v.survey_responses}</b></span>
              </div>
              <span style={{fontSize:9,marginTop:4,display:"inline-block",padding:"2px 6px",borderRadius:100,fontWeight:700,
                background:v.alignment==="confirmed"?"rgba(39,174,96,.1)":v.alignment==="social_only"?"rgba(230,126,34,.1)":"rgba(41,128,185,.1)",
                color:v.alignment==="confirmed"?"#27AE60":v.alignment==="social_only"?"#E67E22":"#2980B9"}}>
                {v.alignment==="confirmed"?"✓ CONFIRMED":v.alignment==="social_only"?"⚠ SOCIAL ONLY":"📊 SURVEY ONLY"}</span>
              {Object.keys(v.survey_problems||{}).length>0&&<div style={{fontSize:10,color:"#555",marginTop:4}}>{Object.entries(v.survey_problems).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([p,c])=>`${p}(${c})`).join(", ")}</div>}
            </div>
          ))}
        </div>
      </div>


      {/* Social Finding Cards */}
      <div className="card" style={{marginBottom:14}}>
        <p className="label">Latest social findings ({(pkg.social_cards||[]).length} items)</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:400,overflowY:"auto"}}>
          {(pkg.social_cards||[]).map((c,i)=>(
            <div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:11}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontWeight:700,fontSize:10,textTransform:"uppercase",color:c.type==="reddit"?"#FF4500":"#1A1A1A"}}>{c.type==="reddit"?`r/${c.sub}`:c.publisher||"News"}</span>
                <span style={{fontSize:9,padding:"1px 6px",borderRadius:100,
                  background:c.sentiment==="negative"?"rgba(192,57,43,.08)":c.sentiment==="positive"?"rgba(39,174,96,.08)":"rgba(0,0,0,.04)",
                  color:c.sentiment==="negative"?"#C0392B":c.sentiment==="positive"?"#27AE60":"#999"}}>{c.sentiment}</span>
              </div>
              <div style={{fontWeight:600,marginBottom:3,lineHeight:1.4}}>{c.title}</div>
              {c.text&&<div style={{color:"#6B6B6B",marginBottom:3}}>{c.text.slice(0,100)}…</div>}
              {c.locations?.length>0&&<div style={{fontSize:9,color:"#2980B9"}}>📍 {c.locations.join(", ")}</div>}
              <a href={c.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>View →</a>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(pkg.scanner_summary?.alerts||[]).length>0&&<div className="card" style={{marginBottom:14}}>
        <p className="label">Active alerts</p>
        {(pkg.scanner_summary?.alerts||[]).map((a,i)=>(
          <div key={i} style={{padding:10,borderRadius:8,border:`1.5px solid ${a.severity==="HIGH"?"#C0392B":"#E67E22"}`,marginBottom:6}}>
            <div style={{fontWeight:700,fontSize:12}}>⚠ {a.problem} — {a.location}</div>
            <div style={{fontSize:11,color:"#6B6B6B"}}>{a.sources_count} sources · Severity: {a.severity}</div>
            <div style={{fontSize:10,color:"#999",marginTop:2}}>Sentiment: +{a.sentiment?.positive||0} / -{a.sentiment?.negative||0}</div>
          </div>
        ))}
      </div>}
      </>}

      {!pkg&&<div className="card"><p style={{color:"#999",fontSize:12}}>No intel package loaded. Click "Run social scan" to build indexes from scanner data + survey responses.</p></div>}
    </div>}


            {/* === EXTERNAL SOURCES (Scanner) === */}
    {view==="scanner"&&<div>
      <div className="card" style={{marginBottom:14}}>
        <p className="label">External source scanner</p>
        <p style={{fontSize:12,color:"#6B6B6B",marginBottom:10}}>Scrapes Reddit, Google News, and Companies House to cross-reference survey findings with public discourse.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <select value={intR} onChange={e=>setIntR(e.target.value)} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid #E0E0E0",fontFamily:"inherit",fontSize:12}}>
            <option value="">All regions</option>{Object.keys(rC).map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn primary sm" onClick={()=>runScan(intR)} disabled={intL||n===0}>{intL?"Scanning…":"Run scan"}</button>
          {intel?.lastRun&&<span style={{fontSize:11,color:"#999",alignSelf:"center"}}>Last: {new Date(intel.lastRun).toLocaleString()}</span>}
        </div>
      </div>
      {intel?.scans?.length>0&&(()=>{const s=intel.scans[intel.scans.length-1];return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {s.reddit?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">Reddit discourse ({s.reddit.length})</p>
          <p style={{fontSize:11,color:"#6B6B6B",marginBottom:8}}>Public tenant experiences cross-referenced with survey problems</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:350,overflowY:"auto"}}>
            {s.reddit.map((p,i)=>(<div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:11}}>
              <div style={{fontWeight:700,marginBottom:3}}>{(p.title||"").slice(0,100)}</div>
              {p.text&&<div style={{color:"#6B6B6B",marginBottom:4,lineHeight:1.5}}>{p.text.slice(0,120)}…</div>}
              <div style={{fontSize:10,color:"#999"}}>r/{p.subreddit} · ⬆{p.score} · 💬{p.comments} {p.problem&&<span className="tag" style={{marginLeft:4}}>{p.problem}</span>}</div>
              <a href={p.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>View →</a>
            </div>))}
          </div>
        </div>}
        {s.news?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">News coverage ({s.news.length})</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {s.news.map((a,i)=>(<div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:11}}>
              <div style={{fontWeight:700,marginBottom:2}}>{(a.title||"").slice(0,100)}</div>
              <div style={{fontSize:10,color:"#999"}}>{a.publisher} · {a.date?new Date(a.date).toLocaleDateString():""}</div>
              <a href={a.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#555"}}>Read →</a>
            </div>))}
          </div>
        </div>}
        {s.companies?.length>0&&<div className="card" style={{gridColumn:"1/-1"}}><p className="label">Companies House ({s.companies.length})</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {s.companies.map((c,i)=>(<div key={i} style={{padding:8,borderRadius:6,border:"1px solid rgba(0,0,0,.04)",fontSize:10}}>
              <div style={{fontWeight:700,fontSize:11}}>{c.name}</div>
              <div style={{color:"#999"}}>#{c.number} · {c.status}</div>
              <a href={c.url} target="_blank" rel="noreferrer" style={{color:"#555"}}>View →</a>
            </div>))}
          </div>
        </div>}
      </div>);})()}
    </div>}
  </div>);
}

/* ═══════════ ANALYSIS DASHBOARD ═══════════ */
function AnalysisDash({data,pC,pD,rC,reC,iC,agC,rcC,catD,n,avg,o4,txts,fixes}){
  if(!data||!Array.isArray(data)||data.length===0||n===0)return(<div className="card"><p style={{color:"#999",fontSize:12}}>Loading analysis data...</p></div>);
  const P=["#2C2C2C","#6B6B6B","#999","#CCC","#E0E0E0"];
  // Compute all metrics
  const regions=Object.keys(rC).length;
  const avgCondition=n>0?((data||[]).reduce((s,r)=>s+(Number(r.conditionRating)||0),0)/(n||1)).toFixed(1):"—";
  const avgLandlord=n>0?((data||[]).reduce((s,r)=>s+(Number(r.landlordRating)||0),0)/(n||1)).toFixed(1):"—";
  const depositIssues=(data||[]).filter(r=>r.depositIssue&&r.depositIssue!=="None"&&r.depositIssue!=="No issues").length;
  const nonUK=(data||[]).filter(r=>r.ukNational==="No").length;
  const noGuarantor=(data||[]).filter(r=>r.hasGuarantor==="No").length;
  const students=(data||[]).filter(r=>r.incomeSource==="Student").length;
  const benefits=(data||[]).filter(r=>r.incomeSource==="Benefits").length;
  const posExp=txts.filter(r=>r.positive&&r.positive.length>5).length;

  // Rent by region averages (map bracket to midpoint)
  const rentMid={"Under £400":350,"£400–£600":500,"£600–£800":700,"£800–£1,000":900,"£1,000–£1,500":1250,"£1,500–£2,000":1750,"£2,000+":2200};
  const rentByRegion={};
  (data||[]).forEach(r=>{if(r.region&&r.rent){const reg=r.region;if(!rentByRegion[reg])rentByRegion[reg]={total:0,count:0};rentByRegion[reg].total+=rentMid[r.rent]||800;rentByRegion[reg].count++;}});
  const regionRentData=Object.entries(rentByRegion).map(([reg,v])=>({name:reg,avg:Math.round(v.total/v.count),count:v.count})).sort((a,b)=>b.avg-a.avg);

  // Income source breakdown
  const incSrc={};(data||[]).forEach(r=>{const k=r.incomeSource||"Unknown";incSrc[k]=(incSrc[k]||0)+1;});
  const incData=Object.entries(incSrc||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Rent burden heatmap data
  const burdenMap={};
  (data||[]).forEach(r=>{if(r.rent&&r.pctIncome){const key=`${r.rent}|${r.pctIncome}`;burdenMap[key]=(burdenMap[key]||0)+1;}});

  // Property type breakdown
  const propTypes={};(data||[]).forEach(r=>{const k=r.propertyType||r.situation||"Unknown";propTypes[k]=(propTypes[k]||0)+1;});
  const propData=Object.entries(propTypes).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // How found property
  const foundVia={};(data||[]).forEach(r=>{const k=r.howFound||"Unknown";foundVia[k]=(foundVia[k]||0)+1;});
  const foundData=Object.entries(foundVia).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Gender breakdown
  const genders={};(data||[]).forEach(r=>{const k=r.gender||"Unknown";genders[k]=(genders[k]||0)+1;});

  // Tenancy lengths
  const tenLengths={};(data||[]).forEach(r=>{const k=r.tenancyLength||"Unknown";tenLengths[k]=(tenLengths[k]||0)+1;});
  const tenData=Object.entries(tenLengths).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Condition rating distribution
  const condDist={};(data||[]).forEach(r=>{const k=r.conditionRating||0;condDist[k]=(condDist[k]||0)+1;});
  const condData=Array.from({length:10},(_, i)=>({rating:i+1,count:condDist[i+1]||0}));

  // Satisfaction by region
  const satByRegion=regionRentData.map(r=>{
    const rd=(data||[]).filter(d=>d.region===r.name);
    const avgB=rd.reduce((s,d)=>s+(Number(d.brokenRating)||5),0)/(rd.length||1);
    const avgC=rd.reduce((s,d)=>s+(Number(d.conditionRating)||5),0)/(rd.length||1);
    const avgL=rd.reduce((s,d)=>s+(Number(d.landlordRating)||5),0)/(rd.length||1);
    return{name:r.name,broken:avgB.toFixed(1),condition:avgC.toFixed(1),landlord:avgL.toFixed(1),rent:r.avg,count:r.count};
  });


  const S=({l,v,sub,color})=>(<div style={{padding:"10px 14px",borderRadius:10,border:"1px solid rgba(0,0,0,.06)"}}>
    <div style={{fontSize:9,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5}}>{l}</div>
    <div className="serif" style={{fontSize:22,fontWeight:700,marginTop:2,color:color||"#1A1A1A"}}>{v}</div>
    {sub&&<div style={{fontSize:10,color:"#999",marginTop:1}}>{sub}</div>}
  </div>);

  return(<div>
    {/* KPI ROW */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:14}}>
      <S l="Responses" v={n} sub={`${regions} regions`}/>
      <S l="Avg Broken" v={`${avg}/10`} sub="system rating" color={Number(avg)>7?"#C0392B":Number(avg)>5?"#E67E22":"#27AE60"}/>
      <S l="Condition" v={`${avgCondition}/10`} sub="property avg"/>
      <S l="Landlord" v={`${avgLandlord}/10`} sub="rating avg"/>
      <S l=">40% Income" v={`${n?Math.round((o4/n)*100):0}%`} sub={`${o4} respondents`}/>
      <S l="Deposit Issues" v={`${n?Math.round((depositIssues/n)*100):0}%`} sub={`${depositIssues} affected`}/>
      <S l="Non-UK" v={nonUK} sub={`${n?Math.round((nonUK/n)*100):0}% of total`}/>
      <S l="No Guarantor" v={noGuarantor} sub={`${n?Math.round((noGuarantor/n)*100):0}%`}/>
      <S l="Positive" v={posExp} sub={`${n?Math.round((posExp/n)*100):0}% reported good`}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>


      {/* MEDIAN RENT BY REGION */}
      <div className="card">
        <p className="label">Avg rent by region (£/month)</p>
        <div style={{marginTop:8}}>{regionRentData.map(r=>(
          <div key={r.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{width:90,fontSize:10,fontWeight:600,textAlign:"right"}}>{r.name}</span>
            <div style={{flex:1,height:14,borderRadius:3,background:"#F0F0F0"}}>
              <div style={{height:"100%",borderRadius:3,background:"#1A1A1A",width:`${(r.avg/2500)*100}%`,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:4}}>
                <span style={{fontSize:8,color:"#fff",fontWeight:700}}>£{r.avg}</span>
              </div>
            </div>
            <span style={{fontSize:9,color:"#999",width:20}}>{r.count}</span>
          </div>
        ))}</div>
      </div>

      {/* INCOME SOURCE */}
      <div className="card">
        <p className="label">Income source</p>
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={incData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={30} label={({name,percent})=>`${(name||"").split(" ")[0]} ${((percent||0)*100).toFixed(0)}%`} style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{incData.map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
        <div style={{fontSize:10,color:"#999",textAlign:"center"}}>Students: {students} · Benefits: {benefits}</div>
      </div>


      {/* TOP REPORTED ISSUES — full table */}
      <div className="card" style={{gridColumn:"1/-1"}}>
        <p className="label">Top reported issues</p>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginTop:8}}>
            <thead><tr style={{borderBottom:"2px solid #1A1A1A"}}>
              <th style={{textAlign:"left",padding:"6px 8px",fontWeight:700}}>Issue</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Reports</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>% of Total</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Severity</th>
              <th style={{textAlign:"left",padding:"6px 8px"}}>Distribution</th>
              <th style={{textAlign:"left",padding:"6px 8px"}}>Regions Affected</th>
            </tr></thead>
            <tbody>{pD.map((p,i)=>{const pct=((p.value/n)*100);const sev=pct>30?"CRITICAL":pct>20?"HIGH":pct>10?"MEDIUM":"LOW";
              const affectedRegions=Object.entries(rC).filter(([reg])=>(data||[]).some(r=>r.region===reg&&(r.problems||[]).includes(p.name))).map(([r])=>r);
              return(<tr key={p.name} style={{borderBottom:"1px solid #F5F5F5"}}>
                <td style={{padding:"8px",fontWeight:600}}>{p.name}</td>
                <td style={{textAlign:"center",padding:"8px",fontWeight:700}}>{p.value}</td>
                <td style={{textAlign:"center",padding:"8px"}}>{pct.toFixed(1)}%</td>
                <td style={{textAlign:"center",padding:"8px"}}><span style={{fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100,background:sev==="CRITICAL"?"#C0392B":sev==="HIGH"?"#E67E22":sev==="MEDIUM"?"#F1C40F":"#E0E0E0",color:sev==="CRITICAL"||sev==="HIGH"?"#fff":"#555"}}>{sev}</span></td>
                <td style={{padding:"8px",width:120}}><div style={{height:6,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#1A1A1A",width:`${Math.min(pct*2,100)}%`}}/></div></td>
                <td style={{padding:"8px",fontSize:10,color:"#999"}}>{affectedRegions.join(", ")}</td>
              </tr>);})}
            </tbody>
          </table>
        </div>
      </div>


      {/* DEMOGRAPHICS */}
      <div className="card">
        <p className="label">Demographics</p>
        <div style={{fontSize:11,lineHeight:1.8,marginTop:6}}>
          <div style={{fontWeight:700,fontSize:10,color:"#999",marginBottom:4}}>GENDER</div>
          {Object.entries(genders).sort((a,b)=>b[1]-a[1]).map(([g,c])=>(
            <div key={g} style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              <span style={{width:80}}>{g}</span>
              <div style={{flex:1,height:8,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#1A1A1A",width:`${(c/n)*100}%`}}/></div>
              <span style={{width:30,textAlign:"right",fontWeight:700}}>{c}</span>
            </div>
          ))}
          <div style={{fontWeight:700,fontSize:10,color:"#999",marginTop:10,marginBottom:4}}>AGE DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={100}><BarChart data={(sr(agC||{})||[]).sort((a,b)=>Number(a.name)-Number(b.name))}><XAxis dataKey="name" tick={{fontSize:9}}/><Bar dataKey="value" radius={[2,2,0,0]} fill="#2C2C2C"/></BarChart></ResponsiveContainer>
          <div style={{fontWeight:700,fontSize:10,color:"#999",marginTop:10,marginBottom:4}}>NATIONALITY</div>
          <div>UK nationals: <b>{(data||[]).filter(r=>r.ukNational==="Yes").length}</b> ({n?Math.round((data||[]).filter(r=>r.ukNational==="Yes").length/n*100):0}%)</div>
          <div>Non-UK: <b>{nonUK}</b> ({n?Math.round(nonUK/n*100):0}%)</div>
        </div>
      </div>

      {/* PROPERTY CONDITION DISTRIBUTION */}
      <div className="card">
        <p className="label">Property condition ratings</p>
        <div style={{marginTop:8}}>{condData.map(d=>(
          <div key={d.rating} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{width:20,fontSize:10,fontWeight:700,textAlign:"right",color:d.rating<=3?"#C0392B":d.rating<=5?"#E67E22":d.rating<=7?"#F1C40F":"#27AE60"}}>{d.rating}</span>
            <div style={{flex:1,height:10,borderRadius:3,background:"#F0F0F0"}}>
              <div style={{height:"100%",borderRadius:3,background:d.rating<=3?"#C0392B":d.rating<=5?"#E67E22":d.rating<=7?"#F1C40F":"#27AE60",width:`${n?(d.count/n)*100:0}%`}}/>
            </div>
            <span style={{width:30,fontSize:10,color:"#999"}}>{d.count}</span>
          </div>
        ))}</div>
        <div style={{fontSize:10,color:"#999",marginTop:6}}>1=uninhabitable, 10=excellent</div>
      </div>


      {/* RENT BURDEN HEATMAP */}
      <div className="card" style={{gridColumn:"1/-1"}}>
        <p className="label">Rent burden heatmap (rent bracket × income %)</p>
        <div style={{overflowX:"auto",marginTop:8}}>
          {(()=>{
            const rentBrackets=["Under £400","£400–£600","£600–£800","£800–£1,000","£1,000–£1,500","£1,500–£2,000","£2,000+"];
            const incBrackets=["Under 20%","20–30%","30–40%","40–50%","Over 50%"];
            return(<table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead><tr><th style={{padding:4}}></th>{incBrackets.map(i=><th key={i} style={{padding:4,fontWeight:600,textAlign:"center"}}>{i}</th>)}</tr></thead>
              <tbody>{rentBrackets.map(r=><tr key={r}>
                <td style={{padding:4,fontWeight:600,whiteSpace:"nowrap"}}>{r}</td>
                {incBrackets.map(i=>{const key=`${r}|${i}`;const c=burdenMap[key]||0;const intensity=Math.min(c/3,1);
                  return(<td key={i} style={{padding:4,textAlign:"center",background:c>0?`rgba(192,57,43,${intensity*0.6+0.1})`:"rgba(0,0,0,.02)",color:intensity>0.5?"#fff":"#555",fontWeight:c>0?700:400,borderRadius:2}}>{c||"·"}</td>);
                })}
              </tr>)}</tbody>
            </table>);
          })()}
        </div>
        <div style={{display:"flex",gap:12,marginTop:6,fontSize:9,color:"#999"}}>
          <span>Light = few responses</span><span>Dark red = many responses in this bracket</span>
          <span style={{marginLeft:"auto"}}><b>Danger zone:</b> £800+ rent at 40%+ income</span>
        </div>
      </div>


      {/* SATISFACTION BY REGION */}
      <div className="card" style={{gridColumn:"1/-1"}}>
        <p className="label">Satisfaction scores by region</p>
        <div style={{overflowX:"auto",marginTop:8}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:"2px solid #1A1A1A"}}>
              <th style={{textAlign:"left",padding:"6px 8px"}}>Region</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Responses</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Avg Rent</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>System Broken</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Condition</th>
              <th style={{textAlign:"center",padding:"6px 8px"}}>Landlord</th>
              <th style={{textAlign:"left",padding:"6px 8px"}}>Assessment</th>
            </tr></thead>
            <tbody>{satByRegion.map(r=>{
              const broken=Number(r.broken);const overall=broken>7?"CRITICAL":broken>5?"CONCERNING":"ACCEPTABLE";
              return(<tr key={r.name} style={{borderBottom:"1px solid #F5F5F5"}}>
                <td style={{padding:"6px 8px",fontWeight:600}}>{r.name}</td>
                <td style={{textAlign:"center",padding:"6px 8px"}}>{r.count}</td>
                <td style={{textAlign:"center",padding:"6px 8px",fontWeight:700}}>£{r.rent}</td>
                <td style={{textAlign:"center",padding:"6px 8px",fontWeight:700,color:broken>7?"#C0392B":broken>5?"#E67E22":"#27AE60"}}>{r.broken}/10</td>
                <td style={{textAlign:"center",padding:"6px 8px"}}>{r.condition}/10</td>
                <td style={{textAlign:"center",padding:"6px 8px"}}>{r.landlord}/10</td>
                <td style={{padding:"6px 8px"}}><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:100,background:overall==="CRITICAL"?"rgba(192,57,43,.1)":overall==="CONCERNING"?"rgba(230,126,34,.1)":"rgba(39,174,96,.1)",color:overall==="CRITICAL"?"#C0392B":overall==="CONCERNING"?"#E67E22":"#27AE60"}}>{overall}</span></td>
              </tr>);})}
            </tbody>
          </table>
        </div>
      </div>


      {/* PROPERTY TYPES + HOW FOUND + TENURE */}
      <div className="card">
        <p className="label">Property types</p>
        <div style={{marginTop:6}}>{propData.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{width:100,fontSize:10}}>{p.name}</span>
            <div style={{flex:1,height:8,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#555",width:`${(p.value/n)*100}%`}}/></div>
            <span style={{width:25,fontSize:10,fontWeight:700,textAlign:"right"}}>{p.value}</span>
          </div>
        ))}</div>
      </div>

      <div className="card">
        <p className="label">How properties were found</p>
        <div style={{marginTop:6}}>{foundData.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{width:110,fontSize:10}}>{p.name}</span>
            <div style={{flex:1,height:8,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#555",width:`${(p.value/n)*100}%`}}/></div>
            <span style={{width:25,fontSize:10,fontWeight:700,textAlign:"right"}}>{p.value}</span>
          </div>
        ))}</div>
      </div>

      {/* TENURE + RENT BRACKETS + RENT CONTROL */}
      <div className="card">
        <p className="label">Tenancy length</p>
        <div style={{marginTop:6}}>{tenData.map(t=>(
          <div key={t.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{width:90,fontSize:10}}>{t.name}</span>
            <div style={{flex:1,height:8,borderRadius:3,background:"#F0F0F0"}}><div style={{height:"100%",borderRadius:3,background:"#555",width:`${(t.value/n)*100}%`}}/></div>
            <span style={{width:25,fontSize:10,fontWeight:700,textAlign:"right"}}>{t.value}</span>
          </div>
        ))}</div>
      </div>

      <div className="card">
        <p className="label">Rent control stance</p>
        <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={(sr(rcC||{})||[])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={25} label={({name,percent})=>`${(name||"").split(" ")[0]} ${((percent||0)*100).toFixed(0)}%`} style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{(sr(rcC||{})||[]).map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
      </div>


      {/* RENT BRACKETS + AGE */}
      <div className="card">
        <p className="label">Rent brackets</p>
        <ResponsiveContainer width="100%" height={160}><BarChart data={(sr(reC||{})||[])} layout="vertical" margin={{left:90}}><XAxis type="number" tick={{fontSize:9}}/><YAxis type="category" dataKey="name" width={85} tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" radius={[0,3,3,0]} fill="#6B6B6B"/></BarChart></ResponsiveContainer>
      </div>

      <div className="card">
        <p className="label">Age distribution</p>
        <ResponsiveContainer width="100%" height={160}><BarChart data={(sr(agC||{})||[]).sort((a,b)=>Number(a.name)-Number(b.name))}><XAxis dataKey="name" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" radius={[3,3,0,0]} fill="#2C2C2C"/></BarChart></ResponsiveContainer>
      </div>

      {/* LEGAL LANDSCAPE */}
      <div className="card" style={{gridColumn:"1/-1"}}>
        <p className="label">Legal &amp; regulatory landscape</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
          {Object.entries(LEGAL).filter(([k])=>pC[k]).sort((a,b)=>(pC[b[0]]||0)-(pC[a[0]]||0)).map(([k,v])=>(
            <div key={k} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:11}}>{k}</span>
                <span style={{fontSize:10,fontWeight:700}}>{pC[k]}</span>
              </div>
              <div style={{fontSize:10,color:"#6B6B6B",marginBottom:4}}>{v.laws.join(" · ")}</div>
              <div style={{fontSize:9,color:"#999",lineHeight:1.5}}>{v.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROPOSED SOLUTIONS */}
      {fixes.length>0&&<div className="card" style={{gridColumn:"1/-1"}}>
        <p className="label">Respondent-proposed solutions ({fixes.length})</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
          {fixes.slice(0,9).map((f,i)=>(
            <div key={i} style={{padding:10,borderRadius:8,border:"1px solid rgba(0,0,0,.04)",fontSize:11}}>
              <div style={{lineHeight:1.5}}>"{f.text.slice(0,100)}{f.text.length>100?"…":""}"</div>
              <div style={{fontSize:9,color:"#999",marginTop:4}}>📍 {f.area} · Rating: {f.rating}/10</div>
            </div>
          ))}
        </div>
      </div>}
    </div>
  </div>);
}

/* ═══════════ RESPONSES TAB — Organised, timestamped, navigatable ═══════════ */
function ResponsesTab({txts,fixes,rC,pC,n,avg,o4,pD,agD}){
  const [filter,setFilter]=useState("all");
  const [probFilter,setProbFilter]=useState("");
  const [expanded,setExpanded]=useState(null);
  const [sortBy,setSortBy]=useState("newest");

  // Sort responses
  const sorted=[...txts].sort((a,b)=>{
    if(sortBy==="newest")return(b.ts||0)-(a.ts||0);
    if(sortBy==="oldest")return(a.ts||0)-(b.ts||0);
    if(sortBy==="rating")return(b.brokenRating||0)-(a.brokenRating||0);
    return 0;
  });

  // Filter
  const filtered=sorted.filter(r=>{
    if(filter!=="all"&&r.region!==filter)return false;
    if(probFilter&&!(r.problems||[]).includes(probFilter))return false;
    return true;
  });

  // Time analytics
  const timestamps=txts.filter(r=>r.ts).map(r=>r.ts).sort();
  const avgGap=timestamps.length>1?((timestamps[timestamps.length-1]-timestamps[0])/(timestamps.length-1)/60000).toFixed(0):0;
  const today=Date.now();
  const last24h=txts.filter(r=>r.ts&&r.ts>today-86400000).length;
  const lastHour=txts.filter(r=>r.ts&&r.ts>today-3600000).length;

  // Area comparison stats
  const areaStats={};
  txts.forEach(r=>{
    const a=r.area||r.region||"Unknown";
    if(!areaStats[a])areaStats[a]={count:0,totalRating:0,totalCondition:0,totalLandlord:0,problems:{}};
    areaStats[a].count++;
    areaStats[a].totalRating+=(Number(r.brokenRating)||0);
    areaStats[a].totalCondition+=(Number(r.conditionRating)||0);
    areaStats[a].totalLandlord+=(Number(r.landlordRating)||0);
    (r.problems||[]).forEach(p=>{areaStats[a].problems[p]=(areaStats[a].problems[p]||0)+1;});
  });

  const fmtTime=(ts)=>{if(!ts)return"—";const d=new Date(ts);return d.toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});};
  const timeAgo=(ts)=>{if(!ts)return"";const m=Math.floor((Date.now()-ts)/60000);if(m<1)return"just now";if(m<60)return m+"m ago";if(m<1440)return Math.floor(m/60)+"h ago";return Math.floor(m/1440)+"d ago";};

  return(<div>
    {/* Stats bar */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:14}}>
      <Stat l="Total" v={n}/><Stat l="Avg Rating" v={`${avg}/10`}/><Stat l=">40% Income" v={`${n?Math.round((o4/n)*100):0}%`}/>
      <Stat l="Last Hour" v={lastHour}/><Stat l="Last 24h" v={last24h}/><Stat l="Avg Gap" v={`${avgGap}m`}/>
      <Stat l="Regions" v={Object.keys(rC).length}/><Stat l="Top Issue" v={pD[0]?.name?.split(" ")[0]||"—"}/>
    </div>

    {/* Filters + Sort */}
    <div className="card" style={{padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:"#999"}}>FILTER:</span>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid #E0E0E0",fontSize:12,fontFamily:"inherit"}}>
          <option value="all">All regions ({n})</option>
          {Object.entries(rC).sort((a,b)=>b[1]-a[1]).map(([r,c])=><option key={r} value={r}>{r} ({c})</option>)}
        </select>
        <select value={probFilter} onChange={e=>setProbFilter(e.target.value)} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid #E0E0E0",fontSize:12,fontFamily:"inherit"}}>
          <option value="">All problems</option>
          {pD.map(p=><option key={p.name} value={p.name}>{p.name} ({p.value})</option>)}
        </select>
        <span style={{fontSize:11,fontWeight:700,color:"#999",marginLeft:8}}>SORT:</span>
        {[["newest","Newest"],["oldest","Oldest"],["rating","Worst rated"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSortBy(k)} style={{padding:"5px 12px",borderRadius:100,border:sortBy===k?"1.5px solid #1A1A1A":"1.5px solid #E0E0E0",background:sortBy===k?"#1A1A1A":"#fff",color:sortBy===k?"#fff":"#555",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
        <span style={{fontSize:11,color:"#999",marginLeft:"auto"}}>Showing {filtered.length} of {n}</span>
      </div>
    </div>

    {/* Area comparison */}
    {Object.keys(areaStats).length>1&&<div className="card" style={{marginBottom:14}}>
      <p className="label">Area comparison</p>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{borderBottom:"1px solid #E0E0E0"}}>
            <th style={{textAlign:"left",padding:"6px 8px",fontWeight:700}}>Area</th>
            <th style={{textAlign:"center",padding:"6px 8px"}}>Responses</th>
            <th style={{textAlign:"center",padding:"6px 8px"}}>Avg Broken</th>
            <th style={{textAlign:"center",padding:"6px 8px"}}>Condition</th>
            <th style={{textAlign:"center",padding:"6px 8px"}}>Landlord</th>
            <th style={{textAlign:"left",padding:"6px 8px"}}>Top Problem</th>
          </tr></thead>
          <tbody>{Object.entries(areaStats).sort((a,b)=>b[1].count-a[1].count).map(([area,s])=>{
            const topP=Object.entries(s.problems).sort((a,b)=>b[1]-a[1])[0];
            return(<tr key={area} style={{borderBottom:"1px solid #F5F5F5"}}>
              <td style={{padding:"6px 8px",fontWeight:600}}>{area}</td>
              <td style={{textAlign:"center",padding:"6px 8px"}}>{s.count}</td>
              <td style={{textAlign:"center",padding:"6px 8px",fontWeight:700,color:s.totalRating/s.count>7?"#C0392B":s.totalRating/s.count>5?"#E67E22":"#27AE60"}}>{(s.totalRating/s.count).toFixed(1)}</td>
              <td style={{textAlign:"center",padding:"6px 8px"}}>{(s.totalCondition/s.count).toFixed(1)}/10</td>
              <td style={{textAlign:"center",padding:"6px 8px"}}>{(s.totalLandlord/s.count).toFixed(1)}/10</td>
              <td style={{padding:"6px 8px"}}>{topP?`${topP[0]} (${topP[1]})`:""}</td>
            </tr>);
          })}</tbody>
        </table>
      </div>
    </div>}

    {/* Response cards */}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map((r,i)=>{
        const isExpanded=expanded===i;
        return(
          <div key={i} className="card" style={{padding:0,overflow:"hidden",cursor:"pointer"}} onClick={()=>setExpanded(isExpanded?null:i)}>
            {/* Header row — always visible */}
            <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700}}>Age {r.age}</span>
                  <span style={{fontSize:10,color:"#999"}}>{r.gender} · {r.employment||r.incomeSource} · {r.situation}</span>
                </div>
                <div className="serif" style={{fontSize:14,lineHeight:1.5,color:"#333"}}>{isExpanded?`"${r.text}"`:(`"${r.text?.slice(0,120)}${(r.text?.length||0)>120?"…":""}"`)}</div>
              </div>
              <div style={{textAlign:"right",minWidth:140}}>
                <div style={{fontSize:10,fontWeight:700,color:"#999"}}>{fmtTime(r.ts)}</div>
                <div style={{fontSize:10,color:"#CCC"}}>{timeAgo(r.ts)}</div>
                <div style={{fontSize:11,marginTop:4}}>{r.area} · {r.rent}</div>
              </div>
            </div>
            {/* Problem tags — always visible */}
            <div style={{padding:"0 18px 10px",display:"flex",flexWrap:"wrap",gap:4}}>
              {(r.problems||[]).map((p,j)=>(<span key={j} className="tag">{p}</span>))}
              <span style={{fontSize:10,padding:"3px 10px",borderRadius:100,background:r.brokenRating>7?"rgba(192,57,43,.08)":r.brokenRating>4?"rgba(230,126,34,.08)":"rgba(39,174,96,.08)",color:r.brokenRating>7?"#C0392B":r.brokenRating>4?"#E67E22":"#27AE60",fontWeight:700}}>Rating: {r.brokenRating}/10</span>
            </div>

            {/* Expanded detail — full breakdown */}
            {isExpanded&&<div style={{borderTop:"1px solid #F0F0F0",padding:"14px 18px",background:"#FAFAFA",fontSize:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>DEMOGRAPHICS</span>
                  <div>Age: {r.age} · {r.gender}</div>
                  <div>{r.relationship||""}</div>
                  <div>{r.ukNational==="No"?`${r.nationality||"Non-UK"} · Right: ${r.rightToRent||"?"}`:""}</div>
                </div>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>INCOME & WORK</span>
                  <div>{r.incomeSource||r.employment||"—"}</div>
                  <div>{r.university?`Uni: ${r.university}`:""}</div>
                  <div>{r.benefitType?`Benefits: ${r.benefitType}`:""}</div>
                  <div>Guarantor: {r.hasGuarantor||"—"}</div>
                </div>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>PROPERTY</span>
                  <div>{r.propertyType||"—"} · {r.situation}</div>
                  <div>Tenancy: {r.tenancyLength||"—"}</div>
                  <div>Found via: {r.howFound||"—"}</div>
                  <div>Deposit: {r.depositIssue||"—"}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>LOCATION</span>
                  <div>{r.region} → {r.area}</div>
                  {r.pastAreas?.length>0&&<div style={{color:"#999",marginTop:2}}>Past: {r.pastAreas.join(", ")}</div>}
                </div>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>FINANCIAL</span>
                  <div>Rent: {r.rent} · {r.pctIncome} of income</div>
                </div>
                <div><span style={{fontWeight:700,color:"#999",fontSize:10,display:"block"}}>RATINGS</span>
                  <div>System: {r.brokenRating}/10 · Condition: {r.conditionRating}/10 · Landlord: {r.landlordRating}/10</div>
                  <div>Rent control: {r.rentControl||"—"}</div>
                </div>
              </div>
              {r.positive&&<div style={{padding:10,borderRadius:8,background:"rgba(39,174,96,.04)",border:"1px solid rgba(39,174,96,.08)",marginBottom:10}}>
                <span style={{fontWeight:700,color:"#27AE60",fontSize:10}}>POSITIVE EXPERIENCE</span>
                <div style={{marginTop:4,lineHeight:1.6}}>{r.positive}</div>
              </div>}
              {r.proposedFix&&<div style={{padding:10,borderRadius:8,background:"rgba(41,128,185,.04)",border:"1px solid rgba(41,128,185,.08)",marginBottom:10}}>
                <span style={{fontWeight:700,color:"#2980B9",fontSize:10}}>PROPOSED SOLUTION</span>
                <div style={{marginTop:4,lineHeight:1.6}}>{r.proposedFix}</div>
              </div>}
              {r.answers&&Object.keys(r.answers).length>0&&<div style={{padding:10,borderRadius:8,border:"1px solid #F0F0F0"}}>
                <span style={{fontWeight:700,color:"#999",fontSize:10}}>FOLLOW-UP ANSWERS</span>
                <div style={{marginTop:4}}>{Object.values(r.answers).map((a,j)=><div key={j} style={{marginBottom:2}}>• {a}</div>)}</div>
              </div>}
              <div style={{fontSize:10,color:"#CCC",marginTop:8}}>Submitted: {r.ts?new Date(r.ts).toLocaleString("en-GB"):"Unknown"}</div>
            </div>}
          </div>
        );
      })}
    </div>

    {/* Solutions section */}
    {fixes.length>0&&<div style={{marginTop:20}}>
      <p className="label">Proposed solutions ({fixes.length})</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {fixes.map((f,i)=>(
          <div key={i} className="card" style={{padding:"12px 16px"}}>
            <div className="serif" style={{fontSize:12,lineHeight:1.55}}>"{f.text}"</div>
            <div style={{fontSize:10,color:"#999",marginTop:4}}>{f.area} · {f.rating}/10</div>
          </div>))}
      </div>
    </div>}
  </div>);
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
