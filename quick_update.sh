#!/bin/bash

# --- Configuration ---
set -e # Exit immediately if a command exits with a non-zero status.

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$HOME/star_kanri_bot"

# --- Error Handling ---
handle_error() {
    local exit_code=$?
    echo -e "${RED}❌ エラーが発生しました (終了コード: $exit_code, 行番号: $1)。処理を中止します。${NC}"
    # エラー発生時にバックアップから自動復元
    if [ -d "$TEMP_BACKUP" ] && [ -f "scripts/backup_handler.sh" ]; then
        echo -e "${YELLOW}🔧 一時バックアップから復元を試みます...${NC}"
        if ./scripts/backup_handler.sh restore "$TEMP_BACKUP"; then
            echo -e "${GREEN}✅ バックアップからの復元が完了しました。${NC}"
        else
            echo -e "${RED}❌ バックアップからの復元に失敗しました。手動で確認してください: $TEMP_BACKUP${NC}"
        fi
        rm -rf "$TEMP_BACKUP"
    fi
    exit $exit_code
}
trap 'handle_error $LINENO' ERR

echo -e "${YELLOW}--- STAR管理Bot 緊急更新スクリプト ---${NC}"
echo "🎯 ローカルの変更を破棄し、GitHubの最新版に強制同期します。"

# --- 1. Pre-flight Checks ---
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}❌ プロジェクトディレクトリが見つかりません: $PROJECT_DIR${NC}"
  echo "💡 'init_server.sh' を使って初回セットアップを行ってください。"
  exit 1
fi
cd "$PROJECT_DIR"

# --- 2. Safe Backup of Critical Files ---
TEMP_BACKUP="/tmp/star_kanri_quick_update_backup_$$"
echo -e "\n${YELLOW}1. 重要ファイルを一時バックアップしています...${NC}"
if [ ! -f "scripts/backup_handler.sh" ]; then
    echo -e "${RED}❌ バックアップヘルパースクリプト 'scripts/backup_handler.sh' が見つかりません。${NC}"
    echo "💡 リポジトリが最新の状態であることを確認してください。"
    exit 1
fi
./scripts/backup_handler.sh backup "$TEMP_BACKUP"
echo -e "${GREEN}✅ バックアップ完了。${NC}"

# --- 3. Force Sync with GitHub ---
echo -e "\n${YELLOW}2. GitHubリポジトリと強制同期しています...${NC}"
git fetch origin
git reset --hard origin/master
git clean -fdx
echo -e "${GREEN}✅ 同期完了。ローカルは 'origin/master' の最新版と一致しました。${NC}"

# --- 4. Restore Critical Files ---
echo -e "\n${YELLOW}3. 重要ファイルを復元しています...${NC}"
./scripts/backup_handler.sh restore "$TEMP_BACKUP"
rm -rf "$TEMP_BACKUP"
echo -e "${GREEN}✅ 復元完了。${NC}"

# --- 5. Install Dependencies & Deploy Commands ---
echo -e "\n${YELLOW}4. 依存関係のインストールとコマンドのデプロイ...${NC}"
echo "📦 npm パッケージをインストール中..."
npm install --no-audit --no-fund

echo "📡 スラッシュコマンドをDiscordに登録中..."
node deploy-commands.js

# --- 6. Restart PM2 Process ---
echo -e "\n${YELLOW}5. Botプロセスを再起動しています...${NC}"
if command -v pm2 &> /dev/null && pm2 list | grep -q "star-kanri-bot"; then
  pm2 restart star-kanri-bot
  pm2 save
  echo -e "${GREEN}✅ Botが正常に再起動されました。${NC}"
else
  echo -e "${YELLOW}⚠️ PM2プロセスが見つかりません。手動で起動してください:${NC}"
  echo "   cd $PROJECT_DIR && pm2 start ecosystem.config.js"
fi

# --- 7. Final Message ---
echo -e "\n${GREEN}🎉 緊急更新がすべて完了しました！${NC}"
echo "💡 Botの状態は 'pm2 status' または 'pm2 logs star-kanri-bot' で確認できます。"
echo "💡 より詳細なオプションを持つ更新は './update.sh' を使用してください。"
