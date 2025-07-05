#!/bin/bash

echo "📦 Bot 更新処理を開始..."

# 定数
ZIP_FILE=~/chat_gpt_bot.zip
BOT_DIR=~/chat_gpt_bot
BOT_NAME=chat_gpt_bot

# 1. bot 停止
echo "🛑 Bot 停止..."
pm2 stop "$BOT_NAME"

# 2. 古いフォルダ削除
echo "🧹 古いフォルダ削除..."
rm -rf "$BOT_DIR"

# 3. ZIP 解凍
echo "📂 ZIP 解凍..."
unzip -o "$ZIP_FILE" -d "$BOT_DIR"

# 4. ZIP 削除
echo "🗑️ ZIP 削除..."
rm -f "$ZIP_FILE"

# 5. コマンド再デプロイ
echo "📡 コマンド再デプロイ & 依存パッケージインストール..."
cd "$BOT_DIR"
npm install
node deploy-commands.js

# 6. PM2 再起動（存在しなければ start）
echo "🚀 PM2 再起動..."
pm2 restart "$BOT_NAME" || pm2 start index.js --name "$BOT_NAME"

# 7. pm2 保存
pm2 save

echo "✅ Bot 更新完了 🎉"
