// utils/configManager.js
const { ensureGuildJSON, readJSON, writeJSON } = require('./fileHelper');
const { v4: uuidv4 } = require('uuid');

// A simple in-memory lock to prevent race conditions on file writes
const fileLocks = new Map();

/**
 * Acquires a lock for a specific file path.
 * @param {string} filePath The path to the file to lock.
 */
async function acquireLock(filePath) {
  while (fileLocks.has(filePath)) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  fileLocks.set(filePath, true);
}

/**
 * Releases the lock for a specific file path.
 * @param {string} filePath The path to the file to unlock.
 */
function releaseLock(filePath) {
  fileLocks.delete(filePath);
}

/**
 * 統合設定管理クラス
 * 全ての機能の設定を一元管理
 */
class ConfigManager {
  constructor() {
    this.defaultConfig = {
      star: {
        adminRoleIds: [],
        notifyChannelId: null,
      },
      chatgpt: {
        apiKey: null,
        maxTokens: 150,
        temperature: 0.7
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
   * ギルド設定を取得
   * @param {string} guildId
   * @returns {Promise<object>}
   */
  async getGuildConfig(guildId) {
    const jsonPath = await ensureGuildJSON(guildId);
    const config = await readJSON(jsonPath);
    return this._mergeWithDefaults(config);
  }

  /**
   * ギルド設定を保存
   * @param {string} guildId 
   * @param {object} config 
   * @returns {Promise<void>}
   */
  async saveGuildConfig(guildId, config) {
    const jsonPath = await ensureGuildJSON(guildId);
    await acquireLock(jsonPath);
    try {
      await writeJSON(jsonPath, config);
    } finally {
      releaseLock(jsonPath);
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
   * @param {object} sectionConfig
   * @returns {Promise<void>}
   */
  async updateSectionConfig(guildId, section, sectionConfig) {
    const jsonPath = await ensureGuildJSON(guildId);
    await acquireLock(jsonPath);
    try {
      const config = await this.getGuildConfig(guildId);
      config[section] = { ...(config[section] ?? {}), ...sectionConfig };
      await writeJSON(jsonPath, config);
    } finally {
      releaseLock(jsonPath);
    }
  }

  /**
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
   * @param {object} instance 
   */
  async addTotusunaInstance(guildId, instanceData) {
    const jsonPath = await ensureGuildJSON(guildId);
    await acquireLock(jsonPath);
    try {
      const config = await this.getGuildConfig(guildId);
      config.totusuna = config.totusuna ?? { instances: [] };
      config.totusuna.instances = config.totusuna.instances ?? [];

      const newInstance = { id: uuidv4(), ...instanceData };
      config.totusuna.instances.push(newInstance);

      await writeJSON(jsonPath, config);
      return newInstance;
    } finally {
      releaseLock(jsonPath);
    }
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
   * @param {object} updates
   * @returns {Promise<boolean>}
   */
  async updateTotusunaInstance(guildId, uuid, updates) {
    const jsonPath = await ensureGuildJSON(guildId);
    await acquireLock(jsonPath);
    try {
      const config = await this.getGuildConfig(guildId);
      if (!config.totusuna?.instances) return false;

      const instanceIndex = config.totusuna.instances.findIndex(instance => instance.id === uuid);
      if (instanceIndex === -1) return false;

      config.totusuna.instances[instanceIndex] = { ...config.totusuna.instances[instanceIndex], ...updates };
      await writeJSON(jsonPath, config);
      return true;
    } finally {
      releaseLock(jsonPath);
    }
  }

  /**
   * totusuna インスタンスを削除
   * @param {string} guildId 
   * @param {string} uuid 
   * @param {string} uuid
   * @returns {Promise<boolean>}
   */
  async removeTotusunaInstance(guildId, uuid) {
    const jsonPath = await ensureGuildJSON(guildId);
    await acquireLock(jsonPath);
    try {
      const config = await this.getGuildConfig(guildId);
      if (!config.totusuna?.instances) return false;

      const originalLength = config.totusuna.instances.length;
      config.totusuna.instances = config.totusuna.instances.filter(instance => instance.id !== uuid);

      if (config.totusuna.instances.length < originalLength) {
        await writeJSON(jsonPath, config);
        return true;
      }
      return false;
    } finally {
      releaseLock(jsonPath);
    }
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