// utils/star_chat_gpt_config/buttons/edit_buttons.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, MessageFlagsBitField } = require('discord.js');
const { getChatGPTConfig } = require('../configManager');
const { safeReply } = require('../../safeReply');
const { idManager } = require('../../idManager');

module.exports = {
  customIdPrefix: 'star_chat_gpt_config:',

  async handle(interaction) {
    const customId = interaction.customId;
    const config = await getChatGPTConfig(interaction.guildId);

    if (customId === idManager.createButtonId('star_chat_gpt_config', 'edit_basic_settings')) {
      const modal = new ModalBuilder()
        .setCustomId(idManager.createModalId('star_chat_gpt_config'))
        .setTitle('ChatGPT 基本設定修正');

      const apiKeyInput = new TextInputBuilder()
        .setCustomId('star_chat_gpt_config_api_key')
        .setLabel('APIキー (任意)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('sk-********************************')
        .setRequired(false)
        .setValue(config.apiKey || '');

      const maxTokensInput = new TextInputBuilder()
        .setCustomId('max_tokens')
        .setLabel('最大応答文字数')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 500')
        .setRequired(true)
        .setValue(config.maxTokens?.toString() || '');

      const temperatureInput = new TextInputBuilder()
        .setCustomId('temperature')
        .setLabel('曖昧さ (0〜1)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: 0.7')
        .setRequired(true)
        .setValue(config.temperature?.toString() || '');

      const personaInput = new TextInputBuilder()
        .setCustomId('persona')
        .setLabel('応答の性格・口調（任意）')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('例: 優しい女性教師のように話してください。')
        .setRequired(false)
        .setValue(config.persona || '');

      modal.addComponents(
        new ActionRowBuilder().addComponents(apiKeyInput),
        new ActionRowBuilder().addComponents(maxTokensInput),
        new ActionRowBuilder().addComponents(temperatureInput),
        new ActionRowBuilder().addComponents(personaInput),
      );

      await interaction.showModal(modal);

    } else if (customId === idManager.createButtonId('star_chat_gpt_config', 'edit_channels')) {
      const botMember = await interaction.guild.members.fetchMe();
      const channels = interaction.guild.channels.cache.filter(ch =>
        ch.isTextBased() &&
        ch.viewable &&
        ch.permissionsFor(botMember).has('ViewChannel')
      ).map(ch => ({
        label: ch.name.length > 100 ? ch.name.slice(0, 97) + '...' : ch.name,
        description: `ID: ${ch.id}`,
        value: ch.id,
      })).slice(0, 25);

      if (channels.length === 0) {
        await safeReply(interaction, { content: '有効なテキストチャンネルがありません。', flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('star_chat_gpt_config_select_channels')
        .setPlaceholder('ChatGPTを有効にするチャンネルを選択 (複数可)')
        .setMinValues(1)
        .setMaxValues(Math.min(channels.length, 25))
        .addOptions(channels)
        .setDefaultValues(config.chat_gpt_channels || []);

      const row = new ActionRowBuilder().addComponents(selectMenu);
      await interaction.reply({ content: '有効チャンネルを選択してください。', components: [row], ephemeral: true });
    } else {
      await safeReply(interaction, { content: '不明な操作です。', flags: MessageFlagsBitField.Flags.Ephemeral });
    }
  }
};