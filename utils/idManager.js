// utils/idManager.js
const { v4: uuidv4 } = require('uuid');

/**
 * 統合ID管理クラス
 * customId の生成と解析を一元管理
 */
class IdManager {
  constructor() {
    // ID命名規則の定義
    this.patterns = {
      // ボタンID
      buttons: {
        star_config: 'star_config:{action}',
        star_chat_gpt_config: 'star_chat_gpt_config:{action}',
        totusuna_setti: 'totusuna_setti:{action}:{uuid?}',
        totusuna_config: 'totusuna_config:{action}:{uuid?}',
        totusuna_report: 'totusuna:report:{uuid}',
        kpi: 'kpi_{action}',
      },
      // モーダルID
      modals: {
        star_config: 'star_config_modal_{action}',
        star_chat_gpt: 'chatgpt_config_modal',
        totusuna_setti: 'totusuna_modal_{action}:{uuid?}',
        totusuna_config: 'totusuna_config_edit_modal_{uuid}',
        totusuna_report: 'totusuna_modal:{uuid}',
        kpi: 'kpi_modal_{action}',
      },
      // セレクトメニューID
      selects: {
        star_config: 'star_config:{action}',
        totusuna_setti: 'totusuna_setti:{action}',
        totusuna_config: 'totusuna_config_select',
      }
    };
  }

  /**
   * UUIDを生成
   * @returns {string}
   */
  generateUUID() {
    return uuidv4();
  }

  /**
   * ボタンIDを生成
   * @param {string} category - 'star_config', 'star_chat_gpt', 'totusuna_setti', etc.
   * @param {string} action - アクション名
   * @param {string} [uuid] - UUID（必要な場合）
   * @returns {string}
   */
  createButtonId(category, action, uuid = null) {
    switch (category) {
      case 'star_chat_gpt_config':
        return `star_chat_gpt_config:${action}`;
        return uuid ? `totusuna_setti:${action}:${uuid}` : `totusuna_setti:${action}`;
      case 'totusuna_config':
        return uuid ? `totusuna_config:${action}:${uuid}` : `totusuna_config:${action}`;
      case 'totusuna_report':
        return `totusuna:report:${uuid}`;
      case 'kpi':
        return `kpi_${action}`;
      default:
        return `${category}_${action}${uuid ? `_${uuid}` : ''}`;
    }
  }

  /**
   * モーダルIDを生成
   * @param {string} category 
   * @param {string} action 
   * @param {string} [uuid] 
   * @returns {string}
   */
  createModalId(category, action, uuid = null) {
    switch (category) {
      case 'star_chat_gpt_config':
        return 'star_chat_gpt_config_modal';
      case 'totusuna_setti':
        return uuid ? `totusuna_modal_${action}:${uuid}` : `totusuna_modal_${action}`;
      case 'totusuna_config':
        return `totusuna_config_edit_modal_${uuid}`;
      case 'totusuna_report':
        return `totusuna_modal:${uuid}`;
      case 'kpi':
        return `kpi_modal_${action}`;
      default:
        return `${category}_modal_${action}${uuid ? `_${uuid}` : ''}`;
    }
  }

  /**
   * セレクトメニューIDを生成
   * @param {string} category 
   * @param {string} action 
   * @returns {string}
   */
  createSelectId(category, action) {
    switch (category) {
      case 'star_config':
        return `star_config:${action}`;
      case 'totusuna_setti':
        return `totusuna_setti:${action}`;
      case 'totusuna_config':
        return 'totusuna_config_select';
      default:
        return `${category}_${action}`;
    }
  }

  /**
   * customIdを解析してカテゴリ、アクション、UUIDを抽出
   * @param {string} customId 
   * @returns {object} { category, action, uuid?, type }
   */
  parseCustomId(customId) {
    // 各パターンをチェック
    // Specific patterns (with fewer wildcards or more segments) should come first.
    const patterns = [
      // --- Most specific patterns first ---
      { regex: /^totusuna_config_edit_modal_(.+)$/, category: 'totusuna_config', type: 'modal' },
      { regex: /^totusuna_modal:(.+)$/, category: 'totusuna_report', type: 'modal' },
      { regex: /^totusuna:report:(.+)$/, category: 'totusuna_report', type: 'button' },
      { regex: /^chatgpt_config_modal$/, category: 'star_chat_gpt', type: 'modal', action: 'config' },

      // --- Patterns with optional UUIDs (Corrected Regex) ---
      // The regex `([^:]+)(?::(.*))?` correctly captures the action and an optional UUID without capturing the separator colon.
      { regex: /^totusuna_setti:([^:]+)(?::(.*))?$/, category: 'totusuna_setti', type: 'button' },
      { regex: /^totusuna_modal_([^:]+)(?::(.*))?$/, category: 'totusuna_setti', type: 'modal' },
      { regex: /^totusuna_config:([^:]+)(?::(.*))?$/, category: 'totusuna_config', type: 'button' },

      // --- General category patterns ---
      { regex: /^star_config_modal_(.+)$/, category: 'star_config', type: 'modal' },
      { regex: /^star_config:(.+)$/, category: 'star_config', type: 'select' }, // This is likely a select menu
      { regex: /^star_chat_gpt_(.+)$/, category: 'star_chat_gpt', type: 'button' },
      { regex: /^kpi_modal_(.+)$/, category: 'kpi', type: 'modal' },
      { regex: /^kpi_(.+)$/, category: 'kpi', type: 'button' },

      // --- Legacy / Hardcoded ID patterns ---
      { regex: /^totusuna_config_select$/, category: 'totusuna_config', type: 'select', action: 'select' },
      { regex: /^admin_role_select$/, category: 'star_config', type: 'select', action: 'admin_role' },
      { regex: /^notify_channel_select$/, category: 'star_config', type: 'select', action: 'notify_channel' },
      { regex: /^totusuna_select_(main|replicate)$/, category: 'totusuna_setti', type: 'select' },
    ];

    for (const pattern of patterns) {
      const match = customId.match(pattern.regex);
      if (match) {
        const result = {
          category: pattern.category,
          type: pattern.type,
          originalId: customId
        };

        if (pattern.action) {
          result.action = pattern.action;
        } else if (match[1]) {
          result.action = match[1];
        }

        if (match[2] && match[2].length > 0) {
          result.uuid = match[2];
        }

        return result;
      }
    }

    // 解析に失敗した場合
    return {
      category: 'unknown',
      type: 'unknown',
      action: 'unknown',
      originalId: customId
    };
  }

  /**
   * customIdが特定のカテゴリに属するかチェック
   * @param {string} customId 
   * @param {string} category 
   * @returns {boolean}
   */
  belongsToCategory(customId, category) {
    const parsed = this.parseCustomId(customId);
    return parsed.category === category;
  }

  /**
   * 名前正規化（統一化）
   * totusuna ↔ totusuna の統一など
   * @param {string} name 
   * @returns {string}
   */
  normalizeName(name) {
    const normalizations = {
      'totsuna': 'totusuna', // Corrected duplicate key
      'toutsuna': 'totusuna',
    };
    
    return normalizations[name] || name;
  }

  /**
   * デバッグ用：現在のID解析結果を表示
   * @param {string} customId 
   */
  debugParseId(customId) {
    const parsed = this.parseCustomId(customId);
    console.log(`[IdManager] Parse result for "${customId}":`, parsed);
    return parsed;
  }
}


// シングルトンインスタンス
const idManager = new IdManager();

module.exports = {
  IdManager,
  idManager
};
