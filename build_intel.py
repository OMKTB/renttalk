#!/usr/bin/env python3
"""Build Intel Package — cross-reference social + survey, build indexes, push to cloud"""
import json, urllib.request, ssl, time
from datetime import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HOME = "/Users/omaralrashed/renttalk"
SURVEY_BLOB = "https://jsonblob.com/api/jsonBlob/019d4029-e73b-7e5f-9d5a-f4c1958c41b9"
INTEL_BLOB = "https://jsonblob.com/api/jsonBlob/019d442c-0a2c-793a-8866-9ba75ef5e02c"

# Load data
with open(f'{HOME}/ig_scan_findings.json') as f: scanner = json.load(f)
survey = json.loads(urllib.request.urlopen(urllib.request.Request(SURVEY_BLOB, headers={'Accept':'application/json'}), context=ctx).read())
responses = survey.get('responses', [])
n = len(responses)

# Aggregate survey
pC, rC = {}, {}
for r in responses:
    reg = r.get('region','')
    if reg: rC[reg] = rC.get(reg, 0) + 1
    for p in (r.get('problems') or []): pC[p] = pC.get(p, 0) + 1

# Aggregate scanner
all_news, all_reddit, all_locs = [], [], {}
all_sentiment = {"positive":0,"negative":0,"mixed":0,"neutral":0}
for s in scanner.get('scans', []):
    all_news.extend(s.get('news', []))
    all_reddit.extend(s.get('reddit', []))
    for loc in s.get('locations_found', []): all_locs[loc['city']] = all_locs.get(loc['city'], 0) + 1
    for k, v in s.get('sentiment_summary', {}).items(): all_sentiment[k] = all_sentiment.get(k, 0) + v

LOC_MAP = {"London":"London","Manchester":"North West","Birmingham":"West Midlands","Leeds":"Yorkshire & Humber",
    "Liverpool":"North West","Bristol":"South West","Sheffield":"Yorkshire & Humber","Newcastle":"North East",
    "Edinburgh":"Scotland","Glasgow":"Scotland","Cardiff":"Wales","Belfast":"Northern Ireland",
    "Brighton":"South East","Cambridge":"East of England","Nottingham":"East Midlands","Preston":"North West"}


# STEP 1: Cross-reference social vs survey
cross_ref = {}
for city, mentions in all_locs.items():
    region = LOC_MAP.get(city, "")
    survey_count = rC.get(region, 0)
    survey_probs = {}
    for r in responses:
        if r.get('region') == region:
            for p in (r.get('problems') or []): survey_probs[p] = survey_probs.get(p, 0) + 1
    cross_ref[city] = {"social_mentions":mentions,"survey_responses":survey_count,"region":region,
        "survey_problems":survey_probs,
        "alignment":"confirmed" if survey_count > 0 and mentions > 0 else "social_only" if mentions > 0 else "survey_only"}

# STEP 2: Problem Severity Index
psi = {}
for prob, count in pC.items():
    pct = (count / n * 100) if n else 0
    social = sum(1 for a in all_news if prob.lower().split()[0] in a.get('title','').lower())
    score = round(pct * 0.5 + min(social, 50) * 0.3 + min(all_sentiment.get('negative',0), 30) * 0.2, 1)
    psi[prob] = {"score":score,"survey_reports":count,"survey_pct":round(pct,1),"social_hits":social}
ranked = sorted(psi.items(), key=lambda x: -x[1]["score"])
for i, (k, v) in enumerate(ranked): psi[k]["rank"] = i + 1

# STEP 3: Regional Priority Index
rpi = {}
for region, count in rC.items():
    rd = [r for r in responses if r.get('region') == region]
    avg_r = sum(int(r.get('brokenRating', 5)) for r in rd) / len(rd) if rd else 5
    social = sum(v for c, v in all_locs.items() if LOC_MAP.get(c) == region)
    rpi[region] = {"score":round(avg_r*3+count*2+social*1.5,1),"responses":count,"avg_broken":round(avg_r,1),"social_mentions":social}

# STEP 4: Market Opportunity Index
SOLVE = {"Rental affordability":2,"Poor conditions":7,"Landlord issues":5,"Tenure insecurity":3,"Market competition":1,"High upfront costs":6,"Energy & bills":8,"Discrimination":4,"Mental health":3,"Unable to save":2}
PROFIT = {"Rental affordability":3,"Poor conditions":8,"Landlord issues":6,"Tenure insecurity":4,"Market competition":5,"High upfront costs":7,"Energy & bills":9,"Discrimination":3,"Mental health":5,"Unable to save":4}
moi = {}
for prob, count in pC.items():
    e, p = SOLVE.get(prob,5), PROFIT.get(prob,5)
    d = min((count/n*100),100) if n else 0
    moi[prob] = {"score":round(e*3+p*3+d*0.4,1),"solvability":e,"profit":p,"demand_pct":round(d,1)}


# STEP 5: Credibility Index
verified = sum(1 for a in all_news if a.get('verified_source'))
cred = {"verified_sources":verified,"total_sources":len(all_news),"credibility_pct":round((verified/len(all_news)*100) if all_news else 0,1),
    "survey_backed":len([p for p in pC if pC[p]>=2]),"social_only":len([c for c,v in cross_ref.items() if v['alignment']=='social_only'])}

# STEP 6: Trend Direction
trend = {}
for prob in pC:
    ts = sorted([r.get('ts',0) for r in responses if prob in (r.get('problems') or []) and r.get('ts')])
    if len(ts) >= 2:
        mid = len(ts)//2
        trend[prob] = "accelerating" if len(ts[mid:]) > len(ts[:mid]) else "stable" if len(ts[mid:]) == len(ts[:mid]) else "decelerating"
    else: trend[prob] = "insufficient_data"

# STEP 7: Social findings cards (for dashboard display)
social_cards = []
for item in all_reddit[:10]:
    social_cards.append({"type":"reddit","title":item.get('title','')[:120],"text":item.get('text','')[:200],
        "url":item.get('url',''),"sentiment":item.get('sentiment','neutral'),
        "locations":[l['city'] for l in item.get('locations',[])],"sub":item.get('sub',''),"score":item.get('score',0)})
for item in sorted(all_news, key=lambda x: x.get('date',''), reverse=True)[:15]:
    if item.get('verified_source'):
        social_cards.append({"type":"news","title":item.get('title','')[:120],"url":item.get('url',''),
            "publisher":item.get('publisher',''),"sentiment":item.get('sentiment','neutral'),
            "locations":[l['city'] for l in item.get('locations',[])]})

# Compile package
package = {
    "generated":datetime.now().isoformat(),
    "cross_reference":cross_ref,
    "social_cards":social_cards,
    "indexes":{
        "problem_severity":dict(sorted(psi.items(), key=lambda x:-x[1]["score"])),
        "regional_priority":dict(sorted(rpi.items(), key=lambda x:-x[1]["score"])),
        "market_opportunity":dict(sorted(moi.items(), key=lambda x:-x[1]["score"])),
        "credibility":cred,
        "trend_direction":trend
    },
    "scanner_summary":{
        "total_news":len(all_news),"verified_news":verified,"reddit_posts":len(all_reddit),
        "locations":dict(sorted(all_locs.items(), key=lambda x:-x[1])),
        "agencies":[a.get('name','') for a in scanner.get('agencies',[])],
        "alerts":scanner.get('alerts',[])[-5:],"sentiment":all_sentiment
    }
}

with open(f'{HOME}/intel_package.json','w') as f: json.dump(package,f,indent=2)

# Push to cloud
existing = json.loads(urllib.request.urlopen(urllib.request.Request(INTEL_BLOB,headers={'Accept':'application/json'}),context=ctx).read())
existing['intel_package'] = package
req = urllib.request.Request(INTEL_BLOB, json.dumps(existing).encode(), method='PUT', headers={'Content-Type':'application/json','Accept':'application/json'})
urllib.request.urlopen(req, context=ctx)

print("=== INTEL PACKAGE BUILT & PUSHED ===")
print(f"Cross-refs: {len(cross_ref)} locations")
print(f"\nPROBLEM SEVERITY INDEX:")
for p,v in list(sorted(psi.items(), key=lambda x:-x[1]['score']))[:5]:
    print(f"  #{v['rank']} {p}: score {v['score']} (survey:{v['survey_reports']}, social:{v['social_hits']})")
print(f"\nREGIONAL PRIORITY:")
for r,v in list(sorted(rpi.items(), key=lambda x:-x[1]['score']))[:5]:
    print(f"  {r}: {v['score']} (resp:{v['responses']}, broken:{v['avg_broken']}, social:{v['social_mentions']})")
print(f"\nMARKET OPPORTUNITY:")
for p,v in list(sorted(moi.items(), key=lambda x:-x[1]['score']))[:3]:
    print(f"  {p}: {v['score']} (solve:{v['solvability']}/10, profit:{v['profit']}/10, demand:{v['demand_pct']}%)")
print(f"\nCREDIBILITY: {cred['credibility_pct']}% verified ({verified}/{len(all_news)})")
print(f"TRENDS: {trend}")
print(f"SOCIAL CARDS: {len(social_cards)} items for dashboard")
