// utils/unifiedInteractionHandler.js
const { MessageFlagsBitField } = require('discord.js');
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
      // star_config
      'admin_role_select': 'star_config',
      'notify_channel_select': 'star_config',

      // star_chat_gpt_setti - 機能実行・付随設定
      'star_chat_gpt_setti_button': 'star_chat_gpt_setti',
      'star_chatgpt_setti_config_button': 'star_chat_gpt_setti',
      'star_chatgpt_setti_modal': 'star_chat_gpt_setti',

      // star_chat_gpt_config - Bot全体の設定関連
      'star_chat_gpt_config_modal': 'star_chat_gpt_config',
      'star_chat_gpt_config_select_channels': 'star_chat_gpt_config',

      // totusuna_setti - 凸スナ受付・管理
      'totusuna_select_main': 'totusuna_setti',
      'totusuna_select_replicate': 'totusuna_setti',

      // totusuna_config - 設置済み編集
      'totusuna_config_select': 'totusuna_config',
    };
  }

  getCategoryFromCustomId(customId) {
    if (this.customIdMapping[customId]) {
      return this.customIdMapping[customId];
    }

    for (const [prefix, category] of Object.entries(this.prefixMapping)) {
      if (customId.startsWith(prefix)) {
        return category;
      }
    }

    return null;
  }

  /**
   * ハンドラーを検索
   * @param {'buttons'|'modals'|'selects'} interactionType
   * @param {string} customId
   */
  resolveHandler(interactionType, customId) {
    const category = this.getCategoryFromCustomId(customId);
    if (!category) return null;

    // カテゴリに対応するハンドラローダー（find関数）を取得
    const find = this.handlerCategories[interactionType]?.[category];
    if (typeof find !== 'function') {
      return null;
    }

    return find(customId); // 各カテゴリのハンドラローダーを実行
  }

  async handleButton(interaction) {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('buttons', customId);

    if (!handler) {
      console.warn(`⚠️ 未対応のボタン: ${customId}`);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '⚠️ このボタンは現在利用できません。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '⚠️ このボタンは現在利用できません。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
        '❌ ボタン処理中にエラーが発生しました。',
        { flags: MessageFlagsBitField.Flags.Ephemeral }
      );
    }
  }

  async handleModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    const customId = interaction.customId;
    const handler = this.resolveHandler('modals', customId);

    if (!handler) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ モーダルに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '❌ モーダルに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ モーダル処理エラー: ${customId}\n${err?.stack || err}`,
        '❌ モーダル処理中にエラーが発生しました。',
        { flags: MessageFlagsBitField.Flags.Ephemeral }
      );
    }
  }

  async handleSelect(interaction) {
    const customId = interaction.customId;
    const handler = this.resolveHandler('selects', customId);

    if (!handler) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
      return;
    }

    try {
      await handler.handle(interaction);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ セレクトエラー (${customId})\n${err?.stack || err}`,
        '❌ エラーが発生しました。',
        { flags: MessageFlagsBitField.Flags.Ephemeral }
      );
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

// シングルトンとしてエクスポート
const unifiedHandler = new UnifiedInteractionHandler();

module.exports = {
  UnifiedInteractionHandler,
  unifiedHandler,
  handleButton: (i) => unifiedHandler.handleButton(i),
  handleModal: (i) => unifiedHandler.handleModal(i),
  handleSelect: (i) => unifiedHandler.handleSelect(i),
};
