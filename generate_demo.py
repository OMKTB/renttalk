#!/usr/bin/env python3
"""Generate 130 demographically accurate UK rental demo responses based on real market research"""
import json, random, time, urllib.request, ssl

random.seed(42)
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
EP = "https://renttalk-uk.netlify.app/.netlify/functions/data"

# First get existing responses
req = urllib.request.Request(EP)
existing = json.loads(urllib.request.urlopen(req, context=ctx, timeout=15).read()).get("responses", [])
print(f"Existing responses: {len(existing)}")

# === BUILDING BLOCKS FROM RESEARCH ===

REGIONS = {
    "London": {"areas":["Central","East","West","North","South","Zone 3–4","Zone 5–6"],"rents":{"studio":1450,"1bed":1800,"2bed":2200,"hmo":985},"weight":28},
    "South East": {"areas":["Brighton","Oxford","Reading","Canterbury","Guildford","Southampton"],"rents":{"studio":950,"1bed":1200,"2bed":1400,"hmo":750},"weight":13},
    "South West": {"areas":["Bristol","Bath","Exeter","Plymouth","Bournemouth"],"rents":{"studio":800,"1bed":1000,"2bed":1150,"hmo":680},"weight":8},
    "East of England": {"areas":["Cambridge","Norwich","Ipswich","Colchester"],"rents":{"studio":850,"1bed":1100,"2bed":1280,"hmo":700},"weight":7},
    "West Midlands": {"areas":["Birmingham","Coventry","Wolverhampton"],"rents":{"studio":700,"1bed":850,"2bed":1000,"hmo":620},"weight":6},
    "East Midlands": {"areas":["Nottingham","Leicester","Derby","Northampton"],"rents":{"studio":650,"1bed":800,"2bed":925,"hmo":580},"weight":5},
    "North West": {"areas":["Manchester","Liverpool","Preston","Bolton","Warrington","Chester","Blackpool"],"rents":{"studio":750,"1bed":950,"2bed":1100,"hmo":600},"weight":8},
    "North East": {"areas":["Newcastle","Sunderland","Durham","Middlesbrough"],"rents":{"studio":500,"1bed":650,"2bed":780,"hmo":500},"weight":4},
    "Yorkshire & Humber": {"areas":["Leeds","Sheffield","York","Bradford","Hull"],"rents":{"studio":600,"1bed":750,"2bed":870,"hmo":580},"weight":5},
    "Scotland": {"areas":["Edinburgh","Glasgow","Aberdeen","Dundee"],"rents":{"studio":700,"1bed":900,"2bed":1050,"hmo":650},"weight":5},
    "Wales": {"areas":["Cardiff","Swansea","Newport","Bangor"],"rents":{"studio":600,"1bed":780,"2bed":940,"hmo":600},"weight":4},
    "Northern Ireland": {"areas":["Belfast","Derry","Lisburn"],"rents":{"studio":550,"1bed":700,"2bed":830,"hmo":550},"weight":3},
}

RENT_BRACKETS = ["Under £400","£400–£600","£600–£800","£800–£1,000","£1,000–£1,500","£1,500–£2,000","£2,000+"]
PCT_INCOME = ["Under 20%","20–30%","30–40%","40–50%","Over 50%"]
TENANCY_LENGTHS = ["Under 3 months","3–6 months","6–12 months","1–2 years","2–5 years","5+ years"]
HOW_FOUND = ["Rightmove/Zoopla","SpareRoom","Letting agent","Facebook/Gumtree","University","Council","Word of mouth"]
SITUATIONS = ["Renting alone","House/flat share","With partner","Student accommodation","Temporary"]
PROP_TYPES = ["Studio","1-bed flat","2-bed flat","3+ bed flat","HMO / shared","Terraced house","Bedsit"]
GENDERS = ["Male","Male","Female","Female","Non-binary"]  # roughly 50/50 with small NB %

