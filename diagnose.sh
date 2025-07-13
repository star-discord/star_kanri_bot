#!/bin/bash

# Diagnostic Script for STAR管理Bot
# システム診断スクリプト - 問題発生時の状況確認用

echo "🔍 STAR管理Bot システム診断"
echo "================================"

# 基本環境情報
echo "📊 システム情報:"
echo "  ユーザー: $(whoami)"
echo "  ホーム: $HOME"
echo "  現在地: $(pwd)"
echo "  日時: $(date)"
echo "  ディスク使用量: $(df -h $HOME | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"

echo ""
echo "🔧 インストール済みツール:"
for tool in git node npm pm2; do
  if command -v $tool > /dev/null 2>&1; then
    version=$($tool --version 2>/dev/null | head -1)
    echo "  ✅ $tool: $version"
  else
    echo "  ❌ $tool: 未インストール"
  fi
done

echo ""
echo "📂 ファイル・ディレクトリ状況:"
if [ -d ~/star_kanri_bot ]; then
  echo "  ✅ ~/star_kanri_bot: 存在"
  cd ~/star_kanri_bot
  
  echo "    📁 重要ファイル:"
  for file in package.json .env index.js deploy-commands.js; do
    if [ -f "$file" ]; then
      size=$(ls -lh "$file" | awk '{print $5}')
      echo "      ✅ $file ($size)"
    else
      echo "      ❌ $file: 見つかりません"
    fi
  done
  
  echo "    📁 data/:"
  if [ -d data ]; then
    file_count=$(find data -type f 2>/dev/null | wc -l)
    echo "      ✅ data/: 存在 ($file_count ファイル)"
  else
    echo "      ❌ data/: 見つかりません"
  fi
  
  echo "    🔗 Git状況:"
  if [ -d .git ]; then
    echo "      ブランチ: $(git branch --show-current 2>/dev/null || echo '不明')"
    echo "      最新コミット: $(git log --oneline -1 2>/dev/null || echo '不明')"
    echo "      リモート: $(git remote get-url origin 2>/dev/null || echo '不明')"
    
    # ローカル変更確認
    changes=$(git status --porcelain 2>/dev/null | wc -l)
    if [ "$changes" -gt 0 ]; then
      echo "      ⚠️ ローカル変更: $changes ファイル"
    else
      echo "      ✅ ローカル変更: なし"
    fi
  else
    echo "      ❌ Gitリポジトリではありません"
  fi
  
else
  echo "  ❌ ~/star_kanri_bot: 見つかりません"
fi

echo ""
echo "📦 PM2プロセス状況:"
if command -v pm2 > /dev/null 2>&1; then
  echo "  PM2バージョン: $(pm2 --version)"
  
  if pm2 list | grep -q "star-kanri-bot"; then
    echo "  ✅ star-kanri-bot プロセス: 実行中"
    pm2 show star-kanri-bot 2>/dev/null | grep -E "(status|uptime|restarts)" || true
  else
    echo "  ⚠️ star-kanri-bot プロセス: 見つかりません"
  fi
  
  echo "  登録済みプロセス:"
  pm2 list --no-color 2>/dev/null | head -5
else
  echo "  ❌ PM2: 未インストール"
fi

echo ""
echo "🌐 ネットワーク接続:"
if ping -c 1 github.com > /dev/null 2>&1; then
  echo "  ✅ GitHub接続: 正常"
else
  echo "  ❌ GitHub接続: 失敗"
fi

if ping -c 1 registry.npmjs.org > /dev/null 2>&1; then
  echo "  ✅ npm registry接続: 正常"
else
  echo "  ❌ npm registry接続: 失敗"
fi

echo ""
echo "📋 バックアップ状況:"
backup_count=$(ls -1d $HOME/star_kanri_bot_data_backup_* 2>/dev/null | wc -l)
if [ "$backup_count" -gt 0 ]; then
  echo "  ✅ バックアップ: $backup_count 個"
  echo "  最新: $(ls -t $HOME/star_kanri_bot_data_backup_* 2>/dev/null | head -1 | xargs basename)"
else
  echo "  ⚠️ バックアップ: 見つかりません"
fi

echo ""
echo "💡 推奨アクション:"
echo "================================"

if [ ! -d ~/star_kanri_bot ]; then
  echo "  1. 初回セットアップ:"
  echo "     git clone https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot"
elif [ ! -d ~/star_kanri_bot/.git ]; then
  echo "  1. Gitリポジトリ修復:"
  echo "     cd ~/star_kanri_bot && git init && git remote add origin https://github.com/star-discord/star_kanri_bot.git"
fi

if [ -d ~/star_kanri_bot ]; then
  echo "  2. 通常更新:"
  echo "     cd ~/star_kanri_bot && ./update.sh"
  echo "  3. 強制更新（問題がある場合）:"
  echo "     cd ~/star_kanri_bot && ./update.sh --force-sync"
  echo "  4. 緊急更新（最小限）:"
  echo "     cd ~/star_kanri_bot && ./quick_update.sh"
fi

if ! command -v pm2 > /dev/null 2>&1; then
  echo "  5. PM2インストール:"
  echo "     npm install -g pm2"
fi

echo ""
echo "🔍 診断完了 - $(date)"
