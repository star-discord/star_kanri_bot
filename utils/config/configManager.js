// utils/config/configManager.js
const { ICache } = require('./ICache');
const { IPersistence } = require('./IPersistence');
const { configSchema, CURRENT_SCHEMA_VERSION } = require('./schema');
const { migrate } = require('./migration');

/**
 * @typedef {import('./schema').Config} Config
 */

/**
 * 統合設定管理クラス
 * 全ての機能の設定を一元管理
 */
class ConfigManager {
  /**
   * @param {ICache} cache 
   * @param {IPersistence} storage 
   */
  constructor(cache, storage) {
    // safeGet/safeSet をインスタンスにバインド
    this.cache = cache;
    this.storage = storage;
  }

  cacheHits = 0;
  cacheMisses = 0;

  /**
   * 設定を取得
   * @param {string} guildId
   * @returns {Promise<Config>}
   */
  async get(guildId) {
    let config = this.cache.get(guildId);
    if (config) {
      console.log(`[ConfigManager] キャッシュヒット: ${guildId}`);
      this.cacheHits++;
      return config;
    }

    console.log(`[ConfigManager] ストレージからロード: ${guildId}`);
    config = await this.storage.load(guildId);

    if (config) {
      // ★★★ 移行処理をここに挿入 ★★★
      const migratedConfig = migrate({ ...config }); // 元データを壊さないようにコピー

      if (this.validate(migratedConfig)) {
        this.cacheMisses++;
        this.cache.set(guildId, migratedConfig);
        // 移行が行われた場合は保存
        if (migratedConfig._version !== (config._version || 1)) {
          await this.storage.save(guildId, migratedConfig);
        }
        return migratedConfig;
      } else {
        console.error(`[ConfigManager] 無効な設定データ: ${guildId}, 初期値を返します`);
        // 不正なデータの場合は初期値を返す（または修復を試みる）
        return this.defaultConfig();
      }
    }

    console.log(`[ConfigManager] 初期設定を生成: ${guildId}`);
    this.cacheMisses++;
    const initialConfig = this.defaultConfig();
    this.cache.set(guildId, initialConfig);
    await this.storage.save(guildId, initialConfig); // 初期値を永続化
    return initialConfig;
  }

  /**
   * 設定を保存
   * @param {string} guildId
   * @param {Config} config
   * @returns {Promise<void>}
   */
  async set(guildId, config) {
    if (!this.validate(config)) {
      throw new Error('設定データのバリデーションに失敗しました。');
    }
    console.log(`[ConfigManager] 設定を保存: ${guildId}`);
    this.cache.set(guildId, config);
    await this.storage.save(guildId, config);
  }

  /**
   * キャッシュを無効化
   * @param {string} guildId
   */
  invalidate(guildId) {
    console.log(`[ConfigManager] キャッシュを無効化: ${guildId}`);
    this.cache.invalidate(guildId);
  }

  /**
   * キャッシュヒット率を取得（デバッグ用）
   * @returns {number}
   */
  getCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : (this.cacheHits / total) * 100;
  }

  /**
   * 設定取得のセーフラップ
   * @param {string} guildId
   * @returns {Promise<Config|null>}
   */
  async safeGet(guildId) {
    try {
      return await this.get(guildId);
    } catch (err) {
      console.error(`[ConfigManager:safeGet] ${guildId} の設定取得失敗:`, err);
      return null;
    }
  }

  /**
   * 設定保存のセーフラップ
   * @param {string} guildId
   * @param {Config} config
   * @returns {Promise<boolean>}
   */
  async safeSet(guildId, config) {
    try {
      await this.set(guildId, config);
      return true;
    } catch (err) {
      console.error(`[ConfigManager:safeSet] ${guildId} の保存失敗:`, err);
      return false;
    }
  }


  /**
   * バリデーション
   * @private
   * @param {any} data
   * @returns {boolean}
   */
  validate(data) {
    try {
      configSchema.parse(data);
      return true;
    } catch (err) {
      console.error(`[ConfigManager] バリデーションエラー (${data?._version || 'unknown'}):`, {
        errors: err.errors?.map(e => `${e.path.join('.')}: ${e.message}`)
      });
      return false;
    }
  }

  /**
   * デフォルト設定
   * @private
   * @returns {Config}
   */
  defaultConfig() {
    // Zodスキーマでデフォルト値を生成し、最新バージョンを付与
    const defaults = configSchema.parse({});
    defaults._version = CURRENT_SCHEMA_VERSION;
    return defaults;
  }
}

module.exports = { ConfigManager };