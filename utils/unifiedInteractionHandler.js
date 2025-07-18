const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader');
const path = require('path');
const { logAndReplyError } = require('./errorHelper');

/**
 * 統合インタラクションハンドラー
 * ボタン、モーダル、セレクトメニューを一元管理
 */
class UnifiedInteractionHandler {
  constructor() {
    this.handlerCategories = {};
    this.isReady = false;

    this.prefixMapping = {
      'star_config:': 'star_config',
      'star_chat_gpt_setti:': 'star_chat_gpt_setti',
      'star_chat_gpt_config:': 'star_chat_gpt_config',
      'totusuna_setti:': 'totusuna_setti',
      'totusuna_config:': 'totusuna_config',
      'kpi_': 'kpi_setti',
    };

    this.customIdMapping = {
      'admin_role_select': 'star_config',
      'notify_channel_select': 'star_config',
      'star_chat_gpt_setti:main': 'star_chat_gpt_setti',
      'star_chat_gpt_setti_modal': 'star_chat_gpt_setti',
      'star_chat_gpt_setti:open_config': 'star_chat_gpt_setti',
      'star_chat_gpt_config_modal': 'star_chat_gpt_config',
      'star_chat_gpt_config_select_channels': 'star_chat_gpt_config',
      'totusuna_select_main': 'totusuna_setti',
      'totusuna_select_replicate': 'totusuna_setti',
      'totusuna_config_select': 'totusuna_config',
    };
  }

  /**
   * ハンドラを非同期で読み込み、初期化する
   */
  async initialize() {
    console.log('🔄 [UnifiedHandler] ハンドラの初期化を開始...');
    const buttonHandlers = {
      star_chat_gpt_setti: await loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
      star_chat_gpt_config: await loadHandlers(path.join(__dirname, 'star_chat_gpt_config/buttons')),
      totusuna_setti: await loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
      totusuna_config: await loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
      kpi_setti: await loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
    };

    const modalHandlers = {
      star_config: await loadHandlers(path.join(__dirname, 'star_config/modals')),
      star_chat_gpt_setti: await loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/modals')),
      star_chat_gpt_config: await loadHandlers(path.join(__dirname, 'star_chat_gpt_config/modals')),
      totusuna_setti: await loadHandlers(path.join(__dirname, 'totusuna_setti/modals')),
      totusuna_config: await loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
      kpi_setti: await loadHandlers(path.join(__dirname, 'kpi_setti/modals')),
    };

    const selectHandlers = {
      star_config: await loadHandlers(path.join(__dirname, 'star_config/selects')),
      star_chat_gpt_config: await loadHandlers(path.join(__dirname, 'star_chat_gpt_config/selects')),
      totusuna_setti: await loadHandlers(path.join(__dirname, 'totusuna_setti/selects')),
      totusuna_config: await loadHandlers(path.join(__dirname, 'totusuna_config/selects')),
    };

    this.handlerCategories = {
      buttons: buttonHandlers,
      modals: modalHandlers,
      selects: selectHandlers,
    };

    this.isReady = true;
    console.log('✅ [UnifiedHandler] ハンドラの初期化が完了しました。');
  }

  getCategoryFromCustomId(customId) {
    if (this.customIdMapping[customId]) return this.customIdMapping[customId];

    for (const [prefix, category] of Object.entries(this.prefixMapping)) {
      if (customId.startsWith(prefix)) return category;
    }
    return null;
  }

  resolveHandler(interactionType, customId) {
    const category = this.getCategoryFromCustomId(customId);
    if (!category) return null;

    const find = this.handlerCategories[interactionType]?.[category];
    return typeof find === 'function' ? find(customId) : null;
  }

  async handleButton(interaction) {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('buttons', customId);

    if (!handler) {
      console.warn(`[UnifiedHandler] ボタンハンドラが見つかりません: ${customId}`);
      return await logAndReplyError(interaction, `未対応のボタン: ${customId}`, '⚠️ このボタンは現在利用できません。');
    }
    await handler.handle(interaction);
  }

  async handleModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('modals', customId);

    if (!handler) {
      console.warn(`[UnifiedHandler] モーダルハンドラが見つかりません: ${customId}`);
      return await logAndReplyError(interaction, `未対応のモーダル: ${customId}`, '❌ モーダルに対応する処理が見つかりませんでした。');
    }
    await handler.handle(interaction);
  }

  async handleSelect(interaction) {
    if (!interaction.isAnySelectMenu()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('selects', customId);

    if (!handler) {
      console.warn(`[UnifiedHandler] セレクトメニューハンドラが見つかりません: ${customId}`);
      return await logAndReplyError(interaction, `未対応のセレクトメニュー: ${customId}`, '❌ セレクトメニューに対応する処理が見つかりませんでした。');
    }
    await handler.handle(interaction);
  }

  async handleInteraction(interaction) {
    if (!this.isReady) {
      console.warn('⚠️ [UnifiedHandler] ハンドラが未準備のため、インタラクションを拒否しました。');
      return await logAndReplyError(interaction, 'ハンドラ未準備', 'ボットがまだ準備中です。少し待ってからもう一度お試しください。');
    }

    try {
      if (interaction.isButton()) {
        await this.handleButton(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModal(interaction);
      } else if (interaction.isAnySelectMenu()) {
        await this.handleSelect(interaction);
      } else {
        // サポート外のインタラクションタイプは無視する
        console.warn(`[UnifiedHandler] 未対応のinteractionタイプ: ${interaction.type}`);
      }
    } catch (err) {
      // 各ハンドラ内で発生したエラーはここで一括キャッチし、ユーザーに応答する
      const customId = interaction.customId || 'unknown';
      console.error(`[UnifiedHandler] Interaction処理中にエラーが発生 (ID: ${customId}):`, err);
      await logAndReplyError(interaction, err, `❌ 処理中にエラーが発生しました (ID: ${customId})`);
    }
  }
}

const unifiedHandler = new UnifiedInteractionHandler();

module.exports = {
  UnifiedInteractionHandler,
  unifiedHandler,
  handleButton: (i) => unifiedHandler.handleButton(i),
  handleModal: (i) => unifiedHandler.handleModal(i),
  handleSelect: (i) => unifiedHandler.handleSelect(i),
};
