// utils/totusuna_setti/totusunaMigration.js

/**
 * totusuna 関連のデータ移行ロジック
 */
class TotusunaMigration {
  /**
   * 移行処理を実行
   * @param {object} data ギルドの全設定データ
   * @param {import('discord.js').Guild} guild
   * @returns {{data: object, modified: boolean}} 移行後のデータと変更フラグ
   */
  migrate(data, guild) {
    let modified = false;
    const migratedData = { ...data };

    // 1. totsunaデータ構造の正規化
    if (migratedData.totsuna && !migratedData.totsuna.instances) {
      console.log(`  [totusuna] 🔧 データ構造を { instances: [...] } 形式に移行中...`);
      migratedData.totsuna = { instances: Array.isArray(migratedData.totsuna) ? migratedData.totsuna : [] };
      modified = true;
    }

    // 2. 無効なIDをクリーンアップ
    if (guild && migratedData.totsuna?.instances) {
      const cleanupResult = this.cleanupInvalidIds(migratedData.totsuna, guild);
      if (cleanupResult.modified) {
        migratedData.totsuna = cleanupResult.config;
        modified = true;
      }
    }

    return { data: migratedData, modified };
  }

  cleanupInvalidIds(config, guild) {
    let modified = false;
    if (!config.instances) return { config, modified };

    const originalInstanceCount = config.instances.length;

    // 設置チャンネルが無効なインスタンスをフィルタリング
    config.instances = config.instances.filter(instance => {
      const isValid = instance.installChannelId && guild.channels.cache.has(instance.installChannelId);
      if (!isValid) {
        console.log(`  [totusuna] 🧹 無効な設置チャンネルを持つインスタンス(${instance.id})を削除`);
        modified = true;
      }
      return isValid;
    });

    // 各インスタンスの複製チャンネルをクリーンアップ
    for (const instance of config.instances) {
      if (instance.replicateChannelIds) {
        const validChannelIds = instance.replicateChannelIds.filter(id => guild.channels.cache.has(id));
        if (validChannelIds.length !== instance.replicateChannelIds.length) {
          console.log(`  [totusuna] 🧹 無効な複製チャンネルID ${instance.replicateChannelIds.length - validChannelIds.length}件を削除 (${instance.id})`);
          instance.replicateChannelIds = validChannelIds;
          modified = true;
        }
      }
    }

    return { config, modified };
  }
}

module.exports = new TotusunaMigration();