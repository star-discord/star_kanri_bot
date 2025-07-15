const {
  SlashCommandBuilder,
  AttachmentBuilder,
  MessageFlagsBitField,
} = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { createAdminEmbed } = require('../utils/embedHelper');
const requireAdmin = require('../utils/permissions/requireAdmin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナcsv')
    .setDescription('今月の凸スナ報告CSVをダウンロードします（管理者専用）'),

  execute: requireAdmin(async (interaction) => {
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    try {
      const guildId = interaction.guild.id;
      const now = new Date();
      const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const fileName = `${guildId}-${yyyyMM}-凸スナ報告.csv`;
      const filePath = path.join(__dirname, '..', 'data', guildId, fileName);

      const stats = await fs.stat(filePath);

      const embed = createAdminEmbed(
        '✅ CSVファイルが見つかりました',
        '今月の凸スナ報告CSVファイルを添付します。'
      ).addFields(
        { name: '📁 ファイル名', value: `\`${fileName}\``, inline: true },
        { name: '📦 サイズ', value: `${(stats.size / 1024).toFixed(2)} KB`, inline: true },
        { name: '最終更新日時', value: `<t:${Math.floor(stats.mtime.getTime() / 1000)}:f>`, inline: false }
      );

      const attachment = new AttachmentBuilder(filePath, { name: fileName });

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        const embed = createAdminEmbed(
          '❌ CSVファイルが見つかりません',
          '今月の凸スナ報告CSVはまだ作成されていません。'
        );
        await interaction.editReply({ embeds: [embed] });
      } else {
        console.error('凸スナCSVコマンドエラー:', error);
        await interaction.editReply({ content: '❌ ファイルの確認中にエラーが発生しました。' });
      }
    }
  })
};
