# STAR ChatGPT Discord Bot

Discord上で ChatGPT (GPT-4) と自然に会話できる **STAR 管理Bot** です。  
メンション（`@Bot名`）やスラッシュコマンドで会話を開始できます。

---

## 🧠 主な機能

- `@Bot名` でメンションすると ChatGPT (GPT-4) が応答
- スラッシュコマンドで応答条件（トリガー語など）を設定可能
- モーダル入力・管理者制御にも対応（今後拡張予定）
- `OpenAI API` を活用した非同期応答
- `.env` による簡易設定と `PM2` による永続運用
- `update_bot.sh` による自動更新スクリプト付き

---

## 🚀 セットアップ手順

### 1. 前提条件

- Node.js v18以上
- Discord Bot のトークン・Client ID
- OpenAI API キー（https://platform.openai.com/）

### 2. 初期構築

```
git clone https://github.com/star-discord/chat_gpt_bot.git
cd chat_gpt_bot/chat_gpt_bot

npm install
cp .env.example .env
# .env を編集（下記を参考）
```

#　🔧 .env 設定例

```
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=your_discord_client_id_here
OPENAI_API_KEY=your_openai_api_key_here
GUILD_ID=your_discord_guild_id_here  # 開発時のみ
```

💡 使用方法
1. コマンド登録
```
node deploy-commands.js
```
2. Bot 起動（通常）
```
node index.js
```
または PM2 経由で永続化：
```
pm2 start ecosystem.config.js
```

🛠 スクリプト一覧
| スクリプト名               | 説明                  |
| -------------------- | ------------------- |
| `index.js`           | メインBot起動            |
| `deploy-commands.js` | スラッシュコマンド登録         |
| `update_bot.sh`      | Git Pull & 再起動スクリプト |

📌 今後の開発予定（ToDo）
会話履歴の保持（短期的記憶対応）

/chatgpt コマンドで直接会話入力

モーダルでの質問受付 UI

ロール別制限（特定ユーザーのみ使用可）




