/* ═══════════ ANALYSIS DASHBOARD ═══════════ */
function AnalysisDash({data,pC,pD,rC,reC,iC,agC,rcC,catD,n,avg,o4,txts,fixes}){
  const P=["#2C2C2C","#6B6B6B","#999","#CCC","#E0E0E0"];
  // Compute all metrics
  const regions=Object.keys(rC).length;
  const avgCondition=n>0?(data.reduce((s,r)=>s+(Number(r.conditionRating)||0),0)/n).toFixed(1):"—";
  const avgLandlord=n>0?(data.reduce((s,r)=>s+(Number(r.landlordRating)||0),0)/n).toFixed(1):"—";
  const depositIssues=data.filter(r=>r.depositIssue&&r.depositIssue!=="None"&&r.depositIssue!=="No issues").length;
  const nonUK=data.filter(r=>r.ukNational==="No").length;
  const noGuarantor=data.filter(r=>r.hasGuarantor==="No").length;
  const students=data.filter(r=>r.incomeSource==="Student").length;
  const benefits=data.filter(r=>r.incomeSource==="Benefits").length;
  const posExp=txts.filter(r=>r.positive&&r.positive.length>5).length;

  // Rent by region averages (map bracket to midpoint)
  const rentMid={"Under £400":350,"£400–£600":500,"£600–£800":700,"£800–£1,000":900,"£1,000–£1,500":1250,"£1,500–£2,000":1750,"£2,000+":2200};
  const rentByRegion={};
  data.forEach(r=>{if(r.region&&r.rent){const reg=r.region;if(!rentByRegion[reg])rentByRegion[reg]={total:0,count:0};rentByRegion[reg].total+=rentMid[r.rent]||800;rentByRegion[reg].count++;}});
  const regionRentData=Object.entries(rentByRegion).map(([reg,v])=>({name:reg,avg:Math.round(v.total/v.count),count:v.count})).sort((a,b)=>b.avg-a.avg);

  // Income source breakdown
  const incSrc={};data.forEach(r=>{const k=r.incomeSource||"Unknown";incSrc[k]=(incSrc[k]||0)+1;});
  const incData=Object.entries(incSrc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Rent burden heatmap data
  const burdenMap={};
  data.forEach(r=>{if(r.rent&&r.pctIncome){const key=`${r.rent}|${r.pctIncome}`;burdenMap[key]=(burdenMap[key]||0)+1;}});

  // Property type breakdown
  const propTypes={};data.forEach(r=>{const k=r.propertyType||r.situation||"Unknown";propTypes[k]=(propTypes[k]||0)+1;});
  const propData=Object.entries(propTypes).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // How found property
  const foundVia={};data.forEach(r=>{const k=r.howFound||"Unknown";foundVia[k]=(foundVia[k]||0)+1;});
  const foundData=Object.entries(foundVia).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Gender breakdown
  const genders={};data.forEach(r=>{const k=r.gender||"Unknown";genders[k]=(genders[k]||0)+1;});

  // Tenancy lengths
  const tenLengths={};data.forEach(r=>{const k=r.tenancyLength||"Unknown";tenLengths[k]=(tenLengths[k]||0)+1;});
  const tenData=Object.entries(tenLengths).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:v}));

  // Condition rating distribution
  const condDist={};data.forEach(r=>{const k=r.conditionRating||0;condDist[k]=(condDist[k]||0)+1;});
  const condData=Array.from({length:10},(_, i)=>({rating:i+1,count:condDist[i+1]||0}));

  // Satisfaction by region
  const satByRegion=regionRentData.map(r=>{
    const rd=data.filter(d=>d.region===r.name);
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
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={incData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={30} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{incData.map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
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
              const affectedRegions=Object.entries(rC).filter(([reg])=>data.some(r=>r.region===reg&&(r.problems||[]).includes(p.name))).map(([r])=>r);
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
          <ResponsiveContainer width="100%" height={100}><BarChart data={sr(agC).sort((a,b)=>Number(a.name)-Number(b.name))}><XAxis dataKey="name" tick={{fontSize:9}}/><Bar dataKey="value" radius={[2,2,0,0]} fill="#2C2C2C"/></BarChart></ResponsiveContainer>
          <div style={{fontWeight:700,fontSize:10,color:"#999",marginTop:10,marginBottom:4}}>NATIONALITY</div>
          <div>UK nationals: <b>{data.filter(r=>r.ukNational==="Yes").length}</b> ({n?Math.round(data.filter(r=>r.ukNational==="Yes").length/n*100):0}%)</div>
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
        <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={sr(rcC)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={25} label={({name,percent})=>`${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`} style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fill:"#555"}}>{sr(rcC).map((_,i)=><Cell key={i} fill={P[i%P.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
      </div>


      {/* RENT BRACKETS + AGE */}
      <div className="card">
        <p className="label">Rent brackets</p>
        <ResponsiveContainer width="100%" height={160}><BarChart data={sr(reC)} layout="vertical" margin={{left:90}}><XAxis type="number" tick={{fontSize:9}}/><YAxis type="category" dataKey="name" width={85} tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" radius={[0,3,3,0]} fill="#6B6B6B"/></BarChart></ResponsiveContainer>
      </div>

      <div className="card">
        <p className="label">Age distribution</p>
        <ResponsiveContainer width="100%" height={160}><BarChart data={sr(agC).sort((a,b)=>Number(a.name)-Number(b.name))}><XAxis dataKey="name" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" radius={[3,3,0,0]} fill="#2C2C2C"/></BarChart></ResponsiveContainer>
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

