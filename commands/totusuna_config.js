// commands/totusuna_config.js
const fs = require('fs');
const path = require('path');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('設置済みの凸スナ一覧を表示し、内容の確認・編集ができます'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const dataDir = path.join(__dirname, `../data/${guildId}`);
    const dataPath = path.join(dataDir, `${guildId}.json`);

    // dataディレクトリが無ければ作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // JSONファイルが無ければ初期化
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({ totusuna: {} }, null, 2), 'utf-8');
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instances = Object.values(json.totusuna || {});

    if (instances.length === 0) {
      return interaction.reply({
        content: '📭 凸スナはまだ設置されていません。',
        ephemeral: true,
      });
    }

    // 初期返信
    await interaction.reply({
      content: `🛠 設置済み凸スナ一覧：${instances.length}件`,
      ephemeral: true,
    });

    // 各設置済みインスタンスをEmbed＋ボタンで表示
    for (const instance of instances) {
      const embed = new EmbedBuilder()
        .setTitle('📌 凸スナ設置情報')
        .setDescription(instance.body.length > 150 ? instance.body.slice(0, 150) + '...' : instance.body)
        .setColor(0x00bfff)
        .addFields(
          { name: '設置チャンネル', value: `<#${instance.installChannelId}>`, inline: true },
          {
            name: '複製チャンネル',
            value: (instance.replicateChannelIds || []).map(id => `<#${id}>`).join('\n') || 'なし',
            inline: true,
          }
        )
        .setFooter({ text: `UUID: ${instance.uuid}` });

      const editButton = new ButtonBuilder()
        .setCustomId(`totusuna_edit:${instance.uuid}`)
        .setLabel('⚙ 設定を編集')
        .setStyle(ButtonStyle.Secondary);

      const deleteButton = new ButtonBuilder()
        .setCustomId(`totusuna_delete:${instance.uuid}`)
        .setLabel('🗑 本文削除')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(editButton, deleteButton);

      await interaction.followUp({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }
  },
};
