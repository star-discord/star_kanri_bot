// utils/star_chat_gpt_config/modals/config_modal.js
const { ActionRowBuilder, StringSelectMenuBuilder, MessageFlagsBitField } = require('discord.js');
const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');
const { safeReply, safeDefer } = require('../../safeReply');
const { MessageFlagsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'star_chat_gpt_config_modal',

  async handle(interaction) {
    try {
      // 応答を遅延
      await safeDefer(interaction, { flags: MessageFlagsBitField.Flags.Ephemeral });

      const apiKey = interaction.fields.getTextInputValue('star_chat_gpt_config_api_key')?.trim() || null;
      const maxTokensStr = interaction.fields.getTextInputValue('max_tokens')?.trim();
      const temperatureStr = interaction.fields.getTextInputValue('temperature')?.trim();

      const maxTokens = Number(maxTokensStr);
      const temperature = Number(temperatureStr);

      const config = await getChatGPTConfig(interaction.guildId);
      config.apiKey = apiKey;  // APIキーが空の場合もnullとして保存

      // maxTokensのバリデーション
      if (maxTokensStr === '' || isNaN(maxTokens) || !Number.isInteger(maxTokens) || maxTokens <= 0 || maxTokens > 4096) {
        await interaction.editReply({ content: '❌ 1回の最大返答文字数（max_tokens）は、1〜4096の整数で入力してください。'});
        return;
      } else {
        config.maxTokens = maxTokens;
      }

      // temperatureのバリデーション
      if (temperatureStr === '' || isNaN(temperature) || temperature < 0 || temperature > 1) {
        await interaction.editReply({ content: '❌ 応答のランダム性（temperature）は、0〜1の範囲の数値で入力してください。'});
        return;
      } else {
        config.temperature = temperature;
      }

      await saveChatGPTConfig(interaction.guildId, config);

       // 設定更新のログ出力 (APIキーはマスク)
       console.log(`[star_chat_gpt_config_modal] 設定更新 (Guild: ${interaction.guildId})`, {
         apiKey: apiKey ? '設定' : '未設定',
         maxTokens: config.maxTokens,
         temperature: config.temperature,
       });

       // 設定完了のEmbed
       const embed = {
         title: '✅ ChatGPT設定を更新しました',
         fields: [
           { name: 'APIキー', value: apiKey ? '設定済み（セキュリティのため表示されません）' : '未設定', inline: false },
           { name: '1回の最大返答文字数（max_tokens）', value: `${config.maxTokens}文字`, inline: false },
           { name: '応答のランダム性（temperature）', value: `${config.temperature}`, inline: false },
         ],
         color: 0x00FF00,
       };

       // チャンネル選択メニューを構築、チャンネルリストが空でない場合のみ選択肢を追加
       const selectMenu = new StringSelectMenuBuilder()
         .setCustomId('star_chat_gpt_config_select_channels') // 修正済みの customId
         .setPlaceholder('ChatGPTを有効にするチャンネルを選択 (複数可)')
         .setMinValues(1);
       const row = new ActionRowBuilder().addComponents(selectMenu);

       await interaction.editReply({ embeds: [embed], components: [row] });
      const textChannels = interaction.guild.channels.cache
        .filter(c => c.isTextBased())
        .map(c => ({
          label: c.name,
          description: `ID: ${c.id}`,
          value: c.id,
        }))
        .slice(0, 25);

      if (textChannels.length > 0) {
    } catch (error) {
      console.error(`⚠️ ChatGPT設定モーダル処理エラー (Guild: ${interaction.guildId}):`, error);
      await safeReply(interaction, {
        content: '❌ 設定の保存または表示に失敗しました。時間を置いて再度お試しください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  },
}
