#!/bin/bash

# Diagnostic Script for STAR管理Bot
# システム診断スクリプト - 問題発生時の状況確認用

# --- Configuration ---
set -e
shopt -s nullglob # Let globs expand to nothing if no match

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Project Directory
PROJECT_DIR="$HOME/star_kanri_bot"

# Recommendation Flags
RECOMMEND_INIT=false
RECOMMEND_GIT_REPAIR=false
RECOMMEND_CHECK_TOKEN=false
RECOMMEND_UPDATE=false
RECOMMEND_CHECK_JSON=false
RECOMMEND_PM2_INSTALL=false
RECOMMEND_PM2_START=false
RECOMMEND_NPM_INSTALL=false

# --- Helper Functions ---
print_header() {
    echo -e "\n${YELLOW}--- $1 ---${NC}"
}

# --- Check Functions ---

check_system_info() {
    print_header "📊 システム情報"
    echo "  ユーザー: $(whoami)"
    echo "  ホーム: $HOME"
    echo "  現在地: $(pwd)"
    echo "  日時: $(date)"
    echo "  ディスク使用量: $(df -h "$HOME" | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
}

check_project_structure() {
    print_header "📁 プロジェクト構造"
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "  ${RED}❌ プロジェクトディレクトリが見つかりません: $PROJECT_DIR${NC}"
        RECOMMEND_INIT=true
        return
    fi
    echo -e "  ${GREEN}✅ プロジェクトディレクトリ: 存在${NC}"

    ( # Run in a subshell to avoid changing directory
        cd "$PROJECT_DIR"
        
        # Check for essential files
        for file in package.json .env index.js devcmdup.js; do
            if [ -f "$file" ]; then
                size=$(ls -lh "$file" | awk '{print $5}')
                echo "    ✅ $file ($size)"
                if [ "$file" = ".env" ]; then
                    if grep -q "DISCORD_TOKEN=.*[^ ]" .env; then
                        echo "      - ✅ DISCORD_TOKEN: 設定済み"
                    else
                        echo "      - ❌ DISCORD_TOKEN: 未設定または空です"
                        RECOMMEND_CHECK_TOKEN=true
                    fi
                fi
            else
                echo "    ❌ $file: 見つかりません"
                RECOMMEND_UPDATE=true
            fi
        done

        # Check data directory
        if [ -d "data" ]; then
            file_count=$(find data -type f 2>/dev/null | wc -l)
            echo -e "    ✅ data/: 存在 ($file_count ファイル)"
        else
            echo -e "    ❌ data/: 見つかりません"
        fi
    )
}

check_git_status() {
    print_header "🔗 Gitステータス"
    if [ ! -d "$PROJECT_DIR/.git" ]; then
        echo -e "  ${RED}❌ .git ディレクトリが見つかりません。Gitリポジトリではありません。${NC}"
        RECOMMEND_GIT_REPAIR=true
        return
    fi

    (
        cd "$PROJECT_DIR"
        echo "  ブランチ: $(git branch --show-current 2>/dev/null || echo '不明')"
        echo "  最新コミット: $(git log --oneline -1 2>/dev/null || echo '不明')"
        echo "  リモート: $(git remote get-url origin 2>/dev/null || echo '不明')"
        
        # Check for local changes
        if ! git diff --quiet || ! git diff --cached --quiet; then
            changes=$(git status --porcelain | wc -l)
            echo -e "  ${YELLOW}⚠️ ローカルでの変更が ${changes} ファイルにあります。${NC}"
            RECOMMEND_UPDATE=true
        else
            echo -e "  ${GREEN}✅ ローカルでの変更はありません。${NC}"
        fi
    )
}

check_node_environment() {
    print_header "📦 Node.js 環境"
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        echo "  ✅ Node.js: $(node -v)"
    else
        echo -e "  ${RED}❌ Node.js: 未インストール${NC}"
    fi

    # Check npm
    if command -v npm >/dev/null 2>&1; then
        echo "  ✅ npm: v$(npm -v)"
    else
        echo -e "  ${RED}❌ npm: 未インストール${NC}"
    fi

    # Check node_modules
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        echo -e "  ${GREEN}✅ node_modules: 存在します${NC
