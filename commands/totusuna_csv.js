// commands/totusuna_csv.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');
const { generateCsvForGuild } = require('../utils/totusuna_csv/csvGenerator');
const { logAndReplyError } = require('../utils/errorHelper');
const { createSuccessEmbed, createWarningEmbed } = require('../utils/embedHelper');

/**
 * The actual handler for the command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function actualHandler(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const { guildId } = interaction;

  try {
    const result = await generateCsvForGuild(guildId);

    if (!result || result.fileCount === 0) {
      const embed = createWarningEmbed('データなし', '報告データが見つかりませんでした。');
      return await interaction.editReply({ embeds: [embed] });
    }

    const attachment = new AttachmentBuilder(result.buffer, {
      name: `凸スナ報告_${guildId}_${new Date().toISOString().split('T')[0]}.csv`,
    });

    const embed = createSuccessEmbed(
      'CSVファイル生成完了',
      `${result.fileCount}個の月次報告ファイルを結合しました。\n添付ファイルからダウンロードしてください。`
    );

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
    });

  } catch (error) {
    await logAndReplyError(interaction, error, '❌ CSVファイルの生成中にエラーが発生しました。');
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナcsv')
    .setDescription('すべての凸スナ報告データをCSVファイルとして一括で出力します（管理者専用）'),
  execute: requireAdmin(actualHandler),
};