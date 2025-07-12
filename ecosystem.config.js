// ecosystem.config.js
require('dotenv').config(); // 竊・.env 隱ｭ縺ｿ霎ｼ縺ｿ

module.exports = {
  apps: [
    {
      name: "star-kanri-bot",             // PM2縺ｧ陦ｨ遉ｺ縺輔ｌ繧九い繝励Μ蜷・      script: "./index.js",          // 襍ｷ蜍輔せ繧ｯ繝ｪ繝励ヨ
      watch: false,                  // 螟画峩逶｣隕厄ｼ・alse縺悟ｮ牙・・・
      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }
    }
  ]
};
