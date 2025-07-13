// utils/unifiedInteractionHandler.js
const { MessageFlags } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');
const { loadHandlers } = require('./handlerLoader');
const path = require('path');

/**
 * 統合インタラクションハンドラー
 * ボタン、モーダル、セレクトメニューを一元管理
 */
class UnifiedInteractionHandler {
  constructor() {
    this.initializeHandlers();
  }

  /**
   * ハンドラーを初期化
   */
  initializeHandlers() {
    // 各機能ディレクトリからハンドラーを読み込み
    this.handlerCategories = {
      buttons: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/buttons')),
        star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
        kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
      },
      modals: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/modals')),
        star_chat_gpt_setti: require(path.join(__dirname, 'star_chat_gpt_setti/modals.js')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/modals')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
        kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/modals')),
      },
      selects: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/selects')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/selects')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/selects')),
      }
    };

    // プレフィックスマッピング
    this.prefixMapping = {
      'star_config:': 'star_config',
      'star_chat_gpt_': 'star_chat_gpt_setti',
      'totusuna_': 'totusuna_setti',
      'totsusuna_': 'totusuna_setti', // 命名統一のため両方対応
      'totusuna_config:': 'totusuna_config',
      'kpi_': 'kpi_setti',
    };

    // 個別customId用マッピング（プレフィックスなし）
    this.customIdMapping = {
      // STAR設定関連
      'admin_role_select': 'star_config',
      'notify_channel_select': 'star_config',
      // ChatGPT設定関連
      'chatgpt_config_button': 'star_chat_gpt_setti',
      'chatgpt_config_modal': 'star_chat_gpt_setti',
      // totusuna関連
      'totusuna_select_main': 'totusuna_setti',
      'totusuna_select_replicate': 'totusuna_setti',
      'totusuna_config_select': 'totusuna_config',
    };
  }

  /**
   * customIdから適切なカテゴリを特定
   * @param {string} customId 
   * @returns {string|null}
   */
  getCategoryFromCustomId(customId) {
    // 個別マッピングを最初にチェック
    if (this.customIdMapping[customId]) {
      return this.customIdMapping[customId];
    }

    // プレフィックスマッピングをチェック
    for (const [prefix, category] of Object.entries(this.prefixMapping)) {
      if (customId.startsWith(prefix)) {
        return category;
      }
    }

    return null;
  }

  /**
   * ハンドラーを検索
   * @param {string} interactionType - 'buttons', 'modals', 'selects'
   * @param {string} customId 
   * @returns {object|null}
   */
  findHandler(interactionType, customId) {
    const category = this.getCategoryFromCustomId(customId);
    
    if (!category || !this.handlerCategories[interactionType]) {
      return null;
    }

    const categoryHandler = this.handlerCategories[interactionType][category];
    
    if (typeof categoryHandler === 'function') {
      return categoryHandler(customId);
    }

    return null;
  }

  /**
   * ボタンインタラクションを処理
   * @param {import('discord.js').ButtonInteraction} interaction 
   */
  async handleButton(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const handler = this.findHandler('buttons', customId);

    if (!handler) {
      console.warn(`⚠️ 未対応のボタン: ${customId}`);
      return await interaction.reply({
        content: '⚠️ このボタンは現在利用できません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
        '❌ ボタン処理中にエラーが発生しました。',
        { flags: MessageFlags.Ephemeral }
      );
    }
  }

  /**
   * モーダルインタラクションを処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction 
   */
  async handleModal(interaction) {
    if (!interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    const handler = this.findHandler('modals', customId);

    if (!handler) {
      return await interaction.reply({
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        ephemeral: true,
      });
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ モーダル処理エラー: ${customId}\n${err?.stack || err}`,
        '❌ モーダル処理中にエラーが発生しました。',
        { ephemeral: true }
      );
    }
  }

  /**
   * セレクトメニューインタラクションを処理
   * @param {import('discord.js').StringSelectMenuInteraction} interaction 
   */
  async handleSelect(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const customId = interaction.customId;
    const handler = this.findHandler('selects', customId);

    if (!handler) {
      return await interaction.reply({
        content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ セレクトエラー (${customId})\n${err?.stack || err}`,
        '❌ エラーが発生しました。',
        { flags: MessageFlags.Ephemeral }
      );
    }
  }

  /**
   * 全てのインタラクションを統一的に処理
   * @param {import('discord.js').Interaction} interaction 
   */
  async handleInteraction(interaction) {
    try {
      if (interaction.isButton()) {
        await this.handleButton(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModal(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await this.handleSelect(interaction);
      }
    } catch (err) {
      console.error('統合ハンドラーエラー:', err);
    }
  }
}

// シングルトンインスタンス
const unifiedHandler = new UnifiedInteractionHandler();

module.exports = {
  UnifiedInteractionHandler,
  unifiedHandler,
  // 個別エクスポート（後方互換性のため）
  handleButton: (interaction) => unifiedHandler.handleButton(interaction),
  handleModal: (interaction) => unifiedHandler.handleModal(interaction),
  handleSelect: (interaction) => unifiedHandler.handleSelect(interaction),
};
