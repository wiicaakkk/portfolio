#!/usr/bin/env bash
# ==============================================================================
# Automatic 6-Hour Server Maintenance & Service Restart Script
# Purpose: Prevents server hangs & memory leaks by restarting services every 6h
# Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00) via Cron / Systemd
# ==============================================================================

LOG_DIR="/home/michella/Media/Home Lab/logs"
LOG_FILE="${LOG_DIR}/auto_restart.log"
CRON_SCHEDULE="0 */6 * * *"
SCRIPT_PATH="$(readlink -f "$0")"

mkdir -p "$LOG_DIR"

log_message() {
    local TIMESTAMP
    TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S %Z')
    echo "[${TIMESTAMP}] $1" | tee -a "$LOG_FILE"
}

# Install Cron Job Option
if [ "$1" == "--install-cron" ]; then
    log_message "Installing 6-hour auto restart job to user crontab..."
    (crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH"; echo "$CRON_SCHEDULE $SCRIPT_PATH >> \"$LOG_FILE\" 2>&1") | crontab -
    log_message "✅ Cron job successfully installed! Scheduled to run every 6 hours ($CRON_SCHEDULE)."
    echo ""
    crontab -l | grep "$SCRIPT_PATH"
    exit 0
fi

# Uninstall Cron Job Option
if [ "$1" == "--uninstall-cron" ]; then
    log_message "Removing 6-hour auto restart job from crontab..."
    (crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH") | crontab -
    log_message "❌ Cron job removed."
    exit 0
fi

log_message "------------------------------------------------------------"
log_message "🔄 STARTING AUTOMATIC 6-HOUR SERVER MAINTENANCE & RESTART"
log_message "------------------------------------------------------------"

# 1. Log System Metrics Before Restart
MEM_BEFORE=$(free -h | awk '/Mem:/ {print $3 "/" $2}')
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }')
log_message "📊 System Health Before Maintenance:"
log_message "   • Memory Used: ${MEM_BEFORE}"
log_message "   • CPU Load Average:${CPU_LOAD}"

# 2. Flush Filesystem Buffers & Clear PageCache
log_message "🧹 Clearing RAM PageCache & Swap Buffers..."
sync
if [ "$(id -u)" -eq 0 ]; then
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
else
    sudo sysctl -w vm.drop_caches=3 2>/dev/null || true
fi

# 3. Restart Active Docker Containers (if Docker is active)
if command -v docker &> /dev/null; then
    RUNNING_CONTAINERS=$(docker ps -q)
    if [ -n "$RUNNING_CONTAINERS" ]; then
        log_message "🐳 Restarting active Docker containers..."
        docker restart $RUNNING_CONTAINERS >> "$LOG_FILE" 2>&1
        log_message "✅ Docker containers restarted successfully."
    else
        log_message "ℹ️ No running Docker containers found to restart."
    fi
fi

# 4. Restart PM2 Node.js Process Manager (if PM2 is active)
if command -v pm2 &> /dev/null; then
    log_message "🟢 Restarting PM2 managed Node.js services..."
    pm2 restart all >> "$LOG_FILE" 2>&1
    log_message "✅ PM2 processes restarted."
fi

# 5. Log System Metrics After Maintenance
MEM_AFTER=$(free -h | awk '/Mem:/ {print $3 "/" $2}')
log_message "📊 System Health After Maintenance:"
log_message "   • Memory Used: ${MEM_AFTER}"
log_message "🎉 AUTOMATIC 6-HOUR RESTART MAINTENANCE COMPLETED SUCCESSFULLY!"
log_message "------------------------------------------------------------"
