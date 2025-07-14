#!/bin/bash

# --- Configuration ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting replacement of 'InteractionResponseFlags' with 'MessageFlags'...${NC}"

# Find all JS files containing the target string, excluding non-source directories.
files_to_change=$(grep -lr 'InteractionResponseFlags' . \
  --exclude-dir={node_modules,.git,data,logs,backups} \
  --include="*.js")

if [ -z "$files_to_change" ]; then
  echo -e "${GREEN}✅ No files containing 'InteractionResponseFlags' were found. No changes needed.${NC}"
  exit 0
fi

echo "The following files will be modified:"
echo "$files_to_change"
echo ""

changed_count=0

# Loop through the found files and perform a safe, in-place replacement.
for file in $files_to_change; do
  # Use a single, robust sed command with word boundaries (\b)
  # and create a backup file (.bak) for safety.
  sed -i.bak 's/\bInteractionResponseFlags\b/MessageFlags/g' "$file"
  echo -e "  ${GREEN}✓${NC} Patched '$file'"
  ((changed_count++))
done

echo -e "\n${GREEN}✅ Replacement process complete.${NC}"
echo "   - Modified ${changed_count} file(s)."
echo -e "   - Backup files have been created with a '.bak' extension."

echo -e "\n${YELLOW}💡 Next Steps:${NC}"
echo "   1. Review the changes with: ${GREEN}git diff${NC}"
echo "   2. If the changes are correct, remove the backup files with:"
echo "      ${GREEN}find . -name '*.js.bak' -exec rm {} \\;${NC}"
