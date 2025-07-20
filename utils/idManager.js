// utils/idManager.js

const { v4: uuidv4 } = require('uuid');

class IdManager {
  generateUUID() {
    return uuidv4();
  }

  createButtonId(category, action, uuid = null) {
    switch (category) {
      case 'star_config':
        return uuid ? `star_config:${action}:${uuid}` : `star_config:${action}`;
      case 'star_chat_gpt_config':
        return uuid ? `star_chat_gpt_config:${action}:${uuid}` : `star_chat_gpt_config:${action}`;
      case 'totusuna_setti':
        if (action === 'report') {
          return `report_totsuna_button_${uuid || this.generateUUID()}`;
        }
        return uuid ? `totusuna_setti:${action}:${uuid}` : `totusuna_setti:${action}`;
      case 'totusuna_config':
        return uuid ? `totusuna_config:${action}:${uuid}` : `totusuna_config:${action}`;
      case 'kpi':
        return uuid ? `kpi_${action}_${uuid}` : `kpi_${action}`;
      default:
        throw new Error(`[IdManager] Unknown button category: "${category}"`);
    }
  }

  createModalId(category, action = '', uuid = null) {
    switch (category) {
      case 'star_config':
        return uuid
          ? `star_config_modal${action ? `_${action}` : ''}:${uuid}`
          : `star_config_modal${action ? `_${action}` : ''}`;
      case 'star_chat_gpt_config':
        return uuid
          ? `star_chat_gpt_config_modal${action ? `_${action}` : ''}:${uuid}`
          : `star_chat_gpt_config_modal${action ? `_${action}` : ''}`;
      case 'totusuna_setti':
        return uuid
          ? `totusuna_modal_${action}:${uuid}`
          : `totusuna_modal_${action}`;
      case 'totusuna_config':
        return uuid
          ? `totusuna_config_edit_modal_${uuid}`
          : `totusuna_config_edit_modal`;
      case 'kpi':
        return uuid
          ? `kpi_modal_${action}:${uuid}`
          : `kpi_modal_${action}`;
      default:
        throw new Error(`[IdManager] Unknown modal category: "${category}"`);
    }
  }

  createSelectId(category, action, uuid = null) {
    switch (category) {
      case 'star_config':
        return uuid ? `star_config:${action}:${uuid}` : `star_config:${action}`;
      case 'totusuna_setti':
        return uuid ? `totusuna_setti:${action}:${uuid}` : `totusuna_setti:${action}`;
      case 'totusuna_config':
        return uuid ? `totusuna_config:${action}:${uuid}` : `totusuna_config:${action}`;
      default:
        throw new Error(`[IdManager] Unknown select category: "${category}"`);
    }
  }

  /**
   * customId を category, action, uuid に分割解析する
   * @param {string} customId
   * @returns {{category:string, action:string, uuid:string|null}|null}
   */
  parseCustomId(customId) {
    const parts = customId.split(':');
    if (parts.length < 2) return null;
    const category = parts[0];
    const action = parts[1];
    const uuid = parts.length > 2 ? parts.slice(2).join(':') : null;
    return { category, action, uuid };
  }
}

const idManager = new IdManager();

module.exports = {
  IdManager,
  idManager,
};
