#!/bin/bash

echo "🚀 star_kanri_bot 更新処理開始"

# dataフォルダのみバックアップ
DATE=$(date '+%Y%m%d_%H%M')
BACKUP_DIR="$HOME/star_kanri_bot_data_backup_$DATE"
echo "📁 dataフォルダのバックアップ作成: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r ~/star_kanri_bot/data "$BACKUP_DIR"

# Botディレクトリの存在と中身確認
if [ ! -d ~/star_kanri_bot ] || [ -z "$(ls -A ~/star_kanri_bot)" ]; then
  echo "📂 star_kanri_bot フォルダが存在しないか空です。git clone 実行します。"
  git clone https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot || {
    echo "❌ git clone 失敗"
    exit 1
  }
else
  echo "📂 star_kanri_bot フォルダが存在し、中身があります。git pull 実行します。"
  cd ~/star_kanri_bot || exit 1
  git pull origin main || {
    echo "❌ git pull 失敗。処理を中止します。"
    exit 1
  }
fi

# 依存関係インストール
cd ~/star_kanri_bot || exit 1
echo "📦 npm install 実行"
npm install

# スラッシュコマンド登録
echo "📡 スラッシュコマンドをデプロイ中..."
node deploy-commands.js || {
  echo "❌ スラッシュコマンドのデプロイに失敗しました。"
  exit 1
}

# pm2再起動
echo "🔁 PM2 再起動"
pm2 restart star-kanri-bot
pm2 save

# ログ確認
echo "📄 最新ログ（10行）"
pm2 logs star-kanri-bot --lines 10 --nostream

echo "✅ star_kanri_bot 更新完了"

