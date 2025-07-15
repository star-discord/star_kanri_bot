// commands/star_migration.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlagsBitField } = require('discord.js');
const { DataMigration } = require('../utils/dataMigration');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_migration')
    .setDescription('データ移行を手動実行します（管理者専用）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;

    // Discord標準の管理者権限チェック
    if (!member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ この操作にはDiscordの管理者権限が必要です。',
        flags: MessageFlagsBitField.Flags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    try {
      const migration = new DataMigration();
      
      // 現在のギルドのみ移行
      const guildId = interaction.guild.id;
      console.log(`🔄 手動データ移行開始: ${guildId}`);

      const migrated = await migration.migrateGuildData(guildId, interaction.client);

      if (migrated) {
        await interaction.editReply({
          content: '✅ データ移行が完了しました。\n' +
                  '📦 バックアップが作成され、データが最新形式に更新されました。'
        });
      } else {
        await interaction.editReply({
          content: 'ℹ️ データ移行は不要でした。\n' +
                  '既に最新形式のデータです。'
        });
      }

    } catch (error) {
      console.error('❌ 手動データ移行エラー:', error);
      
      await interaction.editReply({
        content: '❌ データ移行中にエラーが発生しました。\n' +
                'サーバーログを確認してください。'
      });
    }
  }
};
