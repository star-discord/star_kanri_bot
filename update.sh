#!/bin/bash

echo "🚀 star_kanri_bot 更新処理開始 (Google Cloud Instance版)"

# エラー時に処理を停止
set -e

# 関数定義: エラーハンドリング
handle_error() {
    echo "❌ エラーが発生しました。行番号: $1"
    echo "💡 トラブルシューティング:"
    echo "   1. インターネット接続を確認"
    echo "   2. ディスク容量を確認: df -h"
    echo "   3. 権限を確認: ls -la ~/star_kanri_bot/"
    echo "   4. 強制修復: ./update.sh --force-sync"
    exit 1
}

# エラートラップを設定
trap 'handle_error $LINENO' ERR

# 環境チェック
echo "🔍 実行環境をチェック中..."
echo "ユーザー: $(whoami)"
echo "ホームディレクトリ: $HOME"
echo "現在のディレクトリ: $(pwd)"
echo "利用可能ディスク容量: $(df -h $HOME | tail -1 | awk '{print $4}')"

# コマンドライン引数チェック
FORCE_SYNC=false
SKIP_PM2=false
if [ "$1" = "--force-sync" ] || [ "$1" = "-f" ]; then
  FORCE_SYNC=true
  echo "⚡ 強制同期モード: すべてのローカル変更が破棄されます"
elif [ "$1" = "--skip-pm2" ] || [ "$1" = "-s" ]; then
  SKIP_PM2=true
  echo "⏭️ PM2スキップモード: PM2操作をスキップします"
fi

# 必要なコマンドの存在確認
echo "🔧 必要ツールの確認中..."
for cmd in git npm node pm2; do
    if ! command -v $cmd > /dev/null 2>&1; then
        echo "❌ $cmd がインストールされていません"
        if [ "$cmd" = "pm2" ]; then
            echo "💡 PM2インストール: npm install -g pm2"
        fi
        exit 1
    else
        echo "✅ $cmd: インストール済み"
    fi
done

# 古いバックアップフォルダを削除（最新3つのみ保持）
echo "🗑️ 古いバックアップフォルダを削除中..."
cd "$HOME" || exit 1

