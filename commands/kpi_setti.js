const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kpi_設置')
    .setDescription('KPI報告の案内メッセージを送信します'),

  async execute(interaction) {
    const targetButton = new ButtonBuilder()
      .setCustomId('kpi_target_start_button')
      .setLabel('KPI目標')
      .setStyle(ButtonStyle.Primary);

    const reportButton = new ButtonBuilder()
      .setCustomId('kpi_report_start_button')
      .setLabel('KPI申請')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(targetButton, reportButton);

    await interaction.reply({
      content: 'KPI報告　目標設定/申請ボタン',
      components: [row],
    });
  },
};
