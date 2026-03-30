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

