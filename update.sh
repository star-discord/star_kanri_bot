#!/bin/bash

# エラー時に処理を停止
set -e

# --- Configuration ---
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
    if [ -d "$TEMP_BACKUP" ]; then
        echo -e "${YELLOW}🔧 一時バックアップから復元を試みます...${NC}"
        if [ -f "scripts/backup_handler.sh" ]; then
            if ./scripts/backup_handler.sh restore "$TEMP_BACKUP"; then
                echo -e "${GREEN}✅ バックアップからの復元が完了しました。${NC}"
            else
                echo -e "${RED}❌ バックアップからの復元に失敗しました。手動で確認してください: $TEMP_BACKUP${NC}"
            fi
        else
            echo -e "${RED}❌ バックアップヘルパースクリプトが見つかりません。手動で確認してください: $TEMP_BACKUP${NC}"
        fi
        rm -rf "$TEMP_BACKUP"
    fi
    exit $exit_code
}
# エラートラップを設定
trap 'handle_error $LINENO' ERR

echo -e "${GREEN}--- STAR管理Bot 更新スクリプト ---${NC}"

# コマンドライン引数チェック
FORCE_SYNC=false
SKIP_PM2=false
if [ "$1" = "--force-sync" ] || [ "$1" = "-f" ]; then
  FORCE_SYNC=true
  echo "⚡ 強制同期モードが有効です。ローカルの変更は破棄されます。"
elif [ "$1" = "--skip-pm2" ] || [ "$1" = "-s" ]; then
  SKIP_PM2=true
  echo "⏭️ PM2スキップモード: PM2操作をスキップします"
fi

# --- 1. Pre-flight Checks ---
echo -e "\n${YELLOW}1. 実行環境をチェック中...${NC}"
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo -e "${RED}❌ Gitリポジトリが見つかりません: $PROJECT_DIR${NC}"
  echo "💡 'init_server.sh' を使って初回セットアップを行ってください。"
  exit 1
fi
cd "$PROJECT_DIR"

# --- 2. Backup ---
TEMP_BACKUP="/tmp/star_kanri_update_backup_$$"
echo -e "\n${YELLOW}2. 重要ファイルを一時バックアップしています...${NC}"
if [ ! -f "scripts/backup_handler.sh" ]; then
    echo -e "${RED}❌ バックアップヘルパースクリプト 'scripts/backup_handler.sh' が見つかりません。${NC}"
    exit 1
fi
./scripts/backup_handler.sh backup "$TEMP_BACKUP"
echo -e "${GREEN}✅ バックアップ完了。${NC}"

# --- 3. Git Sync ---
echo -e "\n${YELLOW}3. GitHubリポジトリと同期しています...${NC}"
git fetch origin

if [ "$FORCE_SYNC" = true ]; then
  echo "⚡ 強制同期モード: ローカルの変更を破棄して同期します。"
  git reset --hard origin/master
  git clean -fdx
  echo -e "${GREEN}✅ 強制同期が完了しました。${NC}"
else
  echo "🔄 通常更新モード: 最新の変更を取り込みます。"
  if git merge origin/master --no-edit; then
    echo -e "${GREEN}✅ GitHub最新版への更新完了${NC}"
  else
    echo -e "${RED}⚠️ マージで競合が発生しました${NC}"
    echo "💡 競合を手動で解決するか、'./update.sh -f' で強制同期してください。"
    exit 1
  fi
fi

# --- 4. Restore Critical Files ---
echo -e "\n${YELLOW}4. 重要ファイルを復元しています...${NC}"
./scripts/backup_handler.sh restore "$TEMP_BACKUP"
rm -rf "$TEMP_BACKUP"
echo -e "${GREEN}✅ 復元完了。${NC}"

# --- 5. Install Dependencies & Deploy Commands ---
echo -e "\n${YELLOW}5. 依存関係のインストールとコマンドのデプロイ...${NC}"
if [ ! -f package.json ]; then
  echo -e "${RED}❌ package.json が見つかりません。リポジトリが破損している可能性があります。${NC}"
  exit 1
fi
echo "📦 npm パッケージをインストール中..."
npm install --no-audit --no-fund

if [ ! -f deploy-commands.js ]; then
  echo -e "${RED}❌ deploy-commands.js が見つかりません。リポジトリが破損している可能性があります。${NC}"
  exit 1
fi
echo "📡 スラッシュコマンドをDiscordに登録中..."
node deploy-commands.js

  exit 1
fi

# スラッシュコマンド登録（改善版）
echo ""
echo "📡 スラッシュコマンドをデプロイ中..."

# deploy-commands.jsの存在確認
if [ ! -f deploy-commands.js ]; then
  echo "❌ deploy-commands.js が見つかりません"
  exit 1
fi

# .envファイルの確認
if [ ! -f .env ]; then
  echo "⚠️ .env ファイルが見つかりません"
  echo "💡 DISCORD_TOKEN を設定してください"
fi

# デプロイ実行
if timeout 60 node deploy-commands.js; then
  echo "✅ スラッシュコマンドのデプロイ成功"
