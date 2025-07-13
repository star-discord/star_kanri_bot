# STAR管理Bot 開発ドキュメント

## プロジェクト概要

STAR管理Botは、Discord用の多機能管理ボットです。KPI管理、凸スナ（突発スナック報告）システム、ChatGPT連携機能を統合しています。

## 実装コマンド一覧

### 管理系コマンド
- `/star管理bot設定` - 管理者ロールと通知チャンネルの設定
- `/star管理bot_仕様書` - ボットの仕様書表示

### KPI管理系
- `/kpi_設定` - KPI報告の案内メッセージ送信
- `/kpi_setting` - KPI設定用モーダル表示

### 凸スナ管理系
- `/凸スナ設置` - 凸スナ報告UIをチャンネルに設置
- `/凸スナ設定` - 設置済み凸スナの確認・編集
- `/凸スナcsv` - 今月の凸スナ報告CSV保存状況確認

### ChatGPT連携系
- `/star_chat_gpt_config` - ChatGPT設定管理
- `/star_chat_gpt_setti` - ChatGPT案内メッセージとボタン設置

## パッケージ構成

### 主要依存関係（package.json）
```json
{
  "dependencies": {
    "discord.js": "^14.x.x",
    "dotenv": "^16.x.x",
    "uuid": "^9.x.x",
    "exceljs": "^4.x.x",
    "@google-cloud/storage": "^6.x.x",
    "openai": "^3.x.x"
  },
  "devDependencies": {
    "node": "^20.19.3"
  }
}
```

### 外部サービス連携
- **Google Cloud Storage**: ファイルバックアップ・同期
- **OpenAI API**: ChatGPT機能
- **Discord API**: Bot基本機能

## アーキテクチャ

### ディレクトリ構造
```
project/
├── commands/              # スラッシュコマンド
├── events/                # Discord イベントハンドラ
├── utils/                 # ユーティリティ・ハンドラ
│   ├── permissions/       # 権限管理
│   ├── kpi_setti/        # KPI機能
│   ├── star_chat_gpt_setti/ # ChatGPT機能
│   ├── star_config/      # 設定管理
│   ├── totusuna_setti/   # 凸スナ機能
│   └── totusuna_config/  # 凸スナ設定
└── data/                 # データ保存ディレクトリ
```

### コア設計パターン

#### 1. ハンドラーローダーシステム
```javascript
// utils/handlerLoader.js
function loadHandlers(dirPath) {
  // 動的にハンドラを読み込み、customId/customIdStartでルーティング
}
```

#### 2. 権限管理システム
```javascript
// utils/permissions/requireAdmin.js
function requireAdmin(executeFunction) {
  // 管理者権限チェック後に実行関数をラップ
}
```

#### 3. インタラクション統合処理
```javascript
// utils/buttonsHandler.js, modalsHandler.js, selectsHandler.js
// 各インタラクションタイプを統一的に処理
```

## 文字化け問題と対処法

### 発生した問題
PowerShellを使用したファイル操作により、日本語文字が文字化けする問題が発生しました。

### 文字化けパターンの特定
以下のような特徴的な文字化けパターンを発見・修正しました：

#### パターン1: PowerShell由来の文字化け
```
修正前: めE, すE, ！E, 閁E, 冁E, 褁E, ↁE
修正後: め, す, ！, 閁, 冁, 褁, ↁ (正常な日本語文字)
```

#### パターン2: 絵文字の文字化け
```
修正前: �, 老E, 珁E
修正後: 🤖, ⚙️, 📣 (正常な絵文字)
```

#### パターン3: コメント行の破損
```
修正前: const { SlashCommand[破損]const content = `🤖 **ChatGPT案内**\n[...]
修正後: const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
```

### 対処法

#### 1. 検索パターンによる一括検出
```bash
grep -r "めE|すE|！E|閁E|冁E|褁E|ↁE|�E" --include="*.js" ./
```

#### 2. 段階的修正プロセス
1. **文字化けパターンの特定**: 正規表現で文字化け箇所を検索
2. **文脈の確認**: 前後のコードから正しい文字を推定
3. **置換修正**: 正確な文字列置換で修正
4. **構文チェック**: Node.js構文チェックで検証

#### 3. PowerShell使用禁止
```javascript
// 文字化け防止のため、PowerShell関連のコマンド実行を禁止
// 代替案: Node.js標準APIまたはUnix系コマンドを使用
```

### 修正されたファイル一覧
- `commands/star_chat_gpt_setti.js`: インポート文と絵文字の修正
- `utils/kpiFileUtil.js`: エラーメッセージ内の日本語修正
- `utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js`: モーダルタイトル絵文字修正
- `utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js`: ファイルパスコメントと絵文字修正

## データ管理

### JSON設定ファイル構造
```javascript
// data/<guildId>/<guildId>.json
{
  "star_config": {
    "adminRoleIds": ["role_id_1", "role_id_2"],
    "notifyChannelId": "channel_id"
  },
  "totsuna": {
    "instances": [
      {
        "id": "uuid",
        "userId": "user_id",
        "body": "報告内容",
        "installChannelId": "channel_id",
        "replicateChannelIds": ["channel_id_1"],
        "messageId": "message_id"
      }
    ]
  }
}
```

### CSV/Excel出力
- **凸スナ報告**: `data/<guildId>/<年月>-凸スナ報告.csv`
- **KPIデータ**: ExcelJS + Google Cloud Storage連携

## セキュリティ

### 環境変数管理
```bash
# .env
DISCORD_TOKEN=your_discord_bot_token
OPENAI_API_KEY=your_openai_api_key
GCS_BUCKET_NAME=your_gcs_bucket
GCP_PROJECT_ID=your_gcp_project
GCP_CREDENTIALS_JSON=path/to/service-account.json
```

### 権限制御
- 管理者コマンドは`requireAdmin`ミドルウェアで保護
- ロールベースのアクセス制御
- Ephemeralメッセージによるプライバシー保護

## デプロイメント

### PM2設定（ecosystem.config.js）
```javascript
module.exports = {
  apps: [{
    name: 'star_kanri_bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### Git管理
```bash
# リモートリポジトリ
git remote add origin https://github.com/star-discord/star_kanri_bot.git

# デプロイ
git add .
git commit -m "文字化け修正: 最終段階完了"
git push origin master
```

## トラブルシューティング

### 1. 文字化け発生時
1. `grep -r "めE|すE|！E" --include="*.js" ./` で検索
2. エディタでUTF-8エンコーディング確認
3. PowerShellではなくNode.jsやUnixコマンド使用

### 2. デプロイエラー
1. `node -c deploy-commands.js` で構文チェック
2. 環境変数の設定確認
3. Discord Bot Tokenの有効性確認

### 3. 権限エラー
1. `star_config.adminRoleIds`の設定確認
2. ボットの権限設定確認
3. チャンネル権限の確認

## 開発者向けガイド

### 新機能追加手順
1. `commands/`にスラッシュコマンド追加
2. `utils/`に対応するハンドラ作成
3. `handlerLoader.js`でルーティング設定
4. 権限が必要な場合は`requireAdmin`適用

### コード品質
- ESLint設定による一貫したコーディングスタイル
- JSDocによるドキュメント化
- エラーハンドリングの統一（`errorHelper.js`）

### テスト環境
- 開発用Discordサーバーでのテスト推奨
- ログレベルによるデバッグ情報出力
- PM2による本番環境監視

---

**最終更新**: 2025年7月13日  
**文字化け対応**: 完了（PowerShell由来の文字化けパターン修正）  
**機能状態**: 全機能正常動作確認済み
