const fs = require('fs').promises;
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:edit_settings:',

  /**
   * 凸スナ設置の編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ ギルド情報が取得できません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
      return;
    }

    // ※必要に応じて先に deferUpdate() を呼ぶ場合は以下コメントアウトを外す
    // try {
    //   await interaction.deferUpdate();
    // } catch (err) {
    //   console.error(new Date().toISOString(), '[edit_settings] deferUpdate失敗:', err);
    // }

    const uuid = interaction.customId.substring(this.customIdStart.length);
    const dataPath = path.resolve(__dirname, '../../../data', guildId, `${guildId}.json`);

    // ファイル存在チェック
    try {
      await fs.access(dataPath);
    } catch {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ データファイルが見つかりません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
      return;
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error(new Date().toISOString(), '[edit_settings] JSON読み込み失敗:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ データファイルの読み込みに失敗しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
      return;
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ インスタンスデータが見つかりません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
      return;
    }

    const instance = instances.find(i => i.id === uuid);
    if (!instance) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ 指定された設定情報が存在しません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_edit_settings_modal:${uuid}`)
      .setTitle('📘 凸スナ本文の編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文メッセージ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error(new Date().toISOString(), '[edit_settings] モーダル表示失敗:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
