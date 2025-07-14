const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const tempStore = require('../state/totusunaTemp');

module.exports = {
  customId: 'totusuna_install_channel_select',

  /**
   * 凸スナ設置チャンネル選択後の処理
   * @param {import('discord.js').ChannelSelectMenuInteraction} interaction
   */
  async handle(interaction) {
    console.log('📍 [installChannelSelect] 処理開始');
    console.log('   guildId:', interaction.guildId);
    console.log('   userId:', interaction.user.id);
    console.log('   values:', interaction.values);

    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;

      if (!interaction.values || interaction.values.length === 0) {
        console.error('❌ [installChannelSelect] チャンネルが選択されていません');
        return await interaction.reply({
          content: '❌ チャンネルが選択されていません。再度お試しください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      const selectedChannelId = interaction.values[0];
      console.log('   selectedChannelId:', selectedChannelId);

      // 一時データ取得
      const userData = tempStore.get(guildId, userId);
      if (!userData) {
        console.error('❌ [installChannelSelect] tempStoreにデータが見つかりません');
        return await interaction.reply({
          content: '❌ 設置データが見つかりません。最初からやり直してください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      const jsonPath = ensureGuildJSON(guildId);
      const json = readJSON(jsonPath);

      if (!json.totusuna) json.totusuna = {};
      if (!Array.isArray(json.totusuna.instances)) json.totusuna.instances = [];

      const uuid = uuidv4();
      const newInstance = {
        id: uuid,
        userId,
        title: userData.title || '',
        body: userData.body,
        installChannelId: selectedChannelId,
        replicateChannelIds: [],
        createdAt: new Date().toISOString(),
      };

      // チャンネル取得
      const targetChannel = await interaction.guild.channels.fetch(selectedChannelId);
      if (!targetChannel?.isTextBased()) {
        console.error('❌ [installChannelSelect] チャンネルが無効またはテキストチャンネルではありません');
        return await interaction.reply({
          content: '❌ 指定されたチャンネルは無効です。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // メッセージ作成
      const embed = new EmbedBuilder()
        .setTitle(userData.title || '📣 凸スナ報告受付中')
        .setDescription(userData.body)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna:report:${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // メッセージ送信
      const sentMessage = await targetChannel.send({
        embeds: [embed],
        components: [row],
      });

      newInstance.messageId = sentMessage.id;
      json.totusuna.instances.push(newInstance);
      writeJSON(jsonPath, json);

      // 一時データ削除（失敗しても処理継続）
      try {
        tempStore.delete(guildId, userId);
      } catch (e) {
        console.warn('⚠️ tempStore 削除失敗:', e);
      }

      // 完了メッセージは ephemeral で reply する
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ 凸スナ設置完了')
            .setDescription(`凸スナボタンを <#${selectedChannelId}> に設置しました。`)
            .addFields(
              { name: '📝 設置内容', value: userData.body || '（なし）', inline: false },
              { name: '🔗 設置先', value: `<#${selectedChannelId}>`, inline: false }
            )
            .setColor(0x00cc99),
        ],
        flags: MessageFlagsBitField.Ephemeral,
      });

      console.log('🎉 [installChannelSelect] 処理完全完了');

    } catch (error) {
      console.error('💥 [installChannelSelect] 致命的エラー:', error);

      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。',
            flags: MessageFlagsBitField.Ephemeral,
          });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。',
          });
        } else {
          await interaction.followUp({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。',
            flags: MessageFlagsBitField.Ephemeral,
          });
        }
      } catch (replyError) {
        console.error('💥 [installChannelSelect] レスポンス送信でもエラー:', replyError);
      }
    }
  },
};
