// utils/star_config/star_configMigration.js

/**
 * star_config 関連のデータ移行ロジック
 */
class StarConfigMigration {
  /**
   * 移行処理を実行
   * @param {object} data ギルドの全設定データ
   * @param {import('discord.js').Guild} guild
   * @returns {{data: object, modified: boolean}} 移行後のデータと変更フラグ
   */
  migrate(data, guild) {
    let modified = false;
    const migratedData = { ...data };

    // 1. 旧式のトップレベル設定を star_config に移行
    if (migratedData.adminRoleIds || migratedData.notifyChannelId) {
      console.log(`  [star_config] 🔧 旧式管理者設定を移行中...`);
      if (!migratedData.star_config) {
        migratedData.star_config = {};
      }

      if (migratedData.adminRoleIds && !migratedData.star_config.adminRoleIds) {
        migratedData.star_config.adminRoleIds = Array.isArray(migratedData.adminRoleIds)
          ? migratedData.adminRoleIds
          : [migratedData.adminRoleIds];
      }

      if (migratedData.notifyChannelId && !migratedData.star_config.notifyChannelId) {
        migratedData.star_config.notifyChannelId = migratedData.notifyChannelId;
      }
      // 移行元のキーを削除
      delete migratedData.adminRoleIds;
      delete migratedData.notifyChannelId;
      modified = true;
    }

    // 2. 無効なIDをクリーンアップ
    if (guild && migratedData.star_config) {
      const cleanupResult = this.cleanupInvalidIds(migratedData.star_config, guild);
      if (cleanupResult.modified) {
        migratedData.star_config = cleanupResult.config;
        modified = true;
      }
    }

    return { data: migratedData, modified };
  }

  cleanupInvalidIds(config, guild) {
    let modified = false;
    if (config.adminRoleIds) {
      const validRoleIds = config.adminRoleIds.filter(roleId => guild.roles.cache.has(roleId));
      if (validRoleIds.length !== config.adminRoleIds.length) {
        console.log(`  [star_config] 🧹 無効な管理者ロールID ${config.adminRoleIds.length - validRoleIds.length}件を削除`);
        config.adminRoleIds = validRoleIds;
        modified = true;
      }
    }
    if (config.notifyChannelId && !guild.channels.cache.has(config.notifyChannelId)) {
      console.log(`  [star_config] 🧹 無効な通知チャンネルIDを削除`);
      delete config.notifyChannelId;
      modified = true;
    }
    return { config, modified };
  }
}

module.exports = new StarConfigMigration();