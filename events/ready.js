// events/ready.js
const { Events } = require('discord.js');
const { DataMigration } = require('../utils/dataMigration');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * Bot 起動完了時のイベント
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    console.log(`✅ Bot 起動完了、ログイン: ${client.user.tag}`);
    console.log(`📡 現在接続中のサーバー数: ${client.guilds.cache.size}`);

    // データ移行処理を実行
    try {
      const migration = new DataMigration();
      await migration.migrateAllGuilds(client);
    } catch (error) {
      console.error('❌ データ移行処理でエラーが発生しました:', error);
    }

    console.log('🚀 Bot初期化処理完了 - 利用可能です！');
  },
};