# バックアップフォルダの総数確認
BACKUP_DIRS=($(ls -td star_kanri_bot_data_backup_*/ 2>/dev/null || true))
TOTAL_BACKUPS=${#BACKUP_DIRS[@]}
echo "📊 現在のバックアップフォルダ数: ${TOTAL_BACKUPS}個"

if [ "$TOTAL_BACKUPS" -gt 3 ]; then
  DELETED_COUNT=0
  echo "🗑️ 最新3つを除いて削除開始..."
  echo "📌 保持対象: ${BACKUP_DIRS[0]%/} (最新)"
  echo "📌 保持対象: ${BACKUP_DIRS[1]%/} (第2)"
  echo "📌 保持対象: ${BACKUP_DIRS[2]%/} (第3)"
  
  for (( i=3; i<$TOTAL_BACKUPS; i++ )); do
    DIR_NAME="${BACKUP_DIRS[$i]%/}"
    if [ -d "$DIR_NAME" ]; then
      echo "  削除中: $DIR_NAME"
      if rm -rf "$DIR_NAME" 2>/dev/null; then
        ((DELETED_COUNT++))
      else
        echo "⚠️ 削除失敗: $DIR_NAME"
      fi
    fi
  done
  
  echo "✅ ${DELETED_COUNT}個のバックアップフォルダを削除完了"
else
  echo "📁 削除対象のバックアップフォルダはありません（最新3つまで保持）"
fi

# dataフォルダのみバックアップ（エラーハンドリング強化）
DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="$HOME/star_kanri_bot_data_backup_$DATE"
echo "📁 dataフォルダのバックアップ作成: $BACKUP_DIR"

if mkdir -p "$BACKUP_DIR"; then
  if [ -d ~/star_kanri_bot/data ]; then
    if cp -r ~/star_kanri_bot/data "$BACKUP_DIR/" 2>/dev/null; then
      echo "✅ dataフォルダのバックアップ完了"
    else
      echo "⚠️ dataフォルダのバックアップ中にエラーが発生（続行）"
    fi
  else
    echo "📂 ~/star_kanri_bot/data が存在しません（初回実行の可能性）"
  fi
else
  echo "❌ バックアップディレクトリの作成に失敗"
  exit 1
fi

# Git操作の事前チェック
check_git_repo() {
  if [ ! -d .git ]; then
    echo "❌ Gitリポジトリではありません"
    return 1
  fi
  
  # リモートリポジトリの接続確認
  if ! git ls-remote --heads origin > /dev/null 2>&1; then
    echo "❌ GitHubリポジトリに接続できません"
    echo "💡 インターネット接続を確認してください"
    return 1
  fi
  
  return 0
}

# Botディレクトリの存在と中身確認（改善版）
if [ ! -d ~/star_kanri_bot ] || [ -z "$(ls -A ~/star_kanri_bot 2>/dev/null)" ]; then
  echo "📂 star_kanri_bot フォルダが存在しないか空です。git clone 実行します。"
  
  # 既存のディレクトリがある場合は削除
  if [ -d ~/star_kanri_bot ]; then
    echo "🗑️ 空のディレクトリを削除中..."
    rm -rf ~/star_kanri_bot
  fi
  
  echo "📥 GitHubからクローン中..."
  if git clone --branch master --depth 1 https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot; then
    echo "✅ git clone 成功"
    cd ~/star_kanri_bot || exit 1
    chmod +x update.sh sync_from_github.sh
    echo "🔓 実行権限を付与完了"
  else
    echo "❌ git clone 失敗"
    echo "� ネットワーク接続またはGitHub接続を確認してください"
    exit 1
  fi
else
  echo "�📂 star_kanri_bot フォルダが存在し、中身があります。GitHub最新版に同期します。"
  cd ~/star_kanri_bot || exit 1
  
  # Gitリポジトリの健全性チェック
  if ! check_git_repo; then
    echo "🔧 Gitリポジトリを再初期化します..."
    cd "$HOME" || exit 1
    if [ -d ~/star_kanri_bot ]; then
      mv ~/star_kanri_bot ~/star_kanri_bot_corrupted_$(date +%s)
      echo "📁 破損したリポジトリを移動しました"
    fi
    
    echo "📥 新しいクローンを作成中..."
    git clone --branch master --depth 1 https://github.com/star-discord/star_kanri_bot.git ~/star_kanri_bot
    cd ~/star_kanri_bot || exit 1
    chmod +x update.sh sync_from_github.sh
    echo "✅ 新しいリポジトリでの再初期化完了"
  else
    # 現在の状態確認
    echo "📊 同期前の状態確認..."
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'detached')
    CURRENT_COMMIT=$(git log --oneline -1 2>/dev/null || echo 'unknown')
    echo "現在のブランチ: $CURRENT_BRANCH"
    echo "最新コミット: $CURRENT_COMMIT"
    
    # 変更状況を表示
    echo "💾 現在の変更状況を確認中..."
    CHANGES=$(git status --porcelain 2>/dev/null || echo "")
    if [ -n "$CHANGES" ]; then
      echo "⚠️ 検出されたローカル変更:"
      echo "$CHANGES"
      
      # 重要ファイルの自動保護
      protect_important_files() {
        local protected_count=0
        
        # .envファイルの保護
        if [ -f .env ] && echo "$CHANGES" | grep -q ".env"; then
          cp .env .env.backup
          echo "� .envファイルを自動保護"
          ((protected_count++))
        fi
        
        # 認証ファイルの保護
        for file in star-discord-bot-*.json data/star-discord-bot-*.json; do
          if [ -f "$file" ] && echo "$CHANGES" | grep -q "$file"; then
            cp "$file" "${file}.backup"
            echo "🔐 認証ファイルを自動保護: $file"
            ((protected_count++))
          fi
        done
        
        if [ $protected_count -gt 0 ]; then
          echo "✅ $protected_count 個の重要ファイルを保護しました"
        fi
      }
      
      protect_important_files
    else
      echo "✅ ローカル変更なし、安全に同期できます"
    fi
    
    echo ""
    echo "🔄 GitHubから最新版を取得中..."
    
    # Git fetch with timeout and retry
    fetch_with_retry() {
      local max_attempts=3
      local attempt=1
      
      while [ $attempt -le $max_attempts ]; do
        echo "🔄 Git fetch 実行中... (試行 $attempt/$max_attempts)"
        
        if timeout 30 git fetch origin master 2>/dev/null; then
          echo "✅ Git fetch 成功"
          return 0
        else
          echo "⚠️ Git fetch 失敗 (試行 $attempt/$max_attempts)"
          if [ $attempt -lt $max_attempts ]; then
            echo "⏳ 5秒後に再試行..."
            sleep 5
          fi
          ((attempt++))
        fi
      done
      
      echo "❌ Git fetch に失敗しました"
      return 1
    }
    
    if ! fetch_with_retry; then
      echo "💡 ネットワークまたはGitHub接続に問題があります"
      exit 1
    fi
    
    # ブランチを確実にmasterに切り替え
    if ! git checkout master 2>/dev/null; then
      echo "🔧 masterブランチの強制チェックアウト中..."
      git checkout -f master
    fi
  
  if [ "$FORCE_SYNC" = true ]; then
    # 完全同期モード（改善版）
    echo "⚡ 完全同期実行中（すべてのローカル変更を破棄）..."
    
    # 重要ファイルの一時バックアップ
    TEMP_BACKUP="/tmp/star_kanri_backup_$$"
    mkdir -p "$TEMP_BACKUP"
    
    echo "🔐 重要ファイルを一時保護中..."
    
    # .envファイル
    if [ -f .env ]; then
      cp .env "$TEMP_BACKUP/"
      echo "  📋 .env"
    fi
    
    # dataフォルダ
    if [ -d data ]; then
      cp -r data "$TEMP_BACKUP/"
      echo "  📦 data/"
    fi
    
    # Google Cloud認証ファイル
    for pattern in "star-discord-bot-*.json" "data/star-discord-bot-*.json"; do
      for file in $pattern; do
        if [ -f "$file" ]; then
          mkdir -p "$TEMP_BACKUP/$(dirname "$file")"
          cp "$file" "$TEMP_BACKUP/$file"
          echo "  🔐 $file"
        fi
      done
    done
    
    # 完全リセット実行
    if git reset --hard origin/master; then
      echo "✅ git reset --hard 成功"
    else
      echo "❌ git reset --hard 失敗"
      echo "💡 リポジトリが破損している可能性があります"
      exit 1
    fi
    
    # 不要ファイルクリーンアップ
    echo "🧹 不要ファイルをクリーンアップ中..."
    git clean -fdx
    
    # 重要ファイルの復元
    echo "📥 重要ファイルを復元中..."
    
    if [ -f "$TEMP_BACKUP/.env" ]; then
      mv "$TEMP_BACKUP/.env" .env
      echo "  📋 .env 復元完了"
    fi
    
    if [ -d "$TEMP_BACKUP/data" ]; then
      mv "$TEMP_BACKUP/data" data
      echo "  📦 data/ 復元完了"
    fi
    
    # 認証ファイル復元
    for file in "$TEMP_BACKUP"/star-discord-bot-*.json "$TEMP_BACKUP"/data/star-discord-bot-*.json; do
      if [ -f "$file" ]; then
        target_file="${file#$TEMP_BACKUP/}"
        mkdir -p "$(dirname "$target_file")"
        mv "$file" "$target_file"
        echo "  🔐 $target_file 復元完了"
      fi
    done
    
    # 一時バックアップ削除
    rm -rf "$TEMP_BACKUP"
    
    echo "✅ GitHub最新版への完全同期完了"
  else
    # 通常更新モード（改善版）
    echo "📥 通常更新実行中..."
    
    # マージの実行
    if git merge origin/master --no-edit; then
      echo "✅ GitHub最新版への更新完了"
    else
      echo "⚠️ マージで競合が発生しました"
      echo ""
      echo "🔍 競合ファイル:"
      git status --porcelain | grep "^UU" || echo "詳細不明"
      echo ""
      echo "💡 解決方法:"
      echo "  1. 手動解決: git status で確認後、ファイルを編集"
      echo "  2. 強制同期: ./update.sh --force-sync"
      echo "  3. 完全リセット: rm -rf ~/star_kanri_bot && ./update.sh"
      exit 1
    fi
  fi
  
  echo ""
  echo "📊 同期後の状態:"
  echo "現在のブランチ: $(git branch --show-current)"
  echo "最新コミット: $(git log --oneline -1)"
  
  # 実行権限を設定（両方のスクリプトに常に権限付与）
  chmod +x update.sh
  if [ -f sync_from_github.sh ]; then
    chmod +x sync_from_github.sh
  fi
  echo "🔓 スクリプト実行権限を付与完了"
  fi
