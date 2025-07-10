// commands/totusuna_config.js
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('凸スナの設置・送信設定を確認・編集・削除する')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, `../data/${guildId}/${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      await interaction.reply({ content: '設定データが見つかりません。まず /凸スナ設置 を実行してください。', ephemeral: true });
      return;
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instances = json?.tousuna?.instances || [];

    if (instances.length === 0) {
      await interaction.reply({ content: '現在設定されている凸スナ設置はありません。', ephemeral: true });
      return;
    }

    const components = [];
    const rows = await Promise.all(instances.map(async (i, index) => {
      const setupCh = await interaction.guild.channels.fetch(i.messageChannelId).catch(() => null);
      const copyChs = await Promise.all((i.copyChannelIds || []).map(id => interaction.guild.channels.fetch(id).catch(() => null)));
      const setupName = setupCh?.name || '不明なチャンネル';
      const copyNames = copyChs.filter(c => !!c).map(c => `#${c.name}`).join(', ') || 'なし';
      const body = i.bodyText?.slice(0, 100) || '(本文なし)';

      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`edit_tousuna_${i.id}`)
            .setLabel(`✏️ 編集：設置${index + 1}`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`delete_tousuna_${i.id}`)
            .setLabel(`🗑️ 削除：設置${index + 1}`)
            .setStyle(ButtonStyle.Danger)
        )
      );

      return `🔹 **設置${index + 1}**
設置チャンネル: <#${i.messageChannelId}> (${setupName})
複製チャンネル: ${copyNames}
本文:
\`\`\`
${body}
\`\`\``;
    }));

    await interaction.reply({
      content: `**現在の凸スナ設置一覧：**\n\n${rows.join('\n\n')}`,
      components,
      ephemeral: true
    });
  },
};
