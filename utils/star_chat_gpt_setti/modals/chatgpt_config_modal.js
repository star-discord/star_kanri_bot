// utils/star_chat_gpt_setti/modals/chatgpt_config_modal.js
const fs = require('fs/promises'); // Promiseベースのfsでasync/await活用
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'chatgpt_config_modal',

  /**
   * モーダルの送信を処理し、設定をギルドごとのJSONファイルに保存
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    try {
      const guildId = interaction.guildId;
      if (!guildId) {
        return await interaction.reply({
          content: '⚠️ この操作はサーバー内でのみ有効です。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // 入力値を取得（未入力時は空文字）
      const apiKey = interaction.fields.getTextInputValue('chatgpt_api_key')?.trim() ?? '';
      const maxTokens = interaction.fields.getTextInputValue('chatgpt_max_tokens')?.trim() ?? '';
      const temperature = interaction.fields.getTextInputValue('chatgpt_temperature')?.trim() ?? '';

      // 保存ディレクトリとファイルパス
      const dataDir = path.resolve(__dirname, '../../data', guildId);
      const dataFile = path.join(dataDir, `${guildId}.json`);

      // ディレクトリ作成（存在しなければ）
      await fs.mkdir(dataDir, { recursive: true });

      // 既存データ読み込み（あれば）
      let data = {};
      try {
        const jsonRaw = await fs.readFile(dataFile, 'utf8');
        data = JSON.parse(jsonRaw);
      } catch {
        // ファイルがなければ空オブジェクトでOK
      }

      // chatgpt設定更新
      data.chatgpt = {
        apiKey,
        maxTokens,
        temperature,
      };

      // JSONとして書き込み（インデント付き）
      await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');

      // 表示用にAPIキーはマスクして出す
      const maskedKey = apiKey ? '設定済み (****)' : '未設定';

      const embed = createAdminEmbed(
        'ChatGPT設定更新完了',
        'ChatGPTの設定が正常に更新されました。'
      ).addFields(
        { name: 'APIキー', value: maskedKey, inline: true },
        { name: '最大トークン数', value: maxTokens || '未設定', inline: true },
        { name: '温度設定', value: temperature || '未設定', inline: true }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlagsBitField.Ephemeral,
      });

    } catch (error) {
      console.error('[chatgpt_config_modal] 設定保存エラー:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 設定の保存中にエラーが発生しました。もう一度お試しください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  }
};