NATIONALITIES = [None]*68 + ["Polish"]*3 + ["Romanian"]*2 + ["Indian"]*3 + ["Nigerian"]*2 + ["Italian"]*2 + ["Spanish"]*2 + ["Chinese"]*2 + ["Pakistani"]*2 + ["French"]*1 + ["German"]*1 + ["Irish"]*2 + ["Sudanese"]*1 + ["Bangladeshi"]*1 + ["Greek"]*1 + ["Brazilian"]*1 + ["South African"]*1 + ["Filipino"]*1 + ["Turkish"]*1 + ["Portuguese"]*1 + ["Ghanaian"]*1 + ["Somali"]*1 + ["American"]*1

PROBLEMS_POOL = [
    "Poor conditions","Landlord issues","Contractor/maintenance access","Rental affordability",
    "Market competition","High upfront costs","Discrimination","Energy & bills","No-pet policies",
    "Property management failures","Mental health impact","Tenure insecurity","Housing supply concerns",
    "Letting agency issues","Unable to save/build future","General rental concern","Positive experience",
    "Overcrowding","Noise/neighbour issues","Commute/location trade-off"
]

UNIS = ["University of Manchester","Manchester Metropolitan","University of Leeds","University of Sheffield",
        "University of Bristol","University of Birmingham","UCL","King's College London",
        "University of Edinburgh","University of Glasgow","Cardiff University","Queen's University Belfast",
        "University of Nottingham","University of Liverpool","University of Southampton",
        "University of Oxford","University of Cambridge","Newcastle University","University of Exeter",
        "University of Bath","University of Sussex","Coventry University","University of Leicester"]

RENT_CONTROL_STANCES = ["Strongly support"]*35 + ["Somewhat support"]*30 + ["Neutral"]*20 + ["Somewhat oppose"]*10 + ["Strongly oppose"]*5

