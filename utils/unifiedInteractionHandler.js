const { MessageFlagsBitField } = require('discord.js');
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

  initializeHandlers() {
    this.handlerCategories = {
      buttons: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/buttons')),
        star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
        star_chat_gpt_config: loadHandlers(path.join(__dirname, 'star_chat_gpt_config/buttons')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
        kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
      },
      modals: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/modals')),
        star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/modals')),
        star_chat_gpt_config: loadHandlers(path.join(__dirname, 'star_chat_gpt_config/modals')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/modals')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
        kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/modals')),
      },
      selects: {
        star_config: loadHandlers(path.join(__dirname, 'star_config/selects')),
        star_chat_gpt_config: loadHandlers(path.join(__dirname, 'star_chat_gpt_config/selects')),
        totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/selects')),
        totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/selects')),
      }
    };

    this.prefixMapping = {
      'star_config:': 'star_config',
      'star_chat_gpt_setti:': 'star_chat_gpt_setti',
      'star_chat_gpt_config:': 'star_chat_gpt_config',
      'totusuna_': 'totusuna_setti',
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
      console.warn(`⚠️ 未対応のボタン: ${customId}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ このボタンは現在利用できません。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      console.error(`❌ ボタン処理エラー: ${customId}`, err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ ボタン処理中にエラーが発生しました。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      } else {
        await interaction.editReply({
          content: '❌ ボタン処理中にエラーが発生しました。',
        }).catch(() => {});
      }
    }
  }

  async handleModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('modals', customId);

    if (!handler) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      console.error(`❌ モーダル処理エラー: ${customId}`, err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダル処理中にエラーが発生しました。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      } else {
        await interaction.editReply({
          content: '❌ モーダル処理中にエラーが発生しました。',
        }).catch(() => {});
      }
    }
  }

  async handleSelect(interaction) {
    if (!interaction.isAnySelectMenu()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('selects', customId);

    if (!handler) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      console.error(`❌ セレクト処理エラー: ${customId}`, err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ セレクトメニュー処理中にエラーが発生しました。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        }).catch(() => {});
      } else {
        await interaction.editReply({
          content: '❌ セレクトメニュー処理中にエラーが発生しました。',
        }).catch(() => {});
      }
    }
  }

  async handleInteraction(interaction) {
    try {
      if (interaction.isButton()) {
        await this.handleButton(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModal(interaction);
      } else if (interaction.isAnySelectMenu()) {
        await this.handleSelect(interaction);
      } else {
        console.warn(`未対応のinteractionタイプ: ${interaction.type}`);
      }
    } catch (err) {
      console.error('統合ハンドラーエラー:', err);
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
