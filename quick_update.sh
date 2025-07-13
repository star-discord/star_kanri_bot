#!/bin/bash

# Quick Update Script for Google Cloud Instance
# 簡易更新スクリプト - 緊急時やトラブル時に使用

echo "⚡ STAR管理Bot 緊急更新スクリプト"
echo "🎯 最小限の処理でBotを更新します"

# エラー時停止
set -e

# 基本チェック
if [ ! -d ~/star_kanri_bot ]; then
  echo "❌ ~/star_kanri_bot が見つかりません"
  echo "💡 初回セットアップ: git clone https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot"
  exit 1
fi

cd ~/star_kanri_bot || exit 1

echo "🔄 GitHub最新版を取得中..."

# Git操作（シンプル版）
git fetch origin master
git checkout master
git reset --hard origin/master

echo "📦 依存関係を更新中..."
npm install --no-audit --no-fund

echo "📡 スラッシュコマンドをデプロイ中..."
node deploy-commands.js

# PM2再起動（存在する場合のみ）
if command -v pm2 > /dev/null 2>&1 && pm2 list | grep -q "star-kanri-bot"; then
  echo "🔁 PM2再起動中..."
  pm2 restart star-kanri-bot
  pm2 save
else
  echo "⚠️ PM2プロセスが見つかりません"
  echo "💡 手動起動: pm2 start ecosystem.config.js"
fi

echo "✅ 緊急更新完了"
echo "💡 詳細な更新は ./update.sh を使用してください"
