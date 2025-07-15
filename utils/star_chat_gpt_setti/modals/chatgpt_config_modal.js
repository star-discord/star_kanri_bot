// utils/star_chat_gpt_setti/modals/chatgpt_config_modal.js
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../fileHelper');
const { createSuccessEmbed } = require('../../../embedHelper');

module.exports = {
  customId: 'chatgpt_config_modal',
  async handle(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({ 
        content: '⚠️ この操作はサーバー内でのみ実行してください。', 
        ephemeral: true 
      });
    }

    const filePath = await ensureGuildJSON(guildId);
    const data = await readJSON(filePath);

    const apiKey = interaction.fields.getTextInputValue('chatgpt_api_key')?.trim() || '';
    const maxTokens = interaction.fields.getTextInputValue('chatgpt_max_tokens')?.trim() || '';
    const temperature = interaction.fields.getTextInputValue('chatgpt_temperature')?.trim() || '';

    data.chatgpt = {
      apiKey: apiKey || null,
      maxTokens: maxTokens ? Number(maxTokens) : null,
      temperature: temperature ? Number(temperature) : null,
    };

    await writeJSON(filePath, data);

    const embed = createSuccessEmbed('ChatGPT設定', '設定を保存しました。');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};