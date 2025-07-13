const fs = require('fs').promises;
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:edit:',

  /**
   * 凸スナ本文編集モーダルを表示する処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    // customIdからUUID部分を取り出し
    const uuid = customId.replace(this.customIdStart, '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // データファイルが存在するか確認
    try {
      await fs.access(filePath);
    } catch {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // JSONファイルを読み込み、パースする
    let json;
    try {
      const content = await fs.readFile(filePath, 'utf8');
      json = JSON.parse(content);
    } catch (err) {
      console.error('JSONファイルの読み込みまたは解析に失敗しました:', err);
      return await interaction.reply({
        content: '❌ データファイルの読み込みに失敗しました。',
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ 凸スナ設置データが存在しません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // UUIDに対応する設置データを探す
    const target = instances.find(i => i.id === uuid);
    if (!target) {
      return await interaction.reply({
        content: '⚠️ 指定された凸スナ設置情報が見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // モーダルを作成
    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_edit_modal:${uuid}`)
      .setTitle('📘 凸スナ本文の編集');

    // テキスト入力コンポーネントを作成
    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文メッセージ')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    // モーダルにコンポーネントを追加
    modal.addComponents(new ActionRowBuilder().addComponents(input));

    // モーダルをユーザーに表示
    await interaction.showModal(modal);
  },
};
