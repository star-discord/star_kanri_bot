# STAR管理Bot 仕様書（凸スナ報告統合）

## 🔰 概要

**STAR管理Bot** は、Discord上で「凸スナ報告」や「管理ロール設定」など、クラン・ギルド運営に役立つ機能を統合したBotです。主に以下の機能を提供します：

- 凸スナ（凸スケジュール）設置・報告機能  
- 管理者ロール設定機能  
- 各種設定のボタン・モーダルUI対応  
- CSV形式による報告ログ保存  

ファイルベースでの永続化に対応し、Google Cloud や Render 等の Linux 環境に対応しています。

---

## 🧩 機能一覧

| 機能                  | 説明                                                                 |
|-----------------------|----------------------------------------------------------------------|
| /凸スナ設置           | 新しい凸スナ報告メッセージを、対話形式でチャンネルに設置します。        |
| /凸スナ設定           | 設置済みの凸スナを一覧表示し、本文の編集や再送信、削除ができます。       |
| 凸スナ報告ボタン      | 各種入力モーダルを開き、内容をCSVファイルに追記＋報告送信                   |
| /STAR管理bot設定     | 管理者ロールの追加・削除（RoleSelect UI対応）、リアクション設定など           |
| 設定UI（ボタン）      | UI上で「再送信」「削除」「編集」などを操作可能                            |

---

## 🗃️ データ構造と保存先

### 1. ギルド共通設定ファイル（JSON）

保存先：`data/<GUILD_ID>/<GUILD_ID>.json`

```json
{
  "star_config": {
    "adminRoleIds": ["1234567890", "9876543210"],
    "reaction": {
      "emoji": "⭐",
      "text": "報告ありがとう！"
    }
  },
  "totusuna": {
    "instances": [
      {
        "id": "uuid-v4",
        "title": "📣 凸スナ報告受付中",
        "body": "報告はこちらから！",
        "installChannelId": "99999999",
        "messageId": "1122334455",
        "replicateChannelIds": [],
        "createdBy": "123456789012345678",
        "createdAt": "2025-07-20T10:00:00.000Z"
      }
    ]
  }
}

2. 凸スナ報告CSVファイル
保存先：data/<GUILD_ID>/<GUILD_ID>-YYYY-MM-凸スナ報告.csv

列構成（初回のみヘッダー出力）：

報告者名,日時,何組,何名,卓1,卓2,卓3,卓4,詳細
Alice,2025-07-10T12:00:00Z,2組,3名,あ,B,C,D,詳細内容

🛠️ 使用コマンド詳細
✅ /凸スナ設置
ボタン＋本文UI表示

モーダルで本文入力 → 指定チャンネルにEmbed+ボタン投稿

保存：tousuna.instances に追記

✅ /凸スナ設定
セレクトメニューで設置済みの凸スナ一覧を表示。

選択後、詳細情報と「本文編集」「再送信」「削除」ボタンを表示。

各ボタンはそれぞれのハンドラ（`edit.js`, `resend.js`, `delete.js`）に連携。

保存：`totusunaConfigManager` を通じて `tousuna.instances` を更新または削除。

✅ 凸スナ報告ボタン
ボタンに紐づいたUUIDを元に、報告用のモーダルを表示。

モーダル送信後、報告内容を整形してEmbedを作成し、メインチャンネルと連携チャンネルに送信。

同時に、報告内容をCSVファイルに追記。

✅ /STAR管理bot設定
管理ロールを複数指定（RoleSelect）

リアクション絵文字・文言も設定可能

保存先：star_config.adminRoleIds, reaction

📁 ディレクトリ構成（簡易）

├── commands/
│   ├── tousuna_setti.js
│   ├── star_config/
│   │   └── star_config.js
│
├── utils/
│   ├── star_config/
│   │   ├── admin.js
│   │   └── buttons/
│   │       ├── 管理者ロール追加.js
│   │       └── 管理者ロール削除.js
│   ├── tousuna_setti/
│   │   ├── buttons/
│   │   │   ├── 再送信.js
│   │   │   ├── 本文入力をする.js
│   │   │   └── reportButton.js
│   │   ├── modals/
│   │   │   └── 本文入力をする.js
│   │   └── spreadSheet.js
│   └── buttonsHandler.js
│
├── data/
│   └── <GUILD_ID>/
│       ├── <GUILD_ID>.json
│       └── <GUILD_ID>-YYYY-MM-凸スナ報告.csv


⚙️ 運用・デプロイ構成（例）
.env 設定例
DISCORD_TOKEN=（Botのトークン）
CLIENT_ID=（BotのクライアントID）
GUILD_ID=（開発用ギルドID）

PM2 用 ecosystem.config.js
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "star-kanri-bot",
      script: "./index.js",
      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID
      }
    }
  ]
};

コマンド登録（deploy-commands.js）
node deploy-commands.js

🚀 今後の拡張案（ToDo）
| 拡張内容        | 補足説明                                  |
| ----------- | ------------------------------------- |
| KPI統合       | KPI報告モジュールと統合（既存 `/kpi_設置` との統合設計）    |
| 自動集計＋グラフ化   | 集計→Embed表示 or グラフ画像化（QuickChart API等） |
| GPT自動応答連携   | 「今の凸スナ報告は？」など自然言語で取得可能に               |
