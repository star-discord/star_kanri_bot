// utils/idManager.js

const { v4: uuidv4 } = require('uuid');

/**
 * 統合ID管理クラス
 * customId の生成と解析を一元管理
 */
class IdManager {
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
        // 新しい凸スナ報告ボタンのID形式に対応
        if (action === 'report') {
          return `report_totsuna_button_${uuid}`;
        }
        return uuid ? `totusuna_setti:${action}:${uuid}` : `totusuna_setti:${action}`;
      case 'totusuna_config':
        return uuid ? `totusuna_config:${action}:${uuid}` : `totusuna_config:${action}`;
      case 'kpi':
        return `kpi_${action}`;
      default:
        // 未定義のカテゴリに対してはエラーをスローし、明示的な定義を強制する
        throw new Error(`[IdManager] Unknown button category: "${category}"`);
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
      case 'kpi':
        return `kpi_modal_${action}`;
      default:
        // 未定義のカテゴリに対してはエラーをスローし、明示的な定義を強制する
        throw new Error(`[IdManager] Unknown modal category: "${category}"`);
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
        // e.g., totusuna_config:select
        return `totusuna_config:${action}`;
      default:
        // 未定義のカテゴリに対してはエラーをスローし、明示的な定義を強制する
        throw new Error(`[IdManager] Unknown select category: "${category}"`);
    }
  }
}

// シングルトンインスタンス
const idManager = new IdManager();

module.exports = {
  IdManager,
  idManager,
};
