#!/bin/bash

echo "🚀 star_kanri_bot 更新処理開始"

# dataフォルダのみバックアップ
DATE=$(date '+%Y%m%d_%H%M')
BACKUP_DIR="$HOME/star_kanri_bot_data_backup_$DATE"
echo "📁 dataフォルダのバックアップ作成: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r ~/star_kanri_bot/data "$BACKUP_DIR"

# 更新処理
cd ~/star_kanri_bot || exit 1

echo "🔄 Git Pull 実行"
git pull origin main || {
  echo "❌ git pull 失敗。処理を中止します。"
  exit 1
}

echo "📦 npm install 実行"
npm install

echo "📡 スラッシュコマンドをデプロイ中..."
node deploy-commands.js || {
  echo "❌ スラッシュコマンドのデプロイに失敗しました。"
  exit 1
}

echo "🔁 PM2 再起動"
pm2 restart star-kanri-bot
pm2 save

echo "📄 最新ログ（10行）"
pm2 logs star-kanri-bot --lines 10 --nostream

echo "✅ star_kanri_bot 更新完了"
