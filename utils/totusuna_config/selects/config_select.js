const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');
const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const { createAdminEmbed } = require('../../embedHelper');

async function actualHandler(interaction) {
  // セレクトメニューの場合は deferUpdate で応答
  await interaction.deferUpdate();

  const selectedId = interaction.values[0];
  const instance = await configManager.getTotusunaInstance(interaction.guildId, selectedId);

  if (!instance) {
    await interaction.followUp({
      content: '❌ 選択された凸スナが見つかりませんでした。データが古い可能性があります。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }

  const detailEmbed = createAdminEmbed(
    '📌 凸スナ設定詳細',
    instance.body?.slice(0, 4000) || '（本文なし）'
  )
    .addFields(
      { name: '📍 設置チャンネル', value: instance.installChannelId ? `<#${instance.installChannelId}>` : 'なし', inline: true },
      { name: '📣 複製チャンネル', value: (instance.replicateChannelIds?.length > 0) ? instance.replicateChannelIds.map(id => `<#${id}>`).join('\n') : 'なし', inline: true },
      { name: '🆔 ユニークID', value: `\`${instance.id}\``, inline: false }
    );

  const editButton = new ButtonBuilder()
    .setCustomId(`totusuna_setti:edit:${instance.id}`)
    .setLabel('本文を編集')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✏️');

  const deleteButton = new ButtonBuilder()
    .setCustomId(`totusuna_setti:delete:${instance.id}`)
    .setLabel('この設置を削除')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

  const actionRow = new ActionRowBuilder().addComponents(editButton, deleteButton);

  // editReplyでUIを更新
  await interaction.editReply({
    embeds: [detailEmbed],
    components: [actionRow],
  });
}

module.exports = {
  customId: 'totusuna_config_select',
  handle: requireAdmin(actualHandler),
};