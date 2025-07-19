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

  echo "  ✅ ~/star_kanri_bot: 存在"
  # サブシェル内で実行することで、スクリプト全体のカレントディレクトリを変更しないようにする
  (
    cd ~/star_kanri_bot
    echo "    📁 重要ファイル:"
    for file in package.json .env index.js devcmdup.js; do
      if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "      ✅ $file ($size)"
        # .envファイルの中身を特別にチェック
        if [ "$file" = ".env" ]; then
          # DISCORD_TOKENが設定されているか（空でないか）を確認
          grep -q "DISCORD_TOKEN=.*[^ ]" .env && echo "        - ✅ DISCORD_TOKEN: 設定済み" || echo "        - ❌ DISCORD_TOKEN: 未設定または空です"
        fi
      else
        echo "      ❌ $file: 見つかりません"
      fi
    done
    
    echo "    📁 data/:"
    if [ -d "data" ]; then
      file_count=$(find data -type f 2>/dev/null | wc -l)
      echo -e "      ${GREEN}✅ data/:${NC} 存在 ($file_count ファイル)"
    else
      echo -e "      ${RED}❌ data/:${NC} 見つかりません"
      RECOMMEND_UPDATE=true
    fi
    
    echo "    🔗 Git状況:"
    if [ -d ".git" ]; then
      echo "      ブランチ: $(git branch --show-current 2>/dev/null || echo '不明')"
      echo "      最新コミット: $(git log --oneline -1 2>/dev/null || echo '不明')"
      echo "      リモート: $(git remote get-url origin 2>/dev/null || echo '不明')"
      
      # ローカル変更確認
      changes=$(git status --porcelain 2>/dev/null | wc -l)
      if [ "$changes" -gt 0 ]; then
        echo -e "      ${YELLOW}⚠️ ローカル変更:${NC} $changes ファイル"
        RECOMMEND_UPDATE=true
      else
        echo -e "      ${GREEN}✅ ローカル変更:${NC} なし"
      fi
    else
      echo -e "      ${RED}❌ Gitリポジトリではありません${NC}"
      RECOMMEND_GIT_REPAIR=true
    fi
  )
else
  echo -e "  ${RED}❌ $PROJECT_DIR:${NC} 見つかりません"
  RECOMMEND_INIT=true
fi

print_header "🗂️ データファイル構文チェック"
if [ -d "$PROJECT_DIR/data" ] && command -v jq > /dev/null 2>&1; then
    json_files=$(find "$PROJECT_DIR/data" -type f -name "*.json")
    if [ -z "$json_files" ]; then
      echo "  ✅ JSONファイルが見つかりません。"
    else
      error_found=false
      echo "  🔍 JSONファイルの構文をチェック中..."
      for file in $json_files; do
        relative_path=${file#"$PROJECT_DIR/"}
        if jq -e . >/dev/null 2>&1 < "$file"; then
          : # 正常な場合は何も表示しない
        else
          echo -e "    ${RED}❌ ${relative_path}:${NC} 構文エラー"
          error_found=true
          RECOMMEND_CHECK_JSON=true
        fi
      done
      [ "$error_found" = false ] && echo -e "  ${GREEN}✅ すべてのJSONファイルの構文は正常です。${NC}"
    fi
elif ! command -v jq > /dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠️ jq が未インストールのためスキップします。 (sudo apt-get install jq)${NC}"
else
    echo "  ✅ dataディレクトリが存在しないためスキップします。"
fi

print_header "📦 PM2プロセス状況"
if command -v pm2 >/dev/null 2>&1; then
  echo "  PM2バージョン: $(pm2 --version)"
  
  # PM2のプロセスリストを取得
  PM2_STATUS=$(pm2 jlist 2>/dev/null)
  BOT_PROCESS=$(echo "$PM2_STATUS" | jq '.[] | select(.name == "star-kanri-bot")')

  if [ -n "$BOT_PROCESS" ]; then
    STATUS=$(echo "$BOT_PROCESS" | jq -r '.pm2_env.status')
    if [ "$STATUS" = "online" ]; then
      UPTIME=$(pm2 describe star-kanri-bot | grep Uptime | awk '{print $4}')
      RESTARTS=$(echo "$BOT_PROCESS" | jq -r '.pm2_env.restart_time')
      echo -e "  ${GREEN}✅ star-kanri-bot プロセス:${NC} オンライン (稼働時間: $UPTIME, 再起動: ${RESTARTS}回)"
    else
      echo -e "  ${RED}❌ star-kanri-bot プロセス:${NC} オフライン (状態: $STATUS)"
      RECOMMEND_PM2_START=true
      
      # エラーログを自動表示
      ERROR_LOG_PATH=$(echo "$BOT_PROCESS" | jq -r '.pm2_env.pm_err_log_path')
      if [ -f "$ERROR_LOG_PATH" ]; then
          echo -e "    ${YELLOW}直近のエラーログ (15行):${NC}"
          echo "    ----------------------------------------"
          tail -n 15 "$ERROR_LOG_PATH" | sed 's/^/    /'
          echo "    ----------------------------------------"
      fi
    fi
  else
    echo -e "  ${YELLOW}⚠️ star-kanri-bot プロセス:${NC} PM2に未登録"
    RECOMMEND_PM2_START=true
  fi
else
  echo -e "  ${RED}❌ PM2:${NC} 未インストール"
fi

print_header "🌐 ネットワーク接続"
check_ping() {
    local host=$1
    local name=$2
    if ping -c 1 "$host" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name 接続:${NC} 正常"
    else
        echo -e "  ${RED}❌ $name 接続:${NC} 失敗"
    fi
}
check_ping "github.com" "GitHub"
check_ping "registry.npmjs.org" "npm registry"

print_header "💡 推奨アクション"
ACTION_COUNT=0

if [ "$RECOMMEND_INIT" = true ]; then
    echo "  1. プロジェクトが存在しません。初回セットアップを実行してください:"
    echo -e "     ${GREEN}./init_server.sh${NC}"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_GIT_REPAIR" = true ]; then
    echo "  1. Gitリポジトリが破損しています。修復を試みてください:"
    echo -e "     ${GREEN}cd $PROJECT_DIR && ./sync_from_github.sh${NC}"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_CHECK_TOKEN" = true ]; then
    echo "  - Discord Botのトークンが設定されていません。'.env'ファイルを確認してください:"
    echo -e "     ${GREEN}nano ~/star_kanri_bot/.env${NC}"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_UPDATE" = true ]; then
    echo "  - ファイルが不足しているか、ローカルでの変更があります。更新スクリプトの実行を推奨します:"
    echo -e "     ${GREEN}cd ~/star_kanri_bot && ./update.sh${NC}"
    echo "     (問題が解決しない場合) ${GREEN}./update.sh --force-sync${NC}"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_CHECK_JSON" = true ]; then
    echo "  - 構文エラーのあるJSONファイルが見つかりました。手動で修正してください。"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_PM2_INSTALL" = true ]; then
    echo "  - プロセス管理ツールPM2がインストールされていません:"
    echo -e "     ${GREEN}sudo npm install -g pm2${NC}"
    ((ACTION_COUNT++))
fi

if [ "$RECOMMEND_PM2_START" = true ] && [ "$RECOMMEND_PM2_INSTALL" = false ]; then
    echo "  - Botプロセスが停止しています。起動または再起動してください:"
    echo -e "     ${GREEN}cd ~/star_kanri_bot && pm2 restart star-kanri-bot${NC}"
    echo "     (プロセスがない場合) ${GREEN}pm2 start ecosystem.config.js${NC}"
    ((ACTION_COUNT++))
fi

if [ $ACTION_COUNT -eq 0 ]; then
    echo -e "  ${GREEN}✅ 問題は見つかりませんでした。システムは正常です。${NC}"
fi

echo -e "\n${GREEN}🔍 診断完了 - $(date)${NC}"
