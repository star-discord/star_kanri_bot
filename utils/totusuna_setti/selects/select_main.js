module.exports = {
  customId: 'totsusuna_setti:select_main',

  /**
   * @param {import('discord.js').StringSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    // 選択値の取得など
    const selectedChannelId = interaction.values[0];

    // 何か状態を更新する処理など

    // メッセージ更新や状態更新は必要ならここで行う

    // 新しいメッセージを送らずにインタラクションを終える
    await interaction.deferUpdate();
  }
};
