// commands/star_config.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { writeJSON, readJSON, ensureDataFile } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用の設定を行います')
    .addRoleOption(option =>
      option.setName('管理者ロール')
        .setDescription('管理者権限を与えるロールを指定します')
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('管理者ロール');
    const guildId = interaction.guild.id;
    const filePath = `./data/${guildId}/${guildId}.json`;

    await ensureDataFile(guildId);

    const data = await readJSON(filePath);
    data.adminRoleId = role.id;
    await writeJSON(filePath, data);

    await interaction.reply({
      content: `✅ 管理者ロールを <@&${role.id}> に設定しました。`,
      flags: 1 << 6, // InteractionResponseFlags.Ephemeral
    });
  }
};

