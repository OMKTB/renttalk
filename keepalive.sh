#!/bin/bash
# RentTalk Keepalive + Auto-backup — prevents jsonblob expiry, saves local backups
# Run this alongside scanner_v2.py

SURVEY="https://jsonblob.com/api/jsonBlob/019d4f5d-86a5-796a-b672-0cd57bc79864"
INTEL="https://jsonblob.com/api/jsonBlob/019d541a-e20c-7466-a13e-fb07fad3ec27"
BACKUP_DIR="/Users/omaralrashed/renttalk/backups"
LOG="/Users/omaralrashed/renttalk/keepalive.log"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Keepalive started. Pinging every 10 min, backing up every hour." >> "$LOG"

COUNTER=0
while true; do
    # Ping both blobs to keep them alive (GET request)
    S_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SURVEY" -H "Accept: application/json")
    I_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$INTEL" -H "Accept: application/json")
    echo "[$(date '+%H:%M')] Ping: survey=$S_CODE intel=$I_CODE" >> "$LOG"

    # Every 6th cycle (every hour), save full local backup
    if [ $((COUNTER % 6)) -eq 0 ]; then
        TS=$(date +%Y%m%d_%H%M)
        curl -s "$SURVEY" -H "Accept: application/json" > "$BACKUP_DIR/survey_$TS.json"
        curl -s "$INTEL" -H "Accept: application/json" > "$BACKUP_DIR/intel_$TS.json"
        
        # Count responses
        RESP=$(python3 -c "import json; print(len(json.load(open('$BACKUP_DIR/survey_$TS.json')).get('responses',[])))" 2>/dev/null)
        echo "[$(date '+%H:%M')] BACKUP: $RESP responses saved to backups/survey_$TS.json" >> "$LOG"
        
        # Also keep a rolling "latest" backup
        cp "$BACKUP_DIR/survey_$TS.json" "$BACKUP_DIR/survey_latest.json"
        cp "$BACKUP_DIR/intel_$TS.json" "$BACKUP_DIR/intel_latest.json"
        
        # Clean old backups (keep last 48 hours = 48 files)
        ls -t "$BACKUP_DIR"/survey_2*.json 2>/dev/null | tail -n +49 | xargs rm -f 2>/dev/null
        ls -t "$BACKUP_DIR"/intel_2*.json 2>/dev/null | tail -n +49 | xargs rm -f 2>/dev/null
    fi

    # If survey blob died, restore from latest backup
    if [ "$S_CODE" != "200" ]; then
        echo "[$(date '+%H:%M')] ⚠️ SURVEY BLOB DEAD ($S_CODE) — RESTORING FROM BACKUP" >> "$LOG"
        if [ -f "$BACKUP_DIR/survey_latest.json" ]; then
            # Create new blob
            NEW_ID=$(curl -s -X POST "https://jsonblob.com/api/jsonBlob" \
                -H "Content-Type: application/json" -H "Accept: application/json" \
                -d @"$BACKUP_DIR/survey_latest.json" \
                -D - 2>/dev/null | grep -i "location:" | grep -o '[^/]*$' | tr -d '\r')
            echo "[$(date '+%H:%M')] NEW SURVEY BLOB: $NEW_ID — UPDATE CODE!" >> "$LOG"
        fi
    fi

    COUNTER=$((COUNTER + 1))
    sleep 600  # 10 minutes
done
