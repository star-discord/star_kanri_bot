const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告用の設定を開始します'),

  async execute(interaction) {
    // ボタン設置チャンネル（1つ選択）
    const mainChannelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totsusuna_select_main')
      .setPlaceholder('ボタン設置チャンネルを選択')
      .setMinValues(1)
      .setMaxValues(1)
      .addDefaultChannelTypes([0]); // 0 = GUILD_TEXT

    // 複製送信チャンネル（複数選択）
    const duplicateChannelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totsusuna_select_duplicates')
      .setPlaceholder('複製送信チャンネルを選択（任意）')
      .setMinValues(0)
      .setMaxValues(5);

    // 本文入力ボタン（押すとモーダル表示予定）
    const inputButton = new ButtonBuilder()
      .setCustomId('totsusuna_input_body')
      .setLabel('本文を入力')
      .setStyle(ButtonStyle.Secondary);

    // 設置ボタン（押すとEmbed送信）
    const confirmButton = new ButtonBuilder()
      .setCustomId('totsusuna_confirm_setup')
      .setLabel('凸スナを設置')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(mainChannelSelect);
    const row2 = new ActionRowBuilder().addComponents(duplicateChannelSelect);
    const row3 = new ActionRowBuilder().addComponents(inputButton, confirmButton);

    await interaction.reply({
      content: '以下の項目を設定してください：',
      components: [row1, row2, row3],
      ephemeral: true
    });
  }
};

