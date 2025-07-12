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
  customIdStart: 'totsusuna_setti:edit_settings:',

  /**
   * 凸スナ設置の編雁E��ーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠�E�EチE�Eタファイルが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[edit_settings] JSON読み込み失敁E', err);
      return await interaction.reply({
        content: '❁EチE�Eタファイルの読み込みに失敗しました、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠�E�EインスタンスチE�Eタが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instance = instances.find(i => i.id === uuid);
    if (!instance) {
      return await interaction.reply({
        content: '⚠�E�E持E��された設置惁E��が存在しません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(this.customIdStart + uuid)
      .setTitle('📘 凸スナ本斁E��編雁E);

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本斁E��チE��ージ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  },
};
