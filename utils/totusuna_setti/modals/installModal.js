const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, MessageFlags } = require('discord.js');
const tempStore = require('../tempStore');

module.exports = {
  customIdStart: 'totsusuna_modal_body_input:install',

  /**
   * 凸スナ設置モーダルの送信後処理（チャンネル選択へ）
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    console.log('📝 [installModal] 処理開始');
    console.log('   guildId:', interaction.guildId);
    console.log('   userId:', interaction.user.id);
    
    try {
      const guildId = interaction.guildId;
      const userId = interaction.user.id;
      const body = interaction.fields.getTextInputValue('body');
      const title = interaction.fields.getTextInputValue('title') || '';

      console.log('   入力データ:', { body, title });

      // 一時データ保存
      console.log('💾 [installModal] tempStore保存中...');
      tempStore.set(guildId, userId, {
        body: body,
        title: title,
        timestamp: Date.now()
      });
      console.log('   tempStore保存完了');
      console.log('   全tempStoreデータ:', tempStore.getAll());

      // チャンネル選択メニューを表示
      console.log('📋 [installModal] チャンネル選択メニュー作成中...');
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('totusuna_install_channel_select')
        .setPlaceholder('凸スナを設置するチャンネルを選択してください')
        .setChannelTypes(ChannelType.GuildText);

      const row = new ActionRowBuilder().addComponents(channelSelect);

      const embed = new EmbedBuilder()
        .setTitle('📍 設置チャンネル選択')
        .setDescription('凸スナボタンを設置するチャンネルを選択してください。')
        .addFields(
          {
            name: '📝 本文',
            value: body || '（本文なし）',
            inline: false
          },
          {
            name: '🏷️ タイトル',
            value: title || '（タイトルなし）',
            inline: false
          }
        )
        .setColor(0x00bfff);

      console.log('📤 [installModal] チャンネル選択メニュー送信中...');
      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral
      });
      
      console.log('✅ [installModal] 処理完了');

    } catch (error) {
      console.error('💥 [installModal] エラー:', error);
      console.error('   エラースタック:', error.stack);
      
      try {
        await interaction.reply({
          content: '❌ 凸スナ設置処理中にエラーが発生しました。詳細はコンソールを確認してください。',
          flags: MessageFlags.Ephemeral
        });
      } catch (replyError) {
        console.error('💥 [installModal] レスポンス送信でもエラー:', replyError);
      }
    }
  }
};
