#!/bin/bash
# Script untuk Cron Job Server / Homelab
# Pindahkan / jalankan dari Crontab di Proxmox LXC / Linux Server

REPO_DIR="/home/michella/Media/Home Lab"
cd "$REPO_DIR" || exit 1

# Update log file
mkdir -p activity_logs
CURRENT_DATE=$(date -u +'%Y-%m-%d %H:%M:%S UTC')
echo "{\"last_updated\": \"${CURRENT_DATE}\", \"status\": \"Active\"}" > activity_logs/daily_activity.json

if [ ! -f activity_logs/ACTIVITY.md ]; then
  echo "# Daily Activity Logs" > activity_logs/ACTIVITY.md
  echo "| Date & Time (UTC) | Status | Trigger |" >> activity_logs/ACTIVITY.md
  echo "|---|---|---|" >> activity_logs/ACTIVITY.md
fi
echo "| ${CURRENT_DATE} | System Active 🟢 | Local Cron Server |" >> activity_logs/ACTIVITY.md

# Git Commit & Push
git config user.email "bagus.wicakono285@gmail.com"
git config user.name "wiicaakkk"

git add activity_logs/daily_activity.json activity_logs/ACTIVITY.md

if ! git diff --staged --quiet; then
  git commit -m "chore(auto): daily contribution sync via server [$(date -u +'%Y-%m-%d')]"
  git push origin master
fi