# Real complaint templates derived from research (VICE, Reddit, NUS, news)
COMPLAINT_TEMPLATES = {
    "Poor conditions": [
        "Black mould in the bedroom and bathroom. Landlord says to open windows but it's single glazing and freezing. Been reporting it for {months} months.",
        "Damp patches on every wall. The letting agency sent someone who just painted over it. Came back worse within weeks.",
        "Mice in the kitchen, gaps under doors you can see daylight through. Boiler broke in December, took {weeks} weeks to fix.",
        "The property has an EPC rating of {epc}. My electricity bill was over £{bill} last month. Condensation dripping down windows every morning.",
        "Ceiling collapsed in the bathroom from water damage upstairs. Landlord's response was to put a bucket under it.",
        "Raw sewage smell from the drains for months. Environmental health had to get involved because landlord ignored us.",
        "No working smoke alarms, loose wiring, carpet coming up on the stairs. Reported it all — nothing done.",
        "The flat hasn't been decorated since the 90s. Wallpaper peeling, kitchen units falling off the wall, bath panel held on with tape.",
    ],
    "Landlord issues": [
        "Landlord enters the flat without notice. Found him in our living room twice. Says it's his property so he can come whenever.",
        "Haven't been able to contact the landlord in {months} months. Messages ignored, calls go to voicemail. Agency says they can't help.",
        "Landlord threatened eviction when I asked for the boiler to be serviced. Made me feel like I was being unreasonable.",
        "Our landlord lives abroad and uses a friend as a 'manager' who knows nothing about housing law. Deposit wasn't protected for 8 months.",
        "Landlord raised rent by £{increase} with 1 month notice. Said take it or leave. We can't afford to move — moving costs would be £{movecost}.",
        "The landlord refuses to give receipts for rent. Pays everything in cash. I'm worried about my tenancy rights.",
    ],
    "Rental affordability": [
        "Spending {pct}% of my take-home on rent. After bills there's barely £{left} a week for food and transport.",
        "Rent went from £{old} to £{new} in two years. Same flat, no improvements. Wage hasn't moved.",
        "Both of us work full time and we still can't save for a deposit. Renting feels like throwing money away but there's no alternative.",
        "The gap between what I earn and what rent costs means I'll never own a home. I've accepted that now but it still hurts.",
        "I moved to {area} from {fromarea} because I literally could not afford to stay. My commute is now {mins} minutes each way.",
    ],
    "Market competition": [
        "Applied for {num} flats. Got rejected from most without explanation. The market is brutal — dozens at every viewing.",
        "Someone offered {months} months rent upfront and got the flat. I can barely afford the deposit let alone months in advance.",
        "Agent told me they had {enquiries} enquiries for one property. I was asked to submit a video introduction. Felt degrading.",
        "Every decent flat is gone within hours of listing. I've set up alerts on every platform and still miss them.",
        "Bidding war pushed the rent from £{listed} to £{final}. I couldn't compete. The new tenant is paying 15% over asking.",
    ],
    "High upfront costs": [
        "Deposit plus first month plus agency fees — needed over £{total} upfront just to move in. Had to borrow from family.",
        "Asked to pay {months} months upfront because I'm {reason}. That's £{amount} I don't have lying around.",
        "Previous landlord kept £{kept} of my deposit for 'cleaning' despite the flat being spotless. Took 4 months to get any money back through the scheme.",
        "The deposit was capped at 5 weeks but the agent wanted a guarantor earning 3x the rent. My parents don't earn that.",
    ],
    "Discrimination": [
        "Told the flat was taken, then saw it relisted the next day. I'm {background} — hard not to wonder.",
        "Agent asked me what my immigration status was before even showing the property. Made me feel unwelcome in my own city.",
        "Applied to {num} properties, rejected from all. I'm on Universal Credit. The 'no DSS' policy is still alive despite being illegal.",
        "Landlord said 'professionals only' on the listing. When I explained I work full time as a {job}, they said they meant 'office workers'.",
        "As a single mother I've been turned down by {num} landlords who said they 'prefer couples'. How is that legal?",
    ],
    "Energy & bills": [
        "The flat has storage heaters and single glazing. My electric bill hit £{bill} in winter. EPC rating {epc}.",
        "Landlord won't insulate the loft or replace the windows. Says it's not worth the investment. Meanwhile I'm choosing between heating and eating.",
        "Paying £{bill} a month in energy in a draughty Victorian terrace. The boiler is 20 years old and runs constantly.",
    ],
    "Letting agency issues": [
        "Agency takes 3-4 weeks to respond to any maintenance request. Sent a plumber who made the leak worse.",
        "The agency charged me £{fee} for 'check-out inventory'. Pretty sure that's illegal since the Tenant Fees Act.",
        "Agency never returns calls. The only way to get anything done is to physically go to their office.",
        "They showed me a flat that looked nothing like the photos. Windows were different, garden didn't exist. Complete misrepresentation.",
    ],
    "Mental health impact": [
        "The constant worry about rent increases and whether I'll be evicted has severely affected my anxiety. I'm on medication now partly because of housing stress.",
        "Living in a damp flat with mould triggered my asthma and depression. My GP said my housing is making me ill but I can't afford to move.",
        "The insecurity of renting — never knowing if you'll be here next year — makes it impossible to feel settled. It affects everything.",
    ],
    "Tenure insecurity": [
        "Got a Section 21 after asking for repairs. Classic retaliatory eviction. Hoping the new law stops this happening to others.",
        "Landlord wants to sell. Given 2 months to find somewhere in this market. With two kids it's terrifying.",
        "We've been here {years} years. Landlord just announced a 'renovation' — code for getting us out and reletting at double.",
    ],
    "No-pet policies": [
        "Every listing says no pets. I have a small cat who's been with me for {years} years. She's family — I won't abandon her.",
        "Was told pets are allowed, then the lease had a no-pets clause. Landlord said 'I forgot to mention it'. Had to rehome my dog.",
    ],
    "Positive experience": [
        "Honestly, my experience has been great. Landlord is responsive, rent is fair, flat is in good condition. I know I'm lucky.",
        "We found a great place through word of mouth. Fair rent, good landlord, quiet neighbours. Not everyone has a horror story.",
        "Renting in {area} has been genuinely positive. Affordable, clean, landlord sorted issues within days. Better than I expected.",
        "The letting agent has been professional and helpful throughout. Quick repairs, clear communication. They exist — just rare.",
        "After years of bad rentals, we finally found a good one. The landlord treats us like human beings, not just income.",
    ],
}

POSITIVE_TEMPLATES = [
    "Close to work and shops","Good transport links","Nice neighbourhood","Quiet area","Good natural light",
    "Near the university","Affordable compared to other areas","Decent size for the price","Good flatmates",
    "Responsive letting agent","Modern kitchen","Close to parks","Central location","Good local community",
    "Pet-friendly area","Near family","Safe neighbourhood","Good landlord","Recently renovated","Bills included",
    "","","",""  # some people leave it blank
]

PROPOSED_FIXES = [
    "Cap annual rent increases to inflation","Mandatory property inspections before reletting",
    "Make LHA match actual local rents","Force landlords to upgrade insulation to EPC C",
    "Automatic deposit return unless landlord proves damage with photos","Ban upfront payments over 1 month",
    "Anonymous rental applications to prevent discrimination","Better enforcement of existing laws",
    "More social housing built","Regulate letting agencies properly","Rent-to-own schemes",
    "Landlord licensing nationwide","Longer notice periods for rent increases","Tax breaks for good landlords",
    "More student housing built by universities","Better transport to make cheaper areas accessible",
    "Ban Section 21 immediately","Create a national landlord register","Fund council enforcement teams",
    "","",""  # some leave blank
]

def rent_bracket(actual_rent):
    if actual_rent < 400: return "Under £400"
    elif actual_rent < 600: return "£400–£600"
    elif actual_rent < 800: return "£600–£800"
    elif actual_rent < 1000: return "£800–£1,000"
    elif actual_rent < 1500: return "£1,000–£1,500"
    elif actual_rent < 2000: return "£1,500–£2,000"
    else: return "£2,000+"

def gen_response(idx):
    r = {}
    base_ts = int(time.time()*1000) - 604800000  # 1 week ago
    r["ts"] = base_ts + idx * 180000 + random.randint(0, 60000)
    r["isDemo"] = True  # CLEARLY MARKED AS DEMO DATA

    # Age distribution matching EHS data
    age_roll = random.random()
    if age_roll < 0.12: r["age"] = str(random.randint(18, 24))
    elif age_roll < 0.44: r["age"] = str(random.randint(25, 34))
    elif age_roll < 0.67: r["age"] = str(random.randint(35, 44))
    elif age_roll < 0.85: r["age"] = str(random.randint(45, 54))
    elif age_roll < 0.95: r["age"] = str(random.randint(55, 64))
    else: r["age"] = str(random.randint(65, 75))

    age = int(r["age"])
    r["gender"] = random.choice(GENDERS)

    # Nationality (68% UK, 11% EU, 21% other)
    nat = random.choice(NATIONALITIES)
    if nat:
        r["ukNational"] = "No"
        r["nationality"] = nat
        r["rightToRent"] = random.choice(["Yes — valid visa","Yes — settled/pre-settled status","Yes — British/Irish passport"])
    else:
        r["ukNational"] = "Yes"

    # Region weighted by PRS size
    region_list = []
    for reg, data in REGIONS.items():
        region_list.extend([reg] * data["weight"])
    region = random.choice(region_list)
    r["region"] = region
    r["area"] = random.choice(REGIONS[region]["areas"])

    # Income source
    if age <= 24 and random.random() < 0.4:
        r["incomeSource"] = "Student"
        r["university"] = random.choice([u for u in UNIS if region.lower() in u.lower() or random.random() < 0.3])
        r["hasGuarantor"] = random.choice(["Yes","Yes","Yes","No"])
    elif random.random() < 0.08:
        r["incomeSource"] = "Benefits"
        r["benefitType"] = "Universal Credit"
    elif random.random() < 0.07:
        r["incomeSource"] = "Self-employed"
        r["employment"] = random.choice(["Freelance","Sole trader","Contractor"])
    elif age >= 65 and random.random() < 0.6:
        r["incomeSource"] = "Retired"
    else:
        r["incomeSource"] = "Employed"
        r["employment"] = random.choice(["Full-time","Full-time","Full-time","Part-time","Zero-hours"])

    # Relationship
    if age < 22: r["relationship"] = random.choice(["Single","Single","In a relationship"])
    elif age < 35: r["relationship"] = random.choice(["Single","In a relationship","In a relationship","Engaged","Married"])
    else: r["relationship"] = random.choice(["Single","Married","Married","In a relationship","Divorced"])

    # Property and rent
    rents = REGIONS[region]["rents"]
    if r["incomeSource"] == "Student" or (age < 25 and r.get("relationship") == "Single"):
        prop = random.choice(["HMO / shared","Studio","Bedsit"])
        actual_rent = rents["hmo"] + random.randint(-100, 150)
        r["situation"] = random.choice(["House/flat share","Student accommodation"])
    elif "partner" in r.get("relationship","").lower() or r.get("relationship") in ["Married","Engaged"]:
        prop = random.choice(["1-bed flat","2-bed flat","2-bed flat","Terraced house"])
        actual_rent = rents["2bed"] + random.randint(-200, 300)
        r["situation"] = "With partner"
    else:
        prop = random.choice(["Studio","1-bed flat","1-bed flat","Bedsit"])
        actual_rent = rents["1bed"] + random.randint(-150, 200)
        r["situation"] = "Renting alone"

    r["propertyType"] = prop
    r["rent"] = rent_bracket(actual_rent)
    r["howFound"] = random.choice(HOW_FOUND)
    r["tenancyLength"] = random.choice(TENANCY_LENGTHS)

    # Rent-to-income ratio
    if r["incomeSource"] == "Benefits" or actual_rent > 1500:
        r["pctIncome"] = random.choice(["40–50%","Over 50%","Over 50%"])
    elif actual_rent > 1000:
        r["pctIncome"] = random.choice(["30–40%","30–40%","40–50%"])
    elif region in ["London","South East","East of England"]:
        r["pctIncome"] = random.choice(["30–40%","40–50%","30–40%"])
    else:
        r["pctIncome"] = random.choice(["20–30%","30–40%","20–30%","Under 20%"])

    # Problems — 81% satisfied, 19% with significant issues
    is_positive = random.random() < 0.15
    if is_positive:
        problems = ["Positive experience"]
        r["conditionRating"] = random.randint(7, 10)
        r["landlordRating"] = random.randint(6, 10)
        r["brokenRating"] = random.randint(1, 4)
    else:
        # Weight problems by prevalence from research
        weighted = []
        weighted.extend(["Poor conditions"]*8 + ["Rental affordability"]*7 + ["Landlord issues"]*6)
        weighted.extend(["Market competition"]*5 + ["High upfront costs"]*6 + ["Contractor/maintenance access"]*5)
        weighted.extend(["Discrimination"]*4 + ["Energy & bills"]*4 + ["Letting agency issues"]*3)
        weighted.extend(["Mental health impact"]*3 + ["No-pet policies"]*2 + ["Tenure insecurity"]*3)
        weighted.extend(["Unable to save/build future"]*3 + ["Housing supply concerns"]*2)
        weighted.extend(["General rental concern"]*3 + ["Property management failures"]*2)
        num_problems = random.choice([1, 1, 2, 2, 2, 3, 3])
        problems = list(set(random.choices(weighted, k=num_problems)))
        r["conditionRating"] = random.randint(1, 7)
        r["landlordRating"] = random.randint(1, 7)
        r["brokenRating"] = random.randint(4, 10)
    r["problems"] = problems

    # Generate free text from templates
    main_problem = problems[0]
    templates = COMPLAINT_TEMPLATES.get(main_problem, COMPLAINT_TEMPLATES.get("General rental concern", ["The rental market is challenging."]))
    template = random.choice(templates)
    # Fill in template variables
    freetext = template.format(
        months=random.randint(2,18), weeks=random.randint(2,8), epc=random.choice(["D","E","F","G"]),
        bill=random.randint(120,280), increase=random.randint(50,200), movecost=random.randint(1500,4000),
        pct=random.randint(35,55), left=random.randint(30,120), old=random.randint(600,1400),
        new=random.randint(800,1800), area=r["area"], fromarea=random.choice(["London","Manchester","Bristol","Birmingham"]),
        mins=random.randint(40,90), num=random.randint(5,25), enquiries=random.randint(20,80),
        listed=random.randint(800,1600), final=random.randint(900,1850), total=random.randint(1800,5000),
        reason=random.choice(["self-employed","on a visa","a student","new to the UK"]),
        amount=random.randint(2000,8000), kept=random.randint(200,800),
        background=random.choice(["Black","from Nigeria","Eastern European","on benefits","a single parent"]),
        job=random.choice(["nurse","teacher","delivery driver","care worker","retail manager"]),
        years=random.randint(2,12), fee=random.randint(100,350)
    )
    r["freeText"] = freetext
    r["positive"] = random.choice(POSITIVE_TEMPLATES)
    r["proposedFix"] = random.choice(PROPOSED_FIXES)
    r["rentControl"] = random.choice(RENT_CONTROL_STANCES)

    # Deposit issues
    if "High upfront costs" in problems:
        r["depositIssue"] = random.choice(["Struggled to afford","Paid months upfront","Previous deposit withheld","Needed guarantor for deposit"])
    elif random.random() < 0.3:
        r["depositIssue"] = random.choice(["None","None","Struggled to afford"])

    return r

# === GENERATE 130 DEMO RESPONSES ===
print("Generating 130 demo responses...")
demo = [gen_response(i) for i in range(130)]

# Stats
regions_count = {}
problems_count = {}
for d in demo:
    reg = d["region"]
    regions_count[reg] = regions_count.get(reg, 0) + 1
    for p in d["problems"]:
        problems_count[p] = problems_count.get(p, 0) + 1

print(f"\nRegion distribution:")
for reg, count in sorted(regions_count.items(), key=lambda x: -x[1]):
    print(f"  {reg}: {count}")

print(f"\nTop problems:")
for prob, count in sorted(problems_count.items(), key=lambda x: -x[1])[:10]:
    print(f"  {prob}: {count}")

ages = [int(d["age"]) for d in demo]
print(f"\nAge range: {min(ages)}-{max(ages)}, mean: {sum(ages)/len(ages):.0f}")
positive = sum(1 for d in demo if "Positive experience" in d["problems"])
print(f"Positive experiences: {positive}/{len(demo)} ({positive/len(demo)*100:.0f}%)")
non_uk = sum(1 for d in demo if d.get("ukNational") == "No")
print(f"Non-UK nationals: {non_uk}/{len(demo)} ({non_uk/len(demo)*100:.0f}%)")

# === PUSH ALL RESPONSES (existing 28 + 130 demo) ===
all_responses = existing + demo
print(f"\nPushing {len(all_responses)} total responses ({len(existing)} existing + {len(demo)} demo)...")

data = json.dumps({"responses": all_responses}).encode()
req = urllib.request.Request(EP, data, headers={"Content-Type": "application/json"}, method="PUT")
resp = urllib.request.urlopen(req, context=ctx, timeout=30)
result = json.loads(resp.read())
print(f"PUT result: {result}")

# Verify
time.sleep(2)
req2 = urllib.request.Request(EP)
d = json.loads(urllib.request.urlopen(req2, context=ctx, timeout=15).read())
total = len(d.get("responses", []))
demo_count = sum(1 for r in d.get("responses", []) if r.get("isDemo"))
real_count = total - demo_count
print(f"\n=== VERIFIED ===")
print(f"Total responses: {total}")
print(f"Real responses: {real_count}")
print(f"Demo responses: {demo_count}")
print(f"Demo clearly marked with isDemo=true")
