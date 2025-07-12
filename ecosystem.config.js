// ecosystem.config.js
require('dotenv').config(); // ↁE.env 読み込み

module.exports = {
  apps: [
    {
      name: "star-kanri-bot",             // PM2で表示されるアプリ吁E      script: "./index.js",          // 起動スクリプト
      watch: false,                  // 変更監視！Ealseが安�E�E�E
      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }
    }
  ]
};
