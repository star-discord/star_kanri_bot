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
   * customIdを解析してカテゴリ、アクション、UUIDを抽出
   * @param {string} customId 
   * @returns {object} { category, action, uuid?, type, originalId }
   */
  parseCustomId(customId) {
    // 解析用のパターン（長いもの優先）
    const patterns = [
      // 特殊・具体的なモーダル
      { regex: /^totusuna_config_edit_modal_(.+)$/, category: 'totusuna_config', type: 'modal' },
      { regex: /^totusuna_modal:(.+)$/, category: 'totusuna_report', type: 'modal' },
      { regex: /^totusuna:report:(.+)$/, category: 'totusuna_report', type: 'button' },
      { regex: /^chatgpt_config_modal$/, category: 'star_chat_gpt_config', type: 'modal', action: 'config' },

      // UUIDを含むがアクションもあるパターン（:で区切る）
      { regex: /^totusuna_setti:([^:]+)(?::(.*))?$/, category: 'totusuna_setti', type: 'button' },
      { regex: /^totusuna_modal_([^:]+)(?::(.*))?$/, category: 'totusuna_setti', type: 'modal' },
      { regex: /^totusuna_config:([^:]+)(?::(.*))?$/, category: 'totusuna_config', type: 'button' },

      // 一般的なモーダル・ボタン・セレクト
      { regex: /^star_config_modal_(.+)$/, category: 'star_config', type: 'modal' },
      { regex: /^star_config:(.+)$/, category: 'star_config', type: 'select' },
      { regex: /^star_chat_gpt_config:(.+)$/, category: 'star_chat_gpt_config', type: 'button' },
      { regex: /^kpi_modal_(.+)$/, category: 'kpi', type: 'modal' },
      { regex: /^kpi_(.+)$/, category: 'kpi', type: 'button' },

      // 固定文字列ID（セレクトなど）
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
          originalId: customId,
        };
        // actionは固定指定があればそれを優先、それ以外はmatch[1]
        result.action = pattern.action ?? match[1] ?? 'unknown';

        if (match[2] && match[2].length > 0) {
          result.uuid = match[2];
        }
        return result;
      }
    }

    // 解析失敗時はunknown
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
