#!/bin/bash

# Diagnostic Script for STAR管理Bot
# システム診断スクリプト - 問題発生時の状況確認用

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# --- Helper Functions ---
print_header() {
    echo -e "\n${YELLOW}--- $1 ---${NC}"
}

# --- Check Functions ---

check_system_info() {
    print_header "📊 System Information"
    echo "  ユーザー: $(whoami)"
    echo "  ホーム: $HOME"
    echo "  現在地: $(pwd)"
    echo "  日時: $(date)"
    echo "  ディスク使用量: $(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
}

check_project_structure() {
    print_header "📁 Project Structure"
    if [ ! -d "index.js" ] && [ ! -f "package.json" ]; then
        echo -e "  ${RED}❌ Not in a valid project directory.${NC}"
        RECOMMEND_INIT=true
        return
    fi

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
}

check_git_status() {
    print_header "🔗 Git Status"
    if [ ! -d ".git" ]; then
        echo -e "  ${RED}❌ .git ディレクトリが見つかりません。Gitリポジトリではありません。${NC}"
        RECOMMEND_GIT_REPAIR=true
        return
    fi

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
}

check_node_environment() {
    print_header "📦 Node.js Environment"
    if command -v node >/dev/null 2>&1; then
        echo "  ✅ Node.js: $(node -v)"
    else
        echo -e "  ${RED}❌ Node.js: 未インストール${NC}"
    fi

    if command -v npm >/dev/null 2>&1; then
        echo "  ✅ npm: v$(npm -v)"
    else
        echo -e "  ${RED}❌ npm: 未インストール${NC}"
    fi

    if [ -d "node_modules" ]; then
        echo -e "  ${GREEN}✅ node_modules: 存在します${NC}"
    else
        echo -e "  ${RED}❌ node_modules: 見つかりません${NC}"
        RECOMMEND_NPM_INSTALL=true
    fi
}

check_pm2_status() {
    print_header "🚀 PM2 Process Status"
    if ! command -v pm2 >/dev/null 2>&1; then
        echo -e "  ${RED}❌ PM2: 未インストール${NC}"
        RECOMMEND_PM2_INSTALL=true
        return
    fi

    echo "  PM2バージョン: $(pm2 --version)"
    if pm2 describe star-kanri-bot > /dev/null 2>&1; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name == "star-kanri-bot") | .pm2_env.status')
        if [ "$STATUS" = "online" ]; then
            UPTIME=$(pm2 describe star-kanri-bot | grep Uptime | awk '{print $4}')
            RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name == "star-kanri-bot") | .pm2_env.restart_time')
            echo -e "  ${GREEN}✅ star-kanri-bot プロセス: オンライン (稼働時間: $UPTIME, 再起動: ${RESTARTS}回)${NC}"
        else
            echo -e "  ${RED}❌ star-kanri-bot プロセス: オフライン (状態: $STATUS)${NC}"
            RECOMMEND_PM2_START=true
        fi
    else
        echo -e "  ${YELLOW}⚠️ star-kanri-bot プロセス: PM2に未登録${NC}"
        RECOMMEND_PM2_START=true
    fi
}

check_network_connectivity() {
    print_header "🌐 Network Connectivity"
    check_ping() {
        if ping -c 1 "$1" >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ $2 接続: 正常${NC}"
        else
            echo -e "  ${RED}❌ $2 接続: 失敗${NC}"
        fi
    }
    check_ping "github.com" "GitHub"
    check_ping "registry.npmjs.org" "npm registry"
    check_ping "gateway.discord.gg" "Discord Gateway"
}

check_json_syntax() {
    print_header "🗂️ Data File Syntax Check"
    if ! command -v jq > /dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠️ jq が未インストールのためスキップします。 (sudo apt-get install jq)${NC}"
        return
    fi

    if [ ! -d "data" ]; then
        echo "  ✅ dataディレクトリが存在しないためスキップします。"
        return
    fi

    json_files=$(find "data" -type f -name "*.json")
    if [ -z "$json_files" ]; then
        echo "  ✅ JSONファイルが見つかりません。"
        return
    fi

    error_found=false
    echo "  🔍 JSONファイルの構文をチェック中..."
    for file in $json_files; do
        if ! jq -e . >/dev/null 2>&1 < "$file"; then
            echo -e "    ${RED}❌ ${file}:${NC} 構文エラー"
            error_found=true
            RECOMMEND_CHECK_JSON=true
        fi
    done
    [ "$error_found" = false ] && echo -e "  ${GREEN}✅ すべてのJSONファイルの構文は正常です。${NC}"
}

print_recommendations() {
    print_header "💡 Recommended Actions"
    ACTION_COUNT=0
    if [ "$RECOMMEND_INIT" = true ]; then
        echo "  - プロジェクトが存在しません。初回セットアップを実行してください: ${GREEN}./init_server.sh${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_GIT_REPAIR" = true ]; then
        echo "  - Gitリポジトリが破損しています。修復を試みてください: ${GREEN}./sync_from_github.sh --force${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_CHECK_TOKEN" = true ]; then
        echo "  - Discord Botのトークンが設定されていません。'.env'ファイルを確認してください: ${GREEN}nano .env${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_UPDATE" = true ]; then
        echo "  - ファイルが不足しているか、ローカルでの変更があります。更新スクリプトの実行を推奨します: ${GREEN}./update.sh${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_NPM_INSTALL" = true ]; then
        echo "  - 依存パッケージがインストールされていません: ${GREEN}npm install${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_CHECK_JSON" = true ]; then
        echo "  - 構文エラーのあるJSONファイルが見つかりました。手動で修正してください。"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_PM2_INSTALL" = true ]; then
        echo "  - プロセス管理ツールPM2がインストールされていません: ${GREEN}sudo npm install -g pm2${NC}"
        ((ACTION_COUNT++))
    fi
    if [ "$RECOMMEND_PM2_START" = true ] && [ "$RECOMMEND_PM2_INSTALL" = false ]; then
        echo "  - Botプロセスが停止または未登録です。起動または再起動してください: ${GREEN}pm2 restart ecosystem.config.js --update-env${NC}"
        ((ACTION_COUNT++))
    fi

    if [ $ACTION_COUNT -eq 0 ]; then
        echo -e "  ${GREEN}✅ 問題は見つかりませんでした。システムは正常です。${NC}"
    fi
}

# --- Main Execution ---
main() {
    print_header "🔍 STAR管理Bot システム診断"
    check_system_info
    check_project_structure
    check_git_status
    check_node_environment
    check_pm2_status
    check_network_connectivity
    check_json_syntax
    print_recommendations
    echo -e "\n${GREEN}🔍 診断完了 - $(date)${NC}"
}

main
