# STAR管理Bot 開発ドキュメント

## プロジェクト概要

STAR管理Botは、Discord用の多機能管理ボットです。KPI管理、凸スナ（突発スナック報告）システム、ChatGPT連携機能を統合しています。

---

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

---

## ディレクトリ構成

```
project/
├── commands/              # スラッシュコマンド
├── events/                # Discord イベントハンドラ
├── utils/                 # ユーティリティ・ハンドラ
│   ├── permissions/       # 権限管理
│   ├── kpi_setti/         # KPI機能
│   ├── star_chat_gpt_setti/ # ChatGPT機能
│   ├── star_config/       # 設定管理
│   ├── totusuna_setti/    # 凸スナ機能
│   └── totusuna_config/   # 凸スナ設定
└── data/                  # データ保存ディレクトリ
```

---

## 主要依存関係（package.json抜粋）

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

---

## アーキテクチャ・設計パターン

- **ハンドラーローダー**: customId/customIdStartで動的ルーティング
- **権限管理**: requireAdminミドルウェアで管理者コマンド保護
- **インタラクション統合**: buttonsHandler, modalsHandler, selectsHandlerで一元管理

---

## データ管理

### JSON設定ファイル構造

```json
{
  "star_config": {
    "adminRoleIds": ["role_id_1", "role_id_2"],
    "notifyChannelId": "channel_id"
  },
  "totusuna": {
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

---

## セキュリティ・運用

- **環境変数管理**: .envでトークンやAPIキーを管理
- **権限制御**: requireAdminで管理者のみ実行可能コマンドを制御
- **Ephemeralメッセージ**: プライバシー保護のために利用

---

## デプロイ・運用

- **PM2/Ecosystem**: `ecosystem.config.js`でプロセス管理
- **GitHub管理**: masterブランチで一元管理
- **トラブルシューティング**: エラー・警告は`copilot-エラー.md`に集約

---

## 開発・保守運用ルール

- 新機能追加時は`commands/`・`utils/`に分離実装
- ハンドラーは必ず`handle`関数をエクスポート
- エラー・警告は`copilot-エラー.md`に記録し再発防止
- PowerShellは使用禁止、Node.js/Unixコマンド推奨
- 文字化け発生時は正規表現で一括検出・修正

---

**最終更新**: 2025年7月14日
**エラー・運用ルール**: `copilot-エラー.md`に集約
**機能状態**: 全機能正常動作確認済み
