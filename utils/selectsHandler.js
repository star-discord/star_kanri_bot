// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totsusunaSelectHandler = require('../utils/totusuna_setti/selects');
const totusunaConfigSelectHandler = require('../utils/totusuna_config/selects/totusuna_channel_selected');
const { MessageFlagsBitField } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;
  
  console.log('🔽 [selectsHandler] セレクトインタラクション受信');
  console.log('   customId:', customId);
  console.log('   values:', interaction.values);
  console.log('   guildId:', interaction.guildId);
  console.log('   userId:', interaction.user.id);

  let handler = null;

  try {
    // プレフィックス付きのcustomIdを処理
    if (customId.startsWith('star_config:')) {
      console.log('   → star_config ハンドラーにルーティング');
      handler = starSelectHandler(customId);
    } else if (customId.startsWith('totsusuna_setti:')) {
      console.log('   → totsusuna_setti ハンドラーにルーティング');
      handler = totsusunaSelectHandler(customId);
    } else if (customId.startsWith('totusuna_channel_selected_')) {
      console.log('   → totusuna_config ハンドラーにルーティング');
      handler = totusunaConfigSelectHandler;
    } 
    // STAR設定関連のプレフィックスなしcustomIdを処理
    else if (customId === 'admin_role_select' || customId === 'notify_channel_select') {
      console.log('   → star設定ハンドラーに直接処理');
      await starSelectHandler(interaction);
      return;
    }
    // totusuna_setti関連のプレフィックスなしcustomIdを処理
    else if (customId === 'totusuna_select_main' || customId === 'totusuna_select_replicate' || customId === 'totusuna_config_select' || customId === 'totusuna_install_channel_select') {
      console.log('   → totusuna_setti ハンドラーに直接処理');
      await totsusunaSelectHandler(interaction);
      return;
    }
    // その他のプレフィックスなしcustomIdの処理
    else {
      console.log('   → 未対応のcustomId');
      // 他のハンドラーがあれば追加
      handler = null;
    }

    if (!handler) {
      console.warn('⚠️ [selectsHandler] 対応するハンドラーが見つかりません:', customId);
      return await interaction.reply({
        content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    console.log('🔄 [selectsHandler] ハンドラー実行開始');
    await handler.handle(interaction);
    console.log('✅ [selectsHandler] ハンドラー実行完了');
    
  } catch (err) {
    console.error('💥 [selectsHandler] エラー:', err);
    console.error('   エラースタック:', err.stack);
    
    await logAndReplyError(
      interaction,
      `❌ セレクトエラー (${customId})\n${err?.stack || err}`,
      '❌ エラーが発生しました。詳細はコンソールを確認してください。',
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