else
  echo "❌ スラッシュコマンドのデプロイに失敗しました"
  echo "💡 以下を確認してください:"
  echo "  - DISCORD_TOKEN が正しく設定されているか"
  echo "  - Botがサーバーに参加しているか"
  echo "  - インターネット接続が正常か"
  echo ""
  echo "手動実行: cd ~/star_kanri_bot && node deploy-commands.js"
  exit 1
fi

# ファイルの最新反映を確認
echo ""
echo "🔍 更新ファイルの確認中..."
CHECK_FILES=(
  "utils/totusuna_setti/buttons/install.js"
  "commands/star_config.js"
  "index.js"
)

for file in "${CHECK_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file (存在)"
  else
    echo "⚠️ $file (見つかりません)"
  fi
done

# PM2操作（スキップオプション対応）
if [ "$SKIP_PM2" = false ]; then
  echo ""
  echo "🔄 PM2 Botプロセスを再起動中..."
  
  # PM2プロセスの確認
  if command -v pm2 > /dev/null 2>&1; then
    # 既存のプロセス確認
    if pm2 list | grep -q "star-kanri-bot"; then
      echo "🧹 PM2ログをクリア中..."
      pm2 flush star-kanri-bot
      
      echo "🔁 PM2プロセス再起動中..."
      if pm2 restart star-kanri-bot; then
        pm2 save
        echo "✅ PM2再起動完了"
      else
        echo "❌ PM2再起動失敗"
        echo "💡 手動実行: pm2 restart star-kanri-bot"
      fi
    else
      echo "⚠️ star-kanri-bot プロセスが見つかりません"
      echo "💡 手動起動: pm2 start ecosystem.config.js"
    fi
  else
    echo "⚠️ PM2がインストールされていません"
    echo "💡 インストール: npm install -g pm2"
  fi
else
  echo "⏭️ PM2操作をスキップしました"
fi

# 最新バックアップからdataフォルダを復元（改善版）
echo ""
echo "📥 最新バックアップからdataフォルダを復元中..."

LATEST_BACKUP=$(ls -t "$HOME"/star_kanri_bot_data_backup_* 2>/dev/null | head -n 1)
if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/data" ]; then
  echo "復元元: $(basename "$LATEST_BACKUP")"
  
  # 現在のdataフォルダをバックアップ
  if [ -d ~/star_kanri_bot/data ]; then
    echo "🔄 現在のdataフォルダを一時退避中..."
    mv ~/star_kanri_bot/data ~/star_kanri_bot/data.old.$$
  fi
  
  # バックアップから復元
  if cp -r "$LATEST_BACKUP/data" ~/star_kanri_bot/; then
    echo "✅ dataフォルダの復元完了"
    
    # 古い一時ファイルを削除
    if [ -d ~/star_kanri_bot/data.old.$$ ]; then
      rm -rf ~/star_kanri_bot/data.old.$$
    fi
  else
    echo "❌ dataフォルダの復元に失敗"
    # 復元失敗時は元のdataフォルダを戻す
    if [ -d ~/star_kanri_bot/data.old.$$ ]; then
      mv ~/star_kanri_bot/data.old.$$ ~/star_kanri_bot/data
      echo "🔄 元のdataフォルダを復元しました"
    fi
  fi
else
  echo "⚠️ 復元可能なバックアップが見つかりません"
  if [ ! -d ~/star_kanri_bot/data ]; then
    echo "📁 新しいdataフォルダを作成します"
    mkdir -p ~/star_kanri_bot/data
  fi
fi

# 最終ステータス確認
echo ""
echo "🔍 更新後のシステム状況:"
echo "📂 ワーキングディレクトリ: $(pwd)"
echo "📦 package.json: $([ -f package.json ] && echo "存在" || echo "見つかりません")"
echo "📋 .env: $([ -f .env ] && echo "存在" || echo "見つかりません")"
echo "📁 data/: $([ -d data ] && echo "存在 ($(ls -1 data 2>/dev/null | wc -l) アイテム)" || echo "見つかりません")"

# PM2ログ確認（スキップされていない場合のみ）
if [ "$SKIP_PM2" = false ] && command -v pm2 > /dev/null 2>&1; then
  echo ""
  echo "📄 最新PM2ログ（最新20行）:"
  if pm2 logs star-kanri-bot --lines 20 --nostream 2>/dev/null; then
    :  # ログ表示成功
  else
    echo "⚠️ PM2ログの取得に失敗しました"
  fi
fi

echo ""
echo "✅ star_kanri_bot 更新処理完了"
echo ""
echo "💡 使用可能なオプション:"
echo "  ./update.sh          : 通常更新"
echo "  ./update.sh -f       : 強制同期（ローカル変更破棄）"
echo "  ./update.sh -s       : PM2操作スキップ"
echo ""
echo "🔧 トラブルシューティング:"
echo "  Bot起動確認: pm2 status"
echo "  ログ確認: pm2 logs star-kanri-bot"
echo "  手動起動: pm2 start ecosystem.config.js"
