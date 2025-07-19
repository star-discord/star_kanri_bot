#!/bin/bash
#
# Pre-flight check script to ensure the system is in a healthy state
# before performing updates or other critical operations.

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "  ${YELLOW}🔎 Pre-flight checks running...${NC}"
error_count=0

# Check 1: .env file and DISCORD_TOKEN
if [ ! -f ".env" ]; then
    echo -e "    ${RED}❌ Critical: .env file is missing.${NC}"
    ((error_count++))
elif ! grep -q "DISCORD_TOKEN=.*[^ ]" .env; then
    echo -e "    ${RED}❌ Critical: DISCORD_TOKEN is not set in .env file.${NC}"
    ((error_count++))
fi

# Check 2: JSON syntax in data/ directory
if ! command -v jq > /dev/null 2>&1; then
    echo "    ⚠️ Warning: 'jq' is not installed. Skipping JSON syntax check."
elif [ -d "data" ]; then
    json_files=$(find data -type f -name "*.json")
    if [ -n "$json_files" ]; then
        for file in $json_files; do
            if ! jq -e . >/dev/null 2>&1 < "$file"; then
                echo -e "    ${RED}❌ Critical: Syntax error in JSON file: $file${NC}"
                ((error_count++))
            fi
        done
    fi
fi

if [ "$error_count" -gt 0 ]; then
    echo -e "\n${RED}🚨 Pre-flight checks failed with $error_count critical error(s). Aborting operation.${NC}"
    exit 1
fi

echo -e "  ${GREEN}👍 Pre-flight checks passed.${NC}"