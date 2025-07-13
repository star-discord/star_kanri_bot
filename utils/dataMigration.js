// utils/dataMigration.js
const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('./fileHelper');

/**
 * データ移行クラス
 * Bot起動時に既存データを新式に自動移行
 */
class DataMigration {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.migrationVersion = '1.0.0';
  }

  /**
   * すべてのギルドデータの移行を実行
   * @param {import('discord.js').Client} client
   */
  async migrateAllGuilds(client) {
    console.log('🔄 データ移行処理を開始します...');

    if (!fs.existsSync(this.dataDir)) {
      console.log('📁 データディレクトリが存在しません。移行をスキップします。');
      return;
    }

    const guildDirs = fs.readdirSync(this.dataDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    console.log(`📊 移行対象ギルド数: ${guildDirs.length}`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const guildId of guildDirs) {
      try {
        const migrated = await this.migrateGuildData(guildId, client);
        if (migrated) {
          migratedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ ギルド移行エラー (${guildId}):`, error);
        errorCount++;
      }
    }

    console.log('✅ データ移行処理完了');
    console.log(`📈 結果: 移行済み ${migratedCount}件 / スキップ ${skippedCount}件 / エラー ${errorCount}件`);
  }

  /**
   * 個別ギルドデータの移行
   * @param {string} guildId
   * @param {import('discord.js').Client} client
   * @returns {boolean} 移行が実行されたかどうか
   */
  async migrateGuildData(guildId, client) {
    const guildDataPath = path.join(this.dataDir, guildId, `${guildId}.json`);

    if (!fs.existsSync(guildDataPath)) {
      console.log(`⚠️ データファイルが存在しません: ${guildId}`);
      return false;
    }

    let data;
    try {
      data = await readJSON(guildDataPath);
    } catch (error) {
      console.error(`❌ データ読み込みエラー (${guildId}):`, error);
      return false;
    }

    // 移行バージョンチェック
    if (data._migrationVersion === this.migrationVersion) {
      // 既に最新バージョンに移行済み
      return false;
    }

    console.log(`🔄 ギルドデータ移行中: ${guildId}`);

    // バックアップ作成
    await this.createBackup(guildDataPath);

    // 移行実行
    const migratedData = await this.performMigration(data, guildId, client);

    // 移行バージョンを記録
    migratedData._migrationVersion = this.migrationVersion;
    migratedData._migratedAt = new Date().toISOString();

    // 保存
    try {
      await writeJSON(guildDataPath, migratedData);
      console.log(`✅ ギルドデータ移行完了: ${guildId}`);
      return true;
    } catch (error) {
      console.error(`❌ 移行データ保存エラー (${guildId}):`, error);
      return false;
    }
  }

  /**
   * データのバックアップを作成
   * @param {string} filePath
   */
  async createBackup(filePath) {
    const backupDir = path.join(path.dirname(filePath), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const fileName = path.basename(filePath, '.json');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${fileName}_backup_${timestamp}.json`);

    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`📦 バックアップ作成: ${path.basename(backupPath)}`);
    } catch (error) {
      console.error(`❌ バックアップ作成失敗:`, error);
    }
  }

  /**
   * 実際の移行処理を実行
   * @param {object} data
   * @param {string} guildId
   * @param {import('discord.js').Client} client
   * @returns {object}
   */
  async performMigration(data, guildId, client) {
    const migratedData = { ...data };
    let migrationPerformed = false;

    // 1. star_config構造の移行
    if (this.needsStarConfigMigration(data)) {
      console.log(`  🔧 star_config構造を移行中...`);
      migratedData.star_config = this.migrateStarConfig(data);
      migrationPerformed = true;
    }

    // 2. 旧式adminRoleIds, notifyChannelIdの移行
    if (data.adminRoleIds || data.notifyChannelId) {
      console.log(`  🔧 旧式管理者設定を移行中...`);
      if (!migratedData.star_config) {
        migratedData.star_config = {};
      }

      if (data.adminRoleIds && !migratedData.star_config.adminRoleIds) {
        migratedData.star_config.adminRoleIds = Array.isArray(data.adminRoleIds) 
          ? data.adminRoleIds 
          : [data.adminRoleIds];
        delete migratedData.adminRoleIds;
      }

      if (data.notifyChannelId && !migratedData.star_config.notifyChannelId) {
        migratedData.star_config.notifyChannelId = data.notifyChannelId;
        delete migratedData.notifyChannelId;
      }

      migrationPerformed = true;
    }

    // 3. totsunaデータ構造の正規化
    if (data.totsuna && this.needsTotsunaStructureMigration(data.totsuna)) {
      console.log(`  🔧 凸スナデータ構造を移行中...`);
      migratedData.totsuna = this.migrateTotsunaStructure(data.totsuna);
      migrationPerformed = true;
    }

    // 4. 存在しないロール/チャンネルIDのクリーンアップ
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      await this.cleanupInvalidIds(migratedData, guild);
    }

    if (migrationPerformed) {
      console.log(`  ✅ 移行項目が実行されました`);
    } else {
      console.log(`  ℹ️ 移行不要でした`);
    }

    return migratedData;
  }

  /**
   * star_config構造の移行が必要かチェック
   * @param {object} data
   * @returns {boolean}
   */
  needsStarConfigMigration(data) {
    return !data.star_config && (data.adminRoleIds || data.notifyChannelId);
  }

  /**
   * star_config構造を移行
   * @param {object} data
   * @returns {object}
   */
  migrateStarConfig(data) {
    const starConfig = {};

    if (data.adminRoleIds) {
      starConfig.adminRoleIds = Array.isArray(data.adminRoleIds) 
        ? data.adminRoleIds 
        : [data.adminRoleIds];
    }

    if (data.notifyChannelId) {
      starConfig.notifyChannelId = data.notifyChannelId;
    }

    return starConfig;
  }

  /**
   * totsunaデータ構造の移行が必要かチェック
   * @param {object} totsunaData
   * @returns {boolean}
   */
  needsTotsunaStructureMigration(totsunaData) {
    // 古い形式: 直接配列やオブジェクト
    // 新しい形式: { instances: [...] }
    return !totsunaData.instances && (Array.isArray(totsunaData) || typeof totsunaData === 'object');
  }

  /**
   * totsunaデータ構造を移行
   * @param {object|array} totsunaData
   * @returns {object}
   */
  migrateTotsunaStructure(totsunaData) {
    if (totsunaData.instances) {
      // 既に新しい形式
      return totsunaData;
    }

    if (Array.isArray(totsunaData)) {
      // 配列形式から新しい形式に移行
      return { instances: totsunaData };
    }

    if (typeof totsunaData === 'object') {
      // オブジェクト形式から新しい形式に移行
      const instances = Object.values(totsunaData).filter(item => 
        item && typeof item === 'object' && item.id
      );
      return { instances };
    }

    return { instances: [] };
  }

  /**
   * 無効なロール/チャンネルIDをクリーンアップ
   * @param {object} data
   * @param {import('discord.js').Guild} guild
   */
  async cleanupInvalidIds(data, guild) {
    let cleanupPerformed = false;

    // star_configのロールIDクリーンアップ
    if (data.star_config?.adminRoleIds) {
      const validRoleIds = data.star_config.adminRoleIds.filter(roleId => 
        guild.roles.cache.has(roleId)
      );

      if (validRoleIds.length !== data.star_config.adminRoleIds.length) {
        const removedCount = data.star_config.adminRoleIds.length - validRoleIds.length;
        console.log(`  🧹 無効な管理者ロールID ${removedCount}件を削除しました`);
        data.star_config.adminRoleIds = validRoleIds;
        cleanupPerformed = true;
      }
    }

    // star_configのチャンネルIDクリーンアップ
    if (data.star_config?.notifyChannelId) {
      if (!guild.channels.cache.has(data.star_config.notifyChannelId)) {
        console.log(`  🧹 無効な通知チャンネルIDを削除しました`);
        delete data.star_config.notifyChannelId;
        cleanupPerformed = true;
      }
    }

    // totsunaデータのチャンネルIDクリーンアップ
    if (data.totsuna?.instances) {
      for (const instance of data.totsuna.instances) {
        if (instance.installChannelId && !guild.channels.cache.has(instance.installChannelId)) {
          console.log(`  🧹 無効な凸スナ設置チャンネルID (${instance.id}) を修正しました`);
          // 設置チャンネルが無効な場合はインスタンス自体を無効化
          instance.isInvalid = true;
          cleanupPerformed = true;
        }

        if (instance.replicateChannelIds) {
          const validChannelIds = instance.replicateChannelIds.filter(channelId =>
            guild.channels.cache.has(channelId)
          );

          if (validChannelIds.length !== instance.replicateChannelIds.length) {
            const removedCount = instance.replicateChannelIds.length - validChannelIds.length;
            console.log(`  🧹 無効な凸スナ複製チャンネルID ${removedCount}件を削除しました (${instance.id})`);
            instance.replicateChannelIds = validChannelIds;
            cleanupPerformed = true;
          }
        }
      }

      // 無効化されたインスタンスを削除
      const validInstances = data.totsuna.instances.filter(instance => !instance.isInvalid);
      if (validInstances.length !== data.totsuna.instances.length) {
        const removedCount = data.totsuna.instances.length - validInstances.length;
        console.log(`  🧹 無効な凸スナインスタンス ${removedCount}件を削除しました`);
        data.totsuna.instances = validInstances;
        cleanupPerformed = true;
      }
    }

    if (cleanupPerformed) {
      console.log(`  ✅ 無効IDクリーンアップ完了`);
    }
  }
}

module.exports = { DataMigration };
