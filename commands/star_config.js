// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
} = require('discord.js');
const {
  readJSON,
  writeJSON,
  ensureGuildJSON,
} = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用のロール設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const filePath = await ensureGuildJSON(guildId); // ← await 忘れずに
    const data = await readJSON(filePath);

    if (!data.star_config) data.star_config = {};
    const currentAdminRoleIds = data.star_config.adminRoleIds || [];

    // 埋め込み生成関数
    const getSettingsEmbed = (roleIds) => {
      const currentMentions =
        roleIds.length > 0
          ? roleIds.map((id) => `<@&${id}>`).join('\n')
          : '*未設定*';

      return new EmbedBuilder()
        .setTitle('🌟 STAR管理bot設定')
        .setDescription(
          '**管理者ロールの登録/解除**\n\n📌 現在の管理者ロール:\n' +
            currentMentions
        )
        .setColor(0x0099ff);
    };

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    const sentMessage = await interaction.reply({
      embeds: [getSettingsEmbed(currentAdminRoleIds)],
      components: [row],
      f
