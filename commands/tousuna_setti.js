const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('現在設置中の凸スナ報告ボタンの設定を表示・編集します。'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const filePath = path.join(__dirname, `../../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: '⚠ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const all = json.totsusuna || {};

    if (Object.keys(all).length === 0) {
      return interaction.reply({ content: '⚠ 現在設置されている凸スナはありません。', ephemeral: true });
    }

    const rows = [];

    for (const [uuid, info] of Object.entries(all)) {
      const embed = new EmbedBuilder()
        .setTitle(`📌 凸スナ設置：${uuid}`)
        .addFields(
          {
            name: '📍 設置チャンネル',
            value: `<#${info.installChannelId}>`,
            inline: true
          },
          {
            name: '📤 複製チャンネル',
            value: info.replicateChannelIds.map(id => `<#${id}>`).join('\n') || '（なし）',
            inline: true
          },
          {
            name: '📝 本文',
            value: info.body || '(未設定)',
          },
        )
        .setColor(0x00bfff);

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tousuna_edit_${uuid}`)
          .setLabel('⚙ 設定を編集')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`tousuna_delete_${uuid}`)
          .setLabel('🗑 削除')
          .setStyle(ButtonStyle.Danger)
      );

      rows.push({ embeds: [embed], components: [buttons] });
    }

    await interaction.reply({ content: '現在の設置一覧です。', ephemeral: true });

    for (const row of rows) {
      await interaction.followUp({ ...row, ephemeral: true });
    }
  }
};
