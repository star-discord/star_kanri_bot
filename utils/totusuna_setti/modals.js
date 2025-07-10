// utils/totusuna_setti/modals.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async function handleTotusunaModal(interaction, client, userTotusunaSetupMap) {
  if (interaction.customId !== 'totusuna_content_modal') return;

  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const body = interaction.fields.getTextInputValue('main_body');

  const setup = userTotusunaSetupMap.get(userId);
  if (!setup || !setup.mainChannelId) {
    await interaction.reply({ content: '⚠️ チャンネル設定が見つかりません。', ephemeral: true });
    return;
  }

  const mainChannel = await client.channels.fetch(setup.mainChannelId);

  // 古いメッセージを削除
  if (setup.lastMessageId) {
    try {
      const oldMsg = await mainChannel.messages.fetch(setup.lastMessageId);
      await oldMsg.delete();
    } catch (e) {
      console.warn('古いメッセージ削除失敗:', e);
    }
  }

  // 新しいエンベッド＋ボタン投稿
  const embed = new EmbedBuilder()
    .setTitle('📢 凸スナ報告はこちら')
    .setDescription(body)
    .setColor(0x0099ff);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('tousuna_report_button')
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary)
  );

  const sent = await mainChannel.send({ embeds: [embed], components: [row] });

  // 保存先に記録
  const saveDir = path.join(__dirname, `../../data/${guildId}`);
  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
  const savePath = path.join(saveDir, `${guildId}.json`);

  const json = {
    buttonChannelId: setup.mainChannelId,
    cloneChannelIds: setup.cloneChannelIds || [],
    lastMessageId: sent.id,
    content: body,
  };
  fs.writeFileSync(savePath, JSON.stringify(json, null, 2));

  await interaction.reply({ content: '✅ 本文付きメッセージを設置しました！', ephemeral: true });
  userTotusunaSetupMap.delete(userId);
};
