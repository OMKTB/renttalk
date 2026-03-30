#!/bin/bash
# RentTalk Health Monitor — runs every 15 minutes
LOG="/Users/omaralrashed/renttalk/monitor.log"

check() {
  echo "========================================" >> "$LOG"
  echo "CHECK: $(date '+%H:%M:%S %d/%m/%Y')" >> "$LOG"
  
  RESULT=$(curl -s "https://renttalk-uk.netlify.app/.netlify/functions/data" 2>/dev/null)
  
  if [ -z "$RESULT" ]; then
    echo "❌ FAILED: No response from server" >> "$LOG"
    return
  fi
  
  echo "$RESULT" | python3 -c "
import json, sys
from datetime import datetime

try:
    data = json.load(sys.stdin)
    responses = data.get('responses', [])
    n = len(responses)
    now_ms = datetime.now().timestamp() * 1000
    recent_15 = len([r for r in responses if r.get('ts', 0) > now_ms - 900000])
    recent_60 = len([r for r in responses if r.get('ts', 0) > now_ms - 3600000])
    
    regions = {}
    for r in responses:
        reg = r.get('region', 'Unknown')
        regions[reg] = regions.get(reg, 0) + 1
    
    last = responses[-1] if responses else {}
    last_ts = datetime.fromtimestamp(last.get('ts',0)/1000).strftime('%H:%M') if last.get('ts') else 'none'
    
    print(f'✅ Total: {n} | Last 15min: {recent_15} | Last hour: {recent_60} | Latest at: {last_ts}')
    print(f'   Regions: {dict(sorted(regions.items(), key=lambda x: -x[1]))}')
except Exception as e:
    print(f'❌ Parse error: {e}')
" >> "$LOG" 2>&1
}

echo "🔄 RentTalk Monitor started at $(date)" >> "$LOG"
echo "   Checking every 15 minutes. PID: $$" >> "$LOG"

while true; do
  check
  sleep 900
done
