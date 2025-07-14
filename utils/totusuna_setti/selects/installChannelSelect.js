const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const tempStore = require('../state/totsusunaTemp');

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
          flags: MessageFlagsBitField.Ephemeral
        });
      }
      
      const selectedChannelId = interaction.values[0];
      console.log('   selectedChannelId:', selectedChannelId);

      // 一時データ取得
      console.log('📦 [installChannelSelect] tempStore確認中...');
      const userData = tempStore.get(guildId, userId);
      console.log('   userData:', userData);
      console.log('   全tempStoreデータ:', tempStore.getAll());
      
      if (!userData) {
        console.error('❌ [installChannelSelect] tempStoreにデータが見つかりません');
        return await interaction.reply({
          content: '❌ 設置データが見つかりません。最初からやり直してください。',
          flags: MessageFlagsBitField.Ephemeral
        });
      }

      // チャンネルファイル準備
      console.log('📁 [installChannelSelect] ファイル処理開始...');
      const jsonPath = ensureGuildJSON(guildId);
      console.log('   jsonPath:', jsonPath);
      
      const json = readJSON(jsonPath);
      console.log('   既存JSON:', JSON.stringify(json, null, 2));
      
      if (!json.totusuna) json.totusuna = {};
      if (!Array.isArray(json.totusuna.instances)) json.totusuna.instances = [];

      // 新しい凸スナインスタンス作成
      const uuid = uuidv4();
      console.log('   生成UUID:', uuid);
      
      const newInstance = {
        id: uuid,
        userId: userId,
        title: userData.title || '',
        body: userData.body,
        installChannelId: selectedChannelId,
        replicateChannelIds: [],
        createdAt: new Date().toISOString()
      };
      console.log('   newInstance:', newInstance);

      // 設置チャンネル取得
      console.log('🔍 [installChannelSelect] チャンネル取得中...');
      const targetChannel = await interaction.guild.channels.fetch(selectedChannelId);
      console.log('   targetChannel:', targetChannel?.name, targetChannel?.type);
      
      if (!targetChannel?.isTextBased()) {
        console.error('❌ [installChannelSelect] チャンネルが無効またはテキストチャンネルではありません');
        return await interaction.reply({
          content: '❌ 指定されたチャンネルは無効です。',
          flags: MessageFlagsBitField.Ephemeral
        });
      }

      // 凸スナメッセージ作成
      console.log('📝 [installChannelSelect] メッセージ作成中...');
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
      console.log('📤 [installChannelSelect] メッセージ送信中...');
      const sentMessage = await targetChannel.send({
        embeds: [embed],
        components: [row]
      });
      console.log('   sentMessage.id:', sentMessage.id);

      // メッセージIDを保存
      newInstance.messageId = sentMessage.id;
      json.totusuna.instances.push(newInstance);
      
      console.log('💾 [installChannelSelect] JSON保存中...');
      console.log('   保存前JSON:', JSON.stringify(json, null, 2));
      writeJSON(jsonPath, json);
      console.log('   JSON保存完了');

      // 一時データ削除
      console.log('🗑️ [installChannelSelect] tempStore削除中...');
      tempStore.delete(guildId, userId);
      console.log('   tempStore削除完了');

      // 成功メッセージ
      console.log('✅ [installChannelSelect] 成功レスポンス送信中...');
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
      
      console.log('🎉 [installChannelSelect] 処理完全完了');

    } catch (error) {
      console.error('💥 [installChannelSelect] 致命的エラー:', error);
      console.error('   エラースタック:', error.stack);
      console.error('   エラー詳細:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      
      // インタラクションの状態確認
      console.log('🔍 [installChannelSelect] インタラクション状態:', {
        replied: interaction.replied,
        deferred: interaction.deferred
      });
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。',
            flags: MessageFlagsBitField.Ephemeral
          });
        } else if (interaction.deferred) {
          await interaction.editReply({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。'
          });
        } else {
          await interaction.followUp({
            content: '❌ 凸スナ設置中にエラーが発生しました。詳細はコンソールを確認してください。',
            flags: MessageFlagsBitField.Ephemeral
          });
        }
      } catch (replyError) {
        console.error('💥 [installChannelSelect] レスポンス送信でもエラー:', replyError);
      }
    }
  }
};
