#!/bin/bash
#
# Helper script for backing up and restoring critical files.
#
# Usage:
# ./scripts/backup_handler.sh backup /path/to/temp_dir
# ./scripts/backup_handler.sh restore /path/to/temp_dir

set -e

ACTION=$1
TEMP_BACKUP=$2

if [ -z "$ACTION" ] || [ -z "$TEMP_BACKUP" ]; then
    echo "Usage: $0 [backup|restore] <temp_backup_directory>"
    exit 1
fi

# --- Configuration: Files and directories to protect ---
FILES_TO_PROTECT=(".env")
DIRS_TO_PROTECT=("data")
PATTERNS_TO_PROTECT=("star-discord-bot-*.json" "data/star-discord-bot-*.json")

perform_backup() {
    echo "  -> Backing up to $TEMP_BACKUP"
    mkdir -p "$TEMP_BACKUP"

    for file in "${FILES_TO_PROTECT[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$TEMP_BACKUP/"
            echo "     - Protected file: $file"
        fi
    done

    for dir in "${DIRS_TO_PROTECT[@]}"; do
        if [ -d "$dir" ]; then
            rsync -a --delete "$dir/" "$TEMP_BACKUP/$dir/"
            echo "     - Protected directory: $dir/"
        fi
    done

    shopt -s nullglob
    for pattern in "${PATTERNS_TO_PROTECT[@]}"; do
        for file in $pattern; do
            mkdir -p "$TEMP_BACKUP/$(dirname "$file")"
            cp "$file" "$TEMP_BACKUP/$file"
            echo "     - Protected by pattern: $file"
        done
    done
    shopt -u nullglob
}

perform_restore() {
    echo "  -> Restoring from $TEMP_BACKUP"

    for file in "${FILES_TO_PROTECT[@]}"; do
        if [ -f "$TEMP_BACKUP/$file" ]; then
            mv "$TEMP_BACKUP/$file" .
            echo "     - Restored file: $file"
        fi
    done

    for dir in "${DIRS_TO_PROTECT[@]}"; do
        if [ -d "$TEMP_BACKUP/$dir" ]; then
            if [ -d "$dir" ]; then rm -rf "$dir"; fi
            mv "$TEMP_BACKUP/$dir" .
            echo "     - Restored directory: $dir/"
        fi
    done

    shopt -s nullglob
    # バックアップ時と同じパターン配列をループすることで、将来の変更に強くなる
    for pattern in "${PATTERNS_TO_PROTECT[@]}"; do
        for file_in_backup in "$TEMP_BACKUP"/$pattern; do
            if [ -f "$file_in_backup" ]; then
                # バックアップ元からの相対パスを復元
                target_file="${file_in_backup#$TEMP_BACKUP/}"
                mkdir -p "$(dirname "$target_file")"
                mv "$file_in_backup" "$target_file"
                echo "     - Restored by pattern: $target_file"
            fi
        done
    done
    shopt -u nullglob
}

if [[ "$ACTION" == "backup" ]]; then
    perform_backup
elif [[ "$ACTION" == "restore" ]]; then
    perform_restore
else
    echo "エラー: 無効なアクションが指定されました: $ACTION" >&2
    exit 1
fi