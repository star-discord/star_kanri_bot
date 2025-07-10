// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const { readJSON, writeJSON, ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用のロール設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const filePath = ensureGuildJSON(guildId);
    const data = readJSON(filePath);

    if (!data.star_config) data.star_config = {};
    const currentAdminRoleIds = data.star_config.adminRoleIds || [];

    // ロール選択メニュー生成（現在の設定をプレフィックス表示）
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    const currentMentions =
      currentAdminRoleIds.length > 0
        ? currentAdminRoleIds.map(id => `<@&${id}>`).join(', ')
        : '*未設定*';

    await interaction.reply({
      content: `👤 管理者ロールを選択してください（複数可）\n📌 現在の設定: ${currentMentions}`,
      components: [row],
      ephemeral: true // ← v14ではこれが正式
    });

    // コンポーネント応答を待機
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.RoleSelect,
      time: 30_000,
      max: 1
    });

    collector.on('collect', async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return await selectInteraction.reply({
          content: '❌ この操作はコマンドを実行したユーザーのみが行えます。',
          ephemeral: true
        });
      }

      const selectedRoleIds = selectInteraction.values;
      data.star_config.adminRoleIds = selectedRoleIds;

      try {
        writeJSON(filePath, data);
      } catch (err) {
        console.error('❌ JSON保存失敗:', err);
        return await selectInteraction.reply({
          content: '❌ ロールの保存に失敗しました。',
          ephemeral: true
        });
      }

      const mentionText = selectedRoleIds.map(id => `<@&${id}>`).join(', ');
      console.log(`🛠️ ${interaction.guild.name} (${guildId}) の管理者ロールを更新: ${mentionText}`);

      await selectInteraction.update({
        content: `✅ 管理者ロールを設定しました: ${mentionText}`,
        components: []
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0 && !(interaction.replied || interaction.deferred)) {
        interaction.editReply({
          content: '⏱️ 時間切れのためロール設定はキャンセルされました。',
          components: []
        });
      }
    });
  }
};


