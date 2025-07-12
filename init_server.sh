#!/bin/bash

echo "🔧 GCPインスタンス初期化開始"

# タイムゾーン設定
echo "🕒 タイムゾーンを Asia/Tokyo に設定"
sudo timedatectl set-timezone Asia/Tokyo

# パッケージインストール
echo "📦 パッケージをインストール"
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip zip jq dos2unix

# Node.js 20.x インストール
echo "🟢 Node.js 20.x をインストール"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# pm2 インストール
echo "🧪 pm2 をグローバルインストール"
sudo npm install -g pm2

# ファイアウォールルール（すでにあれば無視）
echo "🌐 HTTPポート許可ルールを作成（すでにあればスキップ）"
gcloud compute firewall-rules create default-allow-http \
  --allow tcp:80 --source-ranges 0.0.0.0/0 --target-tags http-server || true

# Botディレクトリ作成 & リポジトリクローン
echo "📂 star_kanri_bot をクローン"
mkdir -p ~/star_kanri_bot
cd ~/star_kanri_bot

git clone https://github.com/star-discord/star_kanri_bot.git . || {
  echo "⚠️ Git clone 失敗（既に存在する可能性あり）"
}

# .env 設定
if [ ! -f .env ]; then
  if [ -f .env.sample ]; then
    cp .env.sample .env
    echo "⚠️ .env を作成しました。vim で編集してください。"
  else
    echo "⚠️ .env.sample が存在しないため、.env を手動で作成してください。"
  fi
fi

# パッケージインストール
echo "📦 npm install 実行"
npm install

# PM2起動 & 自動起動設定
echo "🚀 pm2 でBot起動"
pm2 start ecosystem.config.cjs || echo "⚠️ PM2起動に失敗しました。ecosystem.config.cjs を確認してください。"
pm2 save
pm2 startup | tee pm2-startup.log
eval "$(grep sudo pm2-startup.log | tail -1)"

echo "✅ 初期化完了 & Bot 起動済み"
echo "📜 ログ確認: pm2 logs"
echo "🔁 再起動: pm2 restart star-kanri-bot"
