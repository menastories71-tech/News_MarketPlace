#!/bin/bash

# Master auto-push script for News Marketplace
# Monitors storage, RSS, and sitemap files, and handles updates in one unified system.

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Storage directories to monitor
STORAGE_DIRS=(
    "backend/uploads"
    "backend/temp"
)

# RSS and sitemap files to monitor (relative to project root)
RSS_SITEMAP_FILES=(
    "frontend/public/rss.xml" 
    "frontend/public/sitemap.xml" 
    "frontend/public/robots.txt"
)

# Combined list for monitoring
ALL_MONITORED_PATHS=("${STORAGE_DIRS[@]}" "${RSS_SITEMAP_FILES[@]}")

COMMIT_MESSAGE=${1:-"Auto: content and SEO updates $(date '+%Y-%m-%d %H:%M:%S')"}
LOG_FILE="$PROJECT_ROOT/automation.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 1. Regenerate SEO files from Dynamic Data
regenerate_seo() {
    log_message "🔄 Regenerating dynamic RSS and Sitemap files..."
    if node "$PROJECT_ROOT/scripts/generate_seo_files.js"; then
        log_message "✅ Regeneration complete."
    else
        log_message "⚠️ Regeneration failed. Proceeding with existing files..."
    fi
}

# 2. Check for changes
has_changes() {
    for path in "${ALL_MONITORED_PATHS[@]}"; do
        if [[ -e "$PROJECT_ROOT/$path" ]]; then
            if [[ -n $(git status --porcelain "$PROJECT_ROOT/$path") ]]; then
                return 0 # Changes found
            fi
        fi
    done
    return 1 # No changes
}

# 3. Main Logic
main() {
    cd "$PROJECT_ROOT" || exit 1

    # Optional: Regenerate before checking (uncomment if you want auto-regen on every run)
    regenerate_seo

    if ! has_changes; then
        echo "No changes detected in monitored paths. Skipping push."
        return 0
    fi

    log_message "🚀 Changes detected. Starting auto-push..."

    # Add changes
    for path in "${ALL_MONITORED_PATHS[@]}"; do
        git add "$path" 2>/dev/null
    done

    # Commit
    if git commit -m "$COMMIT_MESSAGE"; then
        log_message "💾 Committed changes: $COMMIT_MESSAGE"
        
        # Push
        log_message "⬆️ Pushing to GitHub..."
        if git push origin "$(git branch --show-current)"; then
            log_message "🎉 Push successful!"
        else
            log_message "❌ Push failed. Check your connection or git credentials."
        fi
    else
        log_message "ℹ️ Nothing to commit (staged changes might have been empty after add)."
    fi
}

# Execute
if [[ "$1" == "--monitor" ]]; then
    log_message "👀 Monitoring mode started (checking every 30 minutes)..."
    while true; do
        main
        log_message "😴 Waiting 30 minutes for next check..."
        sleep 1800
    done
else
    main
fi

