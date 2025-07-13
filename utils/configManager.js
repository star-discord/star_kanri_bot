// utils/configManager.js
const { ensureGuildJSON, readJSON, writeJSON } = require('./fileHelper');

/**
 * 統合設定管理クラス
 * 全ての機能の設定を一元管理
 */
class ConfigManager {
  constructor() {
    this.defaultConfig = {
      star: {
        adminRoles: [],
        notifyChannels: []
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
   * @returns {object}
   */
  getGuildConfig(guildId) {
    const jsonPath = ensureGuildJSON(guildId);
    const config = readJSON(jsonPath);
    
    // デフォルト値をマージ
    return this.mergeWithDefaults(config);
  }

  /**
   * ギルド設定を保存
   * @param {string} guildId 
   * @param {object} config 
   */
  saveGuildConfig(guildId, config) {
    const jsonPath = ensureGuildJSON(guildId);
    writeJSON(jsonPath, config);
  }

  /**
   * 特定セクションの設定を取得
   * @param {string} guildId 
   * @param {string} section - 'star', 'chatgpt', 'totusuna', 'kpi'
   * @returns {object}
   */
  getSectionConfig(guildId, section) {
    const config = this.getGuildConfig(guildId);
    return config[section] || this.defaultConfig[section];
  }

  /**
   * 特定セクションの設定を更新
   * @param {string} guildId 
   * @param {string} section 
   * @param {object} sectionConfig 
   */
  updateSectionConfig(guildId, section, sectionConfig) {
    const config = this.getGuildConfig(guildId);
    config[section] = { ...config[section], ...sectionConfig };
    this.saveGuildConfig(guildId, config);
  }

  /**
   * デフォルト値とマージ
   * @param {object} config 
   * @returns {object}
   */
  mergeWithDefaults(config) {
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
   * @returns {boolean}
   */
  isStarAdmin(guildId, member) {
    const config = this.getSectionConfig(guildId, 'star');
    const adminRoles = config.adminRoles || [];
    
    // 管理者権限またはSTAR管理ロールを持っているかチェック
    return member.permissions.has('Administrator') || 
           adminRoles.some(roleId => member.roles.cache.has(roleId));
  }

  /**
   * totusuna インスタンスを追加
   * @param {string} guildId 
   * @param {object} instance 
   */
  addTotusunaInstance(guildId, instance) {
    const config = this.getGuildConfig(guildId);
    if (!config.totusuna) config.totusuna = {};
    if (!Array.isArray(config.totusuna.instances)) config.totusuna.instances = [];
    
    config.totusuna.instances.push(instance);
    this.saveGuildConfig(guildId, config);
  }

  /**
   * totusuna インスタンスを取得
   * @param {string} guildId 
   * @param {string} uuid 
   * @returns {object|null}
   */
  getTotusunaInstance(guildId, uuid) {
    const config = this.getSectionConfig(guildId, 'totusuna');
    const instances = config.instances || [];
    return instances.find(instance => instance.id === uuid) || null;
  }

  /**
   * totusuna インスタンスを更新
   * @param {string} guildId 
   * @param {string} uuid 
   * @param {object} updates 
   */
  updateTotusunaInstance(guildId, uuid, updates) {
    const config = this.getGuildConfig(guildId);
    if (!config.totusuna || !Array.isArray(config.totusuna.instances)) return false;
    
    const instanceIndex = config.totusuna.instances.findIndex(instance => instance.id === uuid);
    if (instanceIndex === -1) return false;
    
    config.totusuna.instances[instanceIndex] = { 
      ...config.totusuna.instances[instanceIndex], 
      ...updates 
    };
    this.saveGuildConfig(guildId, config);
    return true;
  }

  /**
   * totusuna インスタンスを削除
   * @param {string} guildId 
   * @param {string} uuid 
   */
  removeTotusunaInstance(guildId, uuid) {
    const config = this.getGuildConfig(guildId);
    if (!config.totusuna || !Array.isArray(config.totusuna.instances)) return false;
    
    const originalLength = config.totusuna.instances.length;
    config.totusuna.instances = config.totusuna.instances.filter(instance => instance.id !== uuid);
    
    if (config.totusuna.instances.length < originalLength) {
      this.saveGuildConfig(guildId, config);
      return true;
    }
    return false;
  }

  /**
   * ChatGPT設定を更新
   * @param {string} guildId 
   * @param {object} chatgptConfig 
   */
  updateChatGPTConfig(guildId, chatgptConfig) {
    this.updateSectionConfig(guildId, 'chatgpt', chatgptConfig);
  }

  /**
   * ChatGPT設定を取得
   * @param {string} guildId 
   * @returns {object}
   */
  getChatGPTConfig(guildId) {
    return this.getSectionConfig(guildId, 'chatgpt');
  }
}

// シングルトンインスタンス
const configManager = new ConfigManager();

module.exports = {
  ConfigManager,
  configManager
};
