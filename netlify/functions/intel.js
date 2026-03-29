const DATA_BLOB = "https://jsonblob.com/api/jsonBlob/019d3aec-1fd0-7391-86f3-9e085eba2130";
const INTEL_BLOB = "https://jsonblob.com/api/jsonBlob/019d3b83-817c-7639-bdf9-1f25e2c1ee2d";
const H = {"Content-Type":"application/json","Accept":"application/json"};
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Content-Type":"application/json"};

// Region-specific subreddits and search terms
const REGION_SUBS = {
  "London":"london","South East":"brighton+oxford+reading",
  "South West":"bristol+bath+exeter","East of England":"cambridge+norwich",
  "West Midlands":"birmingham+coventry","East Midlands":"nottingham+leicester",
  "North West":"manchester+liverpool","North East":"newcastle",
  "Yorkshire & Humber":"leeds+sheffield+york","Scotland":"scotland+edinburgh+glasgow",
  "Wales":"wales+cardiff","Northern Ireland":"northernireland+belfast"
};

// Problem-to-keyword mapping for search queries
const PROBLEM_KEYWORDS = {
  "Rental affordability": ["rent increase","rent too high","can't afford rent","rent crisis"],
  "Poor property conditions": ["damp mould rental","landlord won't repair","rental property condition","unsafe rental"],
  "Landlord/agent problems": ["bad landlord","letting agent complaint","landlord unresponsive","landlord harassing"],
  "Tenure insecurity": ["section 21 eviction","no fault eviction","eviction notice","kicked out rental"],
  "Market competition": ["rental bidding war","can't find rental","rental market crazy","dozens applicants"],
  "Inadequate space": ["tiny flat","overcrowded rental","small room expensive","studio flat"],
  "High upfront costs": ["rental deposit","letting fees","guarantor requirement","months rent upfront"],
  "Energy costs": ["energy bills rental","cold flat","insulation rental","EPC rating"],
  "No-pet policies": ["no pets rental","pet friendly rental UK","landlord pets"],
  "Rental discrimination": ["DSS discrimination","no DSS","housing benefit discrimination","rental discrimination"],
  "Mental health impact": ["renting mental health","housing stress","rental anxiety","housing crisis wellbeing"],
  "Unable to save/build future": ["can't save renting","generation rent","never own home","renting forever"]
};

// === REDDIT SCRAPER (free, public JSON API) ===
async function scrapeReddit(query, subreddit, limit=10) {
  try {
    const url = subreddit 
      ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=new&limit=${limit}&t=month`
      : `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&t=month`;
    const r = await fetch(url, {
      headers: {"User-Agent": "RentTalk-Research-Agent/1.0"}
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data?.children || []).map(c => ({
      source: "reddit",
      subreddit: c.data.subreddit,
      title: c.data.title,
      text: (c.data.selftext || "").slice(0, 500),
      url: `https://reddit.com${c.data.permalink}`,
      score: c.data.score,
      comments: c.data.num_comments,
      date: new Date(c.data.created_utc * 1000).toISOString(),
      author: c.data.author
    }));
  } catch(e) { console.error("Reddit error:", e.message); return []; }
}

// === GOOGLE NEWS SCRAPER (RSS feed, free) ===
async function scrapeGoogleNews(query, limit=8) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " UK rental")}&hl=en-GB&gl=GB&ceid=GB:en`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const xml = await r.text();
    const items = [];
    const regex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g;
    let match;
    while ((match = regex.exec(xml)) !== null && items.length < limit) {
      items.push({
        source: "google_news",
        title: match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        url: match[2].trim(),
        date: new Date(match[3].trim()).toISOString(),
        publisher: match[4].replace(/<!\[CDATA\[|\]\]>/g, "").trim()
      });
    }
    return items;
  } catch(e) { console.error("Google News error:", e.message); return []; }
}

// === COMPANIES HOUSE (free API, no key needed for search) ===
async function searchCompaniesHouse(name) {
  try {
    const url = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(name)}&items_per_page=5`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.items || []).map(c => ({
      source: "companies_house",
      name: c.title,
      number: c.company_number,
      status: c.company_status,
      type: c.company_type,
      address: c.address_snippet,
      created: c.date_of_creation,
      url: `https://find-and-update.company-information.service.gov.uk/company/${c.company_number}`
    }));
  } catch(e) { console.error("Companies House error:", e.message); return []; }
}

// === ENTITY EXTRACTOR (finds company/business names in free text) ===
function extractEntities(texts) {
  const entities = new Set();
  const patterns = [
    /(?:landlord|agent|agency|letting|estate|property|management|housing)\s+(?:is|called|named|by|from|with|at)?\s*[""']?([A-Z][A-Za-z&\s]{2,30}(?:Ltd|Limited|Properties|Homes|Estates|Group|Agency|Lettings|Management)?)[""']?/gi,
    /([A-Z][A-Za-z&\s]{2,25}(?:Properties|Homes|Estates|Lettings|Management|Housing|Apartments|Residentials|Rentals))/g,
    /(?:company|firm|business)\s+(?:called|named)?\s*[""']?([A-Z][A-Za-z&\s]{3,30})[""']?/gi
  ];
  for (const text of texts) {
    for (const pattern of patterns) {
      let match;
      const p = new RegExp(pattern.source, pattern.flags);
      while ((match = p.exec(text)) !== null) {
        const name = match[1]?.trim();
        if (name && name.length > 3 && name.length < 40) {
          entities.add(name);
        }
      }
    }
  }
  return [...entities].slice(0, 20);
}

// === MAIN HANDLER ===
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:CORS,body:""};
  
  // GET = return stored intel
  if (event.httpMethod === "GET") {
    try {
      const r = await fetch(INTEL_BLOB, {headers:H});
      const d = await r.json();
      return {statusCode:200,headers:CORS,body:JSON.stringify(d)};
    } catch(e) {
      return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
    }
  }

  // POST = run a new intelligence scan
  if (event.httpMethod === "POST") {
    try {
      const params = JSON.parse(event.body || "{}");
      const region = params.region || null;
      const problems = params.problems || [];
      const freeTexts = params.freeTexts || [];
      
      const scan = {
        id: Date.now().toString(36),
        timestamp: new Date().toISOString(),
        region: region,
        problemsScanned: problems,
        reddit: [],
        news: [],
        companies: [],
        entities: []
      };

      // 1. Scrape Reddit for each problem
      const redditSub = region ? (REGION_SUBS[region] || "HousingUK") : "HousingUK";
      for (const prob of problems.slice(0, 5)) {
        const keywords = PROBLEM_KEYWORDS[prob] || [prob];
        const query = keywords[0] + (region ? " " + region : "");
        const posts = await scrapeReddit(query, redditSub, 5);
        scan.reddit.push(...posts.map(p => ({...p, problem: prob, region: region})));
        // Also search general UK housing subs
        const ukPosts = await scrapeReddit(query, "HousingUK+LegalAdviceUK+UKPersonalFinance", 3);
        scan.reddit.push(...ukPosts.map(p => ({...p, problem: prob, region: region})));
      }

      // 2. Scrape Google News
      for (const prob of problems.slice(0, 4)) {
        const keywords = PROBLEM_KEYWORDS[prob] || [prob];
        const query = keywords[0] + (region ? " " + region : "");
        const articles = await scrapeGoogleNews(query, 4);
        scan.news.push(...articles.map(a => ({...a, problem: prob, region: region})));
      }

      // 3. Extract entities from survey free texts
      const entities = extractEntities(freeTexts);
      scan.entities = entities;

      // 4. Look up extracted entities on Companies House
      for (const entity of entities.slice(0, 10)) {
        const companies = await searchCompaniesHouse(entity);
        scan.companies.push(...companies.map(c => ({...c, matchedEntity: entity})));
      }

      // 5. Store the scan results
      const existing = await fetch(INTEL_BLOB, {headers:H}).then(r=>r.json()).catch(()=>({scans:[]}));
      const scans = Array.isArray(existing.scans) ? existing.scans : [];
      scans.push(scan);
      // Keep last 50 scans
      while (scans.length > 50) scans.shift();
      
      await fetch(INTEL_BLOB, {
        method: "PUT", headers: H,
        body: JSON.stringify({scans, lastRun: scan.timestamp})
      });

      return {
        statusCode: 200, headers: CORS,
        body: JSON.stringify({
          ok: true,
          scan_id: scan.id,
          reddit_posts: scan.reddit.length,
          news_articles: scan.news.length,
          entities_found: scan.entities.length,
          companies_matched: scan.companies.length
        })
      };
    } catch(e) {
      return {statusCode:500,headers:CORS,body:JSON.stringify({error:e.message})};
    }
  }

  return {statusCode:405,headers:CORS,body:"{}"};
};
