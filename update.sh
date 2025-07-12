#!/bin/bash

echo "🚀 star_kanri_bot 更新処理開始"

# コマンドライン引数チェック
FORCE_SYNC=false
if [ "$1" = "--force-sync" ] || [ "$1" = "-f" ]; then
  FORCE_SYNC=true
  echo "⚡ 強制同期モード: すべてのローカル変更が破棄されます"
fi

# 古いバックアップフォルダを削除（最新2つのみ保持）
echo "🗑️ 古いバックアップフォルダを削除中..."
cd "$HOME" || exit 1

# バックアップフォルダの総数確認
cd "$HOME" || exit 1
BACKUP_DIRS=($(ls -td star_kanri_bot_data_backup_*/ 2>/dev/null))
TOTAL_BACKUPS=${#BACKUP_DIRS[@]}
echo "📊 現在のバックアップフォルダ数: ${TOTAL_BACKUPS}個"

if [ "$TOTAL_BACKUPS" -gt 2 ]; then
  DELETED_COUNT=0
  echo "🗑️ 最新2つを除いて削除開始..."
  echo "📌 保持対象: ${BACKUP_DIRS[0]%/} (最新)"
  echo "📌 保持対象: ${BACKUP_DIRS[1]%/} (予備)"
  
  i=2
  while [ $i -lt $TOTAL_BACKUPS ]; do
    DIR_NAME="${BACKUP_DIRS[$i]%/}"  # 末尾のスラッシュを除去
    if [ -d "$DIR_NAME" ]; then
      echo "  削除中: $DIR_NAME"
      if rm -rf "$DIR_NAME"; then
        DELETED_COUNT=`expr $DELETED_COUNT + 1`
      fi
    fi
    i=`expr $i + 1`
  done
  
  echo "✅ ${DELETED_COUNT}個のバックアップフォルダを削除完了"
  echo "📊 削除後のバックアップ数: $(ls -ld star_kanri_bot_data_backup_*/ 2>/dev/null | wc -l)個"
else
  echo "📁 削除対象のバックアップフォルダはありません（最新2つまで保持）"
fi

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
  # 初回クローン後にupdate.shの実行権限を付与
  cd ~/star_kanri_bot || exit 1
  chmod +x update.sh
else
  echo "📂 star_kanri_bot フォルダが存在し、中身があります。GitHub最新版に同期します。"
  cd ~/star_kanri_bot || exit 1
  
  # 現在の状態確認
  echo "📊 同期前の状態確認..."
  echo "現在のブランチ: $(git branch --show-current 2>/dev/null || echo 'unknown')"
  echo "最新コミット: $(git log --oneline -1 2>/dev/null || echo 'unknown')"
  
  # 現在の変更状況を表示
  echo "💾 現在の変更状況を確認中..."
  CHANGES=$(git status --porcelain 2>/dev/null)
  if [ -n "$CHANGES" ]; then
    echo "⚠️ 検出されたローカル変更:"
    echo "$CHANGES"
    
    if [ "$FORCE_SYNC" = false ]; then
      echo ""
      echo "🤔 ローカル変更が検出されました。どうしますか？"
      echo "1) 変更を保持して通常更新 (推奨)"
      echo "2) 変更を破棄して完全同期"
      echo "3) 処理を中止"
      read -p "選択してください (1-3): " choice
      
      case $choice in
        2)
          FORCE_SYNC=true
          echo "⚡ 完全同期モードに変更しました"
          ;;
        3)
          echo "❌ 処理を中止しました"
          exit 0
          ;;
        *)
          echo "📋 通常更新モードで続行します"
          ;;
      esac
    fi
  else
    echo "✅ ローカル変更なし、安全に同期できます"
  fi
  
  echo ""
  echo "🔄 GitHubから最新版を取得中..."
  git fetch origin master
  git checkout master
  
  if [ "$FORCE_SYNC" = true ]; then
    # 完全同期モード
    echo "⚡ 完全同期実行中（すべてのローカル変更を破棄）..."
    git reset --hard origin/master || {
      echo "❌ git reset --hard 失敗。処理を中止します。"
      exit 1
    }
    
    # 追跡されていないファイルも削除
    echo "🧹 不要ファイルをクリーンアップ中..."
    git clean -fdx
    
    echo "✅ GitHub最新版への完全同期完了"
  else
    # 通常更新モード
    echo "📥 通常更新実行中..."
    if git merge origin/master --no-edit; then
      echo "✅ GitHub最新版への更新完了"
    else
      echo "⚠️ マージで競合が発生しました。手動解決が必要です。"
      echo "💡 完全同期を行う場合は: ./update.sh --force-sync"
      exit 1
    fi
  fi
  
  echo ""
  echo "📊 同期後の状態:"
  echo "現在のブランチ: $(git branch --show-current)"
  echo "最新コミット: $(git log --oneline -1)"
  
  # update.shに実行権限を自動付与（最後に実行）
  # chmod +x update.sh は最後に実行するため、ここではコメントアウト
  if [ -f sync_from_github.sh ]; then
    chmod +x sync_from_github.sh
  fi
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

# 最後にupdate.shの実行権限を付与（無限ループ防止のため最後に実行）
echo "🔧 スクリプト権限を最終設定中..."
chmod +x update.sh

echo "✅ star_kanri_bot 更新完了"

