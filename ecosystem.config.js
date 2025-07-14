// ecosystem.config.js
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'star-kanri-bot',
      script: './index.js',

      // --- 実行オプション ---
      exec_mode: 'fork', // 1インスタンスで実行（Botには通常これで十分）
      instances: 1,

      // --- 監視と再起動 ---
      watch: false, // ファイル変更監視は無効（本番では手動更新が安全）
      ignore_watch: ['node_modules', 'data', 'logs', '*.bak', '*.md'], // 監視対象外
      autorestart: true, // クラッシュ時に自動で再起動
      restart_delay: 5000, // 5秒待ってから再起動（クラッシュループ防止）
      max_memory_restart: '256M', // メモリリーク対策

      // --- ログ設定 ---
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log', // エラーログのパス
      out_file: './logs/out.log', // 通常ログのパス

      // --- 環境変数 ---
      env: {
        NODE_ENV: 'production',
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  ],
};
