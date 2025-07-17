// utils/configManager.js
const { ensureGuildJSON, readJSON, writeJSON } = require('./fileHelper');
const { v4: uuidv4 } = require('uuid');
const { Mutex, withTimeout, E_TIMEOUT } = require('async-mutex');

/**
 * 排他制御付きラップ関数
 */
async function withLock(mutex, taskFn) {
  const release = await mutex.acquire();
  try {
    return await taskFn();
  } finally {
    release();
  }
}

/**
 * 統合設定管理クラス
 * 全ての機能の設定を一元管理
 */
class ConfigManager {
  constructor() {
    this.pathCache = new Map(); // ギルドごとのJSONパスをキャッシュ
    this.mutexes = new Map(); // ファイルパスごとのMutexインスタンスをキャッシュ
    this.configCache = new Map(); // ギルドごとの設定データをキャッシュ
    this.defaultConfig = {
      star: {
        adminRoleIds: [],
        notifyChannelId: null,
      },
      chatgpt: {
        apiKey: '',
        maxTokens: 150,
        temperature: 0.7,
        persona: null,
      },
      totusuna: {
        instances: []
      },
      kpi: {
        settings: {}
      }
    };
  }

  /**
   * ギルドのJSONファイルパスを取得（キャッシュ利用）
   * @param {string} guildId
   * @returns {Promise<string>}
   */
  async getJsonPath(guildId) {
    if (!this.pathCache.has(guildId)) {
      const path = await ensureGuildJSON(guildId);
      this.pathCache.set(guildId, path);
    }
    return this.pathCache.get(guildId);
  }

  /**
   * ギルド設定を取得
   * @param {string} guildId
   * @returns {Promise<object>}
   */
  async getGuildConfig(guildId) {
    if (this.configCache.has(guildId))  {
      return this.configCache.get(guildId);
    }
    const jsonPath = await this.getJsonPath(guildId);
    const config = await readJSON(jsonPath);
    const mergedConfig = this._mergeWithDefaults(config);
    this.configCache.set(guildId, mergedConfig);
    return mergedConfig;
  }

  /**
   * ギルド設定を保存
   * 
   * @param {string} guildId
   * @param {object} config
   */
  async saveGuildConfig(guildId, config) {
    const jsonPath = await this.getJsonPath(guildId);
    await writeJSON(jsonPath, config);
   * @param {string} guildId
   * @param {object} config
   * @param {string} context - ロックエラー時のデバッグ用コンテキスト
   * @returns {Promise<void>}
   */
  async saveGuildConfig(guildId, config, context = 'Unknown Context') {
    const jsonPath = await this.getJsonPath(guildId);
    let mutex = this.mutexes.get(jsonPath);
    if (!mutex) {
      mutex = withTimeout(new Mutex(), 10000);
      this.mutexes.set(jsonPath, mutex);
    }

    try {
      await withLock(mutex, async () => {
        await writeJSON(jsonPath, config);
        this.invalidateCache(guildId); // 保存後にキャッシュを無効化
      });
    } catch (e) {
      if (e === E_TIMEOUT) {
        throw new Error(`ファイルロックの取得がタイムアウトしました (Context: ${context})`);
      }
      throw e;
    }
  }

  /**
   * 特定セクションの設定を取得
   * @param {string} guildId 
   * @param {string} section - 'star', 'chatgpt', 'totusuna', 'kpi'
   * @returns {Promise<object>}
   */
  async getSectionConfig(guildId, section) {
    const config = await this.getGuildConfig(guildId);
    return config[section] ?? this.defaultConfig[section];
  }

  /**
   * 特定セクションの設定を更新
   * @param {string} guildId 
   * @param {string} section 
   * @param {object} sectionConfig 
   * @returns {Promise<void>}
   */
  async updateSectionConfig(guildId, section, sectionConfig) {
    const config = await this.getGuildConfig(guildId);
    config[section] = { ...(config[section] ?? {}), ...sectionConfig };
    await this.saveGuildConfig(guildId, config, `updateSectionConfig: ${section}`);
  }

  /**
   * 指定されたギルドの設定キャッシュを無効化する
   * @param {string} guildId
   */
  invalidateCache(guildId) {
    if (this.configCache.has(guildId)) {
      this.configCache.delete(guildId);
      console.log(`[ConfigManager] Guild ${guildId} の設定キャッシュを無効化しました。`);
    }
  }

  /**
  * @param {string} guildId
   * デフォルト値とマージ
   * @private
   * @param {object} config 
   * @returns {object}
   */
  _mergeWithDefaults(config) {
    const merged = { ...this.defaultConfig };


    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  /**
   * STAR管理者権限をチェック
  * @param {string} guildId
   * @param {string} guildId 
   * @param {import('discord.js').GuildMember} member 
   * @returns {Promise<boolean>}
   */
  async isStarAdmin(guildId, member) {
    const config = await this.getSectionConfig(guildId, 'star');
    const adminRoleIds = config.adminRoleIds ?? [];

    // 管理者権限またはSTAR管理ロールを持っているかチェック
    return member.permissions.has('Administrator') || 
           adminRoleIds.some(roleId => member.roles.cache.has(roleId));
  }

  /**
   * totusuna インスタンスを追加
   * @param {string} guildId 
   * @param {object} instanceData 
   */
  async addTotusunaInstance(guildId, instanceData) {
    const config = await this.getGuildConfig(guildId);
    config.totusuna = config.totusuna ?? { instances: [] };
    config.totusuna.instances = config.totusuna.instances ?? [];
    config.totusuna.instances.push(instanceData);
    await this.saveGuildConfig(guildId, config, 'addTotusunaInstance');
    return instanceData;
  }

  /**
   * totusuna インスタンスを取得
   * @param {string} guildId 
   * @param {string} uuid 
   * @returns {Promise<object|null>}
   */
  async getTotusunaInstance(guildId, uuid) {
    const config = await this.getSectionConfig(guildId, 'totusuna');
    const instances = config.instances ?? [];
    return instances.find(instance => instance.id === uuid) || null;
  }

  /**
   * totusuna インスタンスを更新
   * @param {string} guildId 
   * @param {string} uuid 
   * @param {object} updates 
   * @returns {Promise<boolean>}
   */
  async updateTotusunaInstance(guildId, uuid, updates) {
    const config = await this.getGuildConfig(guildId);
    if (!config.totusuna?.instances) return false;

    const instanceIndex = config.totusuna.instances.findIndex(instance => instance.id === uuid);
    if (instanceIndex === -1) return false;

    config.totusuna.instances[instanceIndex] = { ...config.totusuna.instances[instanceIndex], ...updates };
    console.log(`[ConfigManager] updateTotusunaInstance: インスタンスを更新 (guild: ${guildId}, uuid: ${uuid})`);
    await this.saveGuildConfig(guildId, config, `updateTotusunaInstance: ${uuid}`);
    return true;
  }

  /**
   * totusuna インスタンスを削除
   * @param {string} guildId 
   * @param {string} uuid 
   * @returns {Promise<boolean>}
   */
  async removeTotusunaInstance(guildId, uuid) {
    const config = await this.getGuildConfig(guildId);
    if (!config.totusuna?.instances) return false;

    const originalLength = config.totusuna.instances.length;
    config.totusuna.instances = config.totusuna.instances.filter(instance => instance.id !== uuid);

    if (config.totusuna.instances.length < originalLength) {
      console.log(`[ConfigManager] removeTotusunaInstance: インスタンスを削除 (guild: ${guildId}, uuid: ${uuid})`);
      await this.saveGuildConfig(guildId, config, `removeTotusunaInstance: ${uuid}`);
      return true;
    }
    return false;
  }

  /**
   * ChatGPT設定を更新
   * @param {string} guildId 
   * @param {object} chatgptConfig 
   */
  async updateChatGPTConfig(guildId, chatgptConfig) {
    return this.updateSectionConfig(guildId, 'chatgpt', chatgptConfig);
  }

  /**
   * ChatGPT設定を取得
   * @param {string} guildId 
   * @returns {Promise<object>}
   */
  async getChatGPTConfig(guildId) {
    return await this.getSectionConfig(guildId, 'chatgpt');
  }
}

// シングルトンインスタンス
const configManager = new ConfigManager();

module.exports = {
  ConfigManager,
  configManager
};