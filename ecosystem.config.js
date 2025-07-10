// ecosystem.config.js
require('dotenv').config(); // ← .env 読み込み

module.exports = {
  apps: [
    {
      name: "keihi-bot",             // PM2で表示されるアプリ名
      script: "./index.js",          // 起動スクリプト
      watch: false,                  // 変更監視（falseが安全）

      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }
    }
  ]
};
