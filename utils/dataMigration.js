// utils/dataMigration.js
const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('./fileHelper');
const starConfigMigrator = require('./star_config/star_configMigration');
const totusunaMigrator = require('./totusuna_setti/totusunaMigration');

/**
 * データ移行クラス
 * Bot起動時に既存データを新式に自動移行
 */
class DataMigration {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.migrationVersion = '1.0';
    this.migrators = [
      starConfigMigrator,
      totusunaMigrator,
    ];
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
    let migratedData = { ...data };
    let migrationPerformed = false;

    const guild = client.guilds.cache.get(guildId);

    for (const migrator of this.migrators) {
      if (typeof migrator.migrate === 'function') {
        const result = migrator.migrate(migratedData, guild);
        migratedData = result.data;
        if (result.modified) {
          migrationPerformed = true;
        }
      }
    }

    if (migrationPerformed) {
      console.log(`  ✅ 1つ以上の移行項目が実行されました`);
    } else {
      console.log(`  ℹ️ 移行不要でした`);
    }

    return migratedData;
  }
}

module.exports = { DataMigration };
