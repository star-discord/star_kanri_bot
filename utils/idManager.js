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
        star_chat_gpt_config: 'star_chat_gpt_config_modal',
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
   * @param {string} category - 'star_config', 'star_chat_gpt_config', 'totusuna_setti', etc.
   * @param {string} action - アクション名
   * @param {string} [uuid] - UUID（必要な場合）
   * @returns {string}
   */
  createButtonId(category, action, uuid = null) {
    switch (category) {
      case 'star_config':
        return `star_config:${action}`;
      case 'star_chat_gpt_config':
        return `star_chat_gpt_config:${action}`;
      case 'totusuna_setti':
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
   * @param {string} [action]
   * @param {string} [uuid]
   * @returns {string}
   */
  createModalId(category, action = '', uuid = null) {
    switch (category) {
      case 'star_config':
        return `star_config_modal${action ? `_${action}` : ''}`;
      case 'star_chat_gpt_config':
        return `star_chat_gpt_config_modal${action ? `_${action}` : ''}`;
      case 'totusuna_setti':
        return `totusuna_modal_${action}${uuid ? `:${uuid}` : ''}`;
      case 'totusuna_config':
        return `totusuna_config_edit_modal_${uuid}`;
      case 'totusuna_report':
        return `totusuna_modal:${uuid}`;
      case 'kpi':
        return `kpi_modal_${action}`;
      default:
        return `${category}_modal${action ? `_${action}` : ''}${uuid ? `_${uuid}` : ''}`;
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
        // e.g., star_config:admin_role_select
        return `star_config:${action}`;
      case 'totusuna_setti':
        // e.g., totusuna_setti:select_main
        return `totusuna_setti:${action}`;
      case 'totusuna_config':
        return 'totusuna_config_select';
      default:
        return `${category}_select_${action}`;
    }
  }

  /**
   * customIdを解析してカテゴリ、アクション、UUIDを抽出
   * @param {string} customId 
   * @returns {{ category: string, action: string, uuid?: string, type: string, originalId: string }}
   */
  parseCustomId(customId) {
    // A more declarative and robust set of parsing rules.
    // Order is important: more specific patterns should come first.
    const parsingRules = [
      // --- Modals ---
      { regex: /^totusuna_config_edit_modal_(.+)$/, type: 'modal', category: 'totusuna_config', parts: { action: 'edit', uuid: 1 } },
      { regex: /^totusuna_modal:(.+)$/, type: 'modal', category: 'totusuna_report', parts: { uuid: 1 } },
      { regex: /^totusuna_modal_([^:]+):(.+)$/, type: 'modal', category: 'totusuna_setti', parts: { action: 1, uuid: 2 } },
      { regex: /^totusuna_modal_([^:]+)$/, type: 'modal', category: 'totusuna_setti', parts: { action: 1 } },
      { regex: /^star_config_modal_(.+)$/, type: 'modal', category: 'star_config', parts: { action: 1 } },
      { regex: /^star_chat_gpt_config_modal$/, type: 'modal', category: 'star_chat_gpt_config', parts: { action: 'edit' } },
      { regex: /^kpi_modal_(.+)$/, type: 'modal', category: 'kpi', parts: { action: 1 } },
      // --- Buttons ---
      { regex: /^totusuna:report:(.+)$/, type: 'button', category: 'totusuna_report', parts: { uuid: 1 } },
      { regex: /^totusuna_setti:([^:]+):(.+)$/, type: 'button', category: 'totusuna_setti', parts: { action: 1, uuid: 2 } },
      { regex: /^totusuna_setti:([^:]+)$/, type: 'button', category: 'totusuna_setti', parts: { action: 1 } },
      { regex: /^totusuna_config:([^:]+):(.+)$/, type: 'button', category: 'totusuna_config', parts: { action: 1, uuid: 2 } },
      { regex: /^totusuna_config:([^:]+)$/, type: 'button', category: 'totusuna_config', parts: { action: 1 } },
      { regex: /^star_chat_gpt_config:(.+)$/, type: 'button', category: 'star_chat_gpt_config', parts: { action: 1 } },
      { regex: /^kpi_(.+)$/, type: 'button', category: 'kpi', parts: { action: 1 } },
      // --- Selects ---
      { regex: /^star_config:(.+)$/, type: 'select', category: 'star_config', parts: { action: 1 } },
      { regex: /^totusuna_setti:(.+)$/, type: 'select', category: 'totusuna_setti', parts: { action: 1 } },
      { regex: /^totusuna_config_select$/, type: 'select', category: 'totusuna_config', parts: { action: 'select' } },
    ];

    for (const rule of parsingRules) {
      const match = customId.match(rule.regex);
      if (match) {
        const result = {
          category: rule.category,
          type: rule.type,
          action: 'unknown',
          originalId: customId,
        };

        if (rule.parts) {
          for (const [key, value] of Object.entries(rule.parts)) {
            if (typeof value === 'number') {
              result[key] = match[value];
            } else {
              result[key] = value;
            }
          }
        }
        return result;
      }
    }

    // Fallback for simple IDs that don't match complex patterns
    return {
      category: 'unknown',
      type: 'unknown',
      action: 'unknown',
      originalId: customId,
    };
  }

  /**
   * customIdが特定のカテゴリに属するか判定
   * @param {string} customId 
   * @param {string} category 
   * @returns {boolean}
   */
  belongsToCategory(customId, category) {
    return this.parseCustomId(customId).category === category;
  }

  /**
   * 名前の正規化（例: totusunaの別表記統一）
   * @param {string} name 
   * @returns {string}
   */
  normalizeName(name) {
    const normalizations = {
      'totsuna': 'totusuna',
      'toutsuna': 'totusuna',
    };
    return normalizations[name] ?? name;
  }

  /**
   * デバッグ用にID解析結果をコンソール出力
   * @param {string} customId 
   * @returns {object} 解析結果
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
  idManager,
};
