const {
  SlashCommandBuilder,
  MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createAdminEmbed } = require('../utils/embedHelper');
const requireAdmin = require('../utils/permissions/requireAdmin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナcsv')
    .setDescription('今月の凸スナ報告CSVの保存状況を確認します（管理者専用）'),

  execute: requireAdmin(async (interaction) => {
    const guildId = interaction.guild.id;
    const now = new Date();
    const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fileName = `${guildId}-${yyyyMM}-凸スナ報告.csv`;
    const filePath = path.join(__dirname, `../data/${guildId}/${fileName}`);

    const exists = fs.existsSync(filePath);
    const embed = createAdminEmbed(
      '🧾 今月の凸スナCSV保存状況',
      `📁 ファイル名：\`${fileName}\`\n\n保存状態：${exists ? '✅ 存在' : '❌ なし'}`
    );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  })
};
