#!/bin/bash

echo "🚀 star_kanri_bot 更新処理開始"

# 古いバックアップフォルダを削除（最新3つのみ保持）
echo "🗑️ 古いバックアップフォルダを削除中..."
ls -t "$HOME"/star_kanri_bot_data_backup_* 2>/dev/null | tail -n +4 | xargs rm -rf

# dataフォルダのみバックアップ
DATE=$(date '+%Y%m%d_%H%M')
BACKUP_DIR="$HOME/star_kanri_bot_data_backup_$DATE"
echo "📁 dataフォルダのバックアップ作成: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
if [ -d ~/star_kanri_bot/data ]; then
  cp -r ~/star_kanri_bot/data "$BACKUP_DIR"
fi

# Botディレクトリの存在と中身確認
if [ ! -d ~/star_kanri_bot ] || [ -z "$(ls -A ~/star_kanri_bot)" ]; then
  echo "📂 star_kanri_bot フォルダが存在しないか空です。git clone 実行します。"
  git clone --branch master https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot || {
    echo "❌ git clone 失敗"
    exit 1
  }
else
  echo "📂 star_kanri_bot フォルダが存在し、中身があります。git pull 実行します。"
  cd ~/star_kanri_bot || exit 1
  git fetch origin master
  git checkout master
  git reset --hard origin/master || {
    echo "❌ git reset --hard 失敗。処理を中止します。"
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

# ファイルの最新反映を確認 (パス違い確認用)
echo "🔍 反映ファイルの一部内容を表示して確認"
HEAD_FILE="utils/totusuna_setti/buttons/install.js"
if [ -f "$HEAD_FILE" ]; then
  echo ">>> $HEAD_FILE の先頭10行"
  head -n 10 "$HEAD_FILE"
else
  echo "⚠️ $HEAD_FILE が存在しません。パスやクローン状態を確認してください。"
fi

# pm2再起動 (プロセス再起動＋キャッシュクリア)
echo "🔁 PM2 再起動"
pm2 restart star-kanri-bot
pm2 save

# 最新バックアップからdataフォルダを復元
echo "📥 最新バックアップからdataフォルダを復元中..."
LATEST_BACKUP=$(ls -t "$HOME"/star_kanri_bot_data_backup_* 2>/dev/null | head -n 1)
if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/data" ]; then
  echo "復元元: $LATEST_BACKUP"
  rm -rf ~/star_kanri_bot/data
  cp -r "$LATEST_BACKUP/data" ~/star_kanri_bot/
  echo "✅ dataフォルダの復元完了"
else
  echo "⚠️ 復元可能なバックアップが見つかりません"
fi

# ログ確認
echo "📄 最新ログ（50行）"
pm2 logs star-kanri-bot --lines 50 --nostream

echo "✅ star_kanri_bot 更新完了"

