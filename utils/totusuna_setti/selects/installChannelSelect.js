const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const tempStore = require('../tempStore');

module.exports = {
  customId: 'totusuna_install_channel_select',

  /**
   * 凸スナ設置チャンネル選択後の処理
   * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const selectedChannelId = interaction.values[0];

      // 一時データ取得
      const userData = tempStore.get(guildId, userId);
      if (!userData) {
        return await interaction.reply({
          content: '❌ 設置データが見つかりません。最初からやり直してください。',
          flags: MessageFlags.Ephemeral
        });
      }

      // データファイル準備
      const jsonPath = ensureGuildJSON(guildId);
      const json = readJSON(jsonPath);
      
      if (!json.totusuna) json.totusuna = {};
      if (!Array.isArray(json.totusuna.instances)) json.totusuna.instances = [];

      // 新しい凸スナインスタンス作成
      const uuid = uuidv4();
      const newInstance = {
        id: uuid,
        userId: userId,
        title: userData.title || '',
        body: userData.body,
        installChannelId: selectedChannelId,
        replicateChannelIds: [],
        createdAt: new Date().toISOString()
      };

      // 設置チャンネル取得
      const targetChannel = await interaction.guild.channels.fetch(selectedChannelId);
      if (!targetChannel?.isTextBased()) {
        return await interaction.reply({
          content: '❌ 指定されたチャンネルは無効です。',
          flags: MessageFlags.Ephemeral
        });
      }

      // 凸スナメッセージ作成
      const embed = new EmbedBuilder()
        .setTitle(userData.title || '📣 凸スナ報告受付中')
        .setDescription(userData.body)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna:report:${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // チャンネルにメッセージ送信
      const sentMessage = await targetChannel.send({
        embeds: [embed],
        components: [row]
      });

      // メッセージIDを保存
      newInstance.messageId = sentMessage.id;
      json.totusuna.instances.push(newInstance);
      writeJSON(jsonPath, json);

      // 一時データ削除
      tempStore.delete(guildId, userId);

      // 成功メッセージ
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ 凸スナ設置完了')
            .setDescription(`凸スナボタンを <#${selectedChannelId}> に設置しました。`)
            .addFields(
              {
                name: '📝 設置内容',
                value: userData.body,
                inline: false
              },
              {
                name: '🔗 設置先',
                value: `<#${selectedChannelId}>`,
                inline: false
              }
            )
            .setColor(0x00cc99)
        ],
        components: []
      });

    } catch (error) {
      console.error('[installChannelSelect] エラー:', error);
      await interaction.reply({
        content: '❌ 凸スナ設置中にエラーが発生しました。',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
