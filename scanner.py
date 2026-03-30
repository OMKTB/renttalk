#!/usr/bin/env python3
"""RentTalk Instagram Background Scanner — runs continuously, saves findings"""
import urllib.request, json, time, os, re
from datetime import datetime

LOG = os.path.expanduser("~/renttalk/instagram_intel.json")
BLOB = "https://jsonblob.com/api/jsonBlob/019d3b83-817c-7639-bdf9-1f25e2c1ee2d"

# Hashtags to monitor — mapped to problem categories
HASHTAGS = {
    "#ukrent": "Rental affordability",
    "#rentinguk": "General",
    "#mouldyrental": "Poor conditions",
    "#badlandlord": "Landlord issues",
    "#section21": "Tenure insecurity",
    "#flathunting": "Market competition",
    "#rentersrights": "Legal/Policy",
    "#ukhousingcrisis": "General",
    "#nodss": "Discrimination",
    "#rentcrisis": "Rental affordability",
    "#landlordproblems": "Landlord issues",
    "#tenantlife": "General",
    "#londonrent": "Rental affordability",
    "#manchesterrent": "Rental affordability",
}

# News accounts to track
NEWS_ACCOUNTS = [
    "bbcnews", "skynews", "guardian", "telegraph", "iaborrescamming",
    "sheltercharity", "generationrent", "propertyinvestoruk"
]

def load_existing():
    try:
        with open(LOG, 'r') as f:
            return json.load(f)
    except:
        return {"scans": [], "posts": [], "accounts_followed": [], "last_scan": None}

def save(data):
    with open(LOG, 'w') as f:
        json.dump(data, f, indent=2)

def search_google_for_instagram(query, limit=5):
    """Search Google for Instagram posts matching query"""
    try:
        url = f"https://www.google.com/search?q=site:instagram.com+{urllib.parse.quote(query)}&num={limit}&tbs=qdr:w"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode("utf-8", errors="ignore")
        # Extract Instagram URLs
        ig_urls = re.findall(r'https://www\.instagram\.com/p/[A-Za-z0-9_-]+/', html)
        return list(set(ig_urls))[:limit]
    except:
        return []

def search_news_rss(query):
    """Search Google News RSS for rental topics"""
    try:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query + ' UK rental')}&hl=en-GB&gl=GB&ceid=GB:en"
        req = urllib.request.Request(url, headers={"User-Agent": "RentTalk/1.0"})
        resp = urllib.request.urlopen(req, timeout=10)
        xml = resp.read().decode("utf-8", errors="ignore")
        items = []
        for match in re.finditer(r'<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?<pubDate>(.*?)</pubDate>.*?</item>', xml, re.DOTALL):
            title = re.sub(r'<!\[CDATA\[|\]\]>', '', match.group(1)).strip()
            items.append({"title": title, "url": match.group(2).strip(), "date": match.group(3).strip()})
        return items[:5]
    except:
        return []

def run_scan():
    data = load_existing()
    scan = {
        "timestamp": datetime.now().isoformat(),
        "hashtag_results": {},
        "news_results": [],
        "locations_detected": [],
        "sentiment_signals": {"positive": 0, "negative": 0, "neutral": 0}
    }
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting Instagram + news scan...")
    
    # Scan each hashtag
    for tag, category in HASHTAGS.items():
        urls = search_google_for_instagram(tag.replace("#", ""))
        if urls:
            scan["hashtag_results"][tag] = {"category": category, "post_count": len(urls), "urls": urls}
            print(f"  {tag}: {len(urls)} posts found")
        time.sleep(1)  # Rate limit
    
    # Scan news
    for query in ["UK rent crisis", "UK landlord tenant", "UK housing mould", "renters rights bill 2026"]:
        articles = search_news_rss(query)
        for a in articles:
            a["query"] = query
            # Simple sentiment from title
            title_lower = a["title"].lower()
            if any(w in title_lower for w in ["crisis", "suffer", "struggle", "worst", "fall", "crash", "rogue"]):
                scan["sentiment_signals"]["negative"] += 1
            elif any(w in title_lower for w in ["improve", "rise", "grow", "protect", "reform", "help"]):
                scan["sentiment_signals"]["positive"] += 1
            else:
                scan["sentiment_signals"]["neutral"] += 1
        scan["news_results"].extend(articles)
        time.sleep(1)
    
    # UK location detection from news titles
    uk_cities = ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield", 
                 "Newcastle", "Edinburgh", "Glasgow", "Cardiff", "Belfast", "Brighton", "Oxford",
                 "Cambridge", "Nottingham", "Leicester", "Preston", "Sunderland"]
    for article in scan["news_results"]:
        for city in uk_cities:
            if city.lower() in article["title"].lower():
                scan["locations_detected"].append({"city": city, "source": article["title"][:80], "url": article["url"]})
    
    data["scans"].append(scan)
    data["last_scan"] = scan["timestamp"]
    
    # Keep last 20 scans
    if len(data["scans"]) > 20:
        data["scans"] = data["scans"][-20:]
    
    save(data)
    
    total_posts = sum(r["post_count"] for r in scan["hashtag_results"].values())
    print(f"  News articles: {len(scan['news_results'])}")
    print(f"  Instagram posts referenced: {total_posts}")
    print(f"  Locations detected: {len(scan['locations_detected'])}")
    print(f"  Sentiment: +{scan['sentiment_signals']['positive']} / -{scan['sentiment_signals']['negative']} / ~{scan['sentiment_signals']['neutral']}")
    print(f"  Saved to {LOG}")
    
    # Also push to cloud intel blob
    try:
        existing = json.loads(urllib.request.urlopen(
            urllib.request.Request(BLOB, headers={"Accept": "application/json"})
        ).read())
        existing["social_scans"] = data["scans"][-5:]
        existing["last_social_scan"] = scan["timestamp"]
        req = urllib.request.Request(BLOB, json.dumps(existing).encode(), method="PUT",
            headers={"Content-Type": "application/json", "Accept": "application/json"})
        urllib.request.urlopen(req)
        print("  Pushed to cloud intel blob")
    except Exception as e:
        print(f"  Cloud push failed: {e}")

if __name__ == "__main__":
    print(f"=== RentTalk Background Scanner started at {datetime.now()} ===")
    print(f"Scanning every 15 minutes. Log: {LOG}")
    while True:
        try:
            run_scan()
        except Exception as e:
            print(f"  Scan error: {e}")
        print(f"  Next scan in 15 minutes...\n")
        time.sleep(900)