fi

# 依存関係インストール（改善版）
cd ~/star_kanri_bot || exit 1
echo ""
echo "📦 依存関係をインストール中..."

# package.jsonの存在確認
if [ ! -f package.json ]; then
  echo "❌ package.json が見つかりません"
  exit 1
fi

# npm cache の健全性チェック
echo "🔍 npm cache の確認中..."
if ! npm cache verify > /dev/null 2>&1; then
  echo "🧹 npm cache をクリーンアップ中..."
  npm cache clean --force
fi

# npm install with timeout and retry
install_with_retry() {
  local max_attempts=3
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    echo "📦 npm install 実行中... (試行 $attempt/$max_attempts)"
    
    if timeout 300 npm install --no-audit --no-fund; then
      echo "✅ npm install 成功"
      return 0
    else
      echo "⚠️ npm install 失敗 (試行 $attempt/$max_attempts)"
      if [ $attempt -lt $max_attempts ]; then
        echo "🧹 node_modules をクリーンアップして再試行..."
        rm -rf node_modules package-lock.json
        sleep 3
      fi
      ((attempt++))
    fi
  done
  
  echo "❌ npm install に失敗しました"
  return 1
}

if ! install_with_retry; then
  echo "💡 ネットワークまたはnpm設定に問題があります"
  echo "手動実行してください: cd ~/star_kanri_bot && npm install"
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

