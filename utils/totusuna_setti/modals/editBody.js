const fs = require('fs').promises;
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_edit_modal:',

  /**
   * 本文編集モーダル送信後処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const modalId = interaction.customId;
    const uuid = modalId.replace(this.customIdStart, '');
    const guildId = interaction.guildId;
    const inputText = interaction.fields.getTextInputValue('body');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // ファイル存在確認
    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠️ 設定ファイルが見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // JSON読み込み
    let json;
    try {
      const raw = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(raw);
    } catch (err) {
      console.error('[editBody] JSON読み込み失敗:', err);
      return await interaction.reply({
        content: '❌ 設定ファイルの読み込みに失敗しました。',
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ 設置データが見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = instances.find(i => i.id === uuid);
    if (!target) {
      return await interaction.reply({
        content: '⚠️ 指定された設置データが存在しません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 本文更新と保存
    target.body = inputText;
    try {
      await fs.writeFile(dataPath, JSON.stringify(json, null, 2), 'utf8');
    } catch (err) {
      console.error('[editBody] JSON保存失敗:', err);
      return await interaction.reply({
        content: '❌ データの保存に失敗しました。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // メッセージ編集処理
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (!channel?.isTextBased()) throw new Error('設置チャンネルがテキストチャンネルではありません');

      const message = await channel.messages.fetch(target.messageId);
      if (!message) throw new Error('設置メッセージが見つかりません');

      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(inputText)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna_report_button_${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('[editBody] メッセージ編集失敗:', err);
      if (!interaction.replied && !interaction.deferred) {
        return await interaction.reply({
          content: '⚠️ メッセージの更新に失敗しました。',
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    // 最終返信
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '✅ 本文を更新し、表示も変更しました。',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
