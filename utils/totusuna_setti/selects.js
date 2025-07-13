// utils/totusuna_setti/selects.js
const { MessageFlags } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// totusuna_setti専用のハンドラを読み込み
const totusunaHandlers = loadHandlers(path.join(__dirname, 'selects'));

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  
  console.log('🔽 [totusuna_setti/selects] セレクト処理開始');
  console.log('   customId:', customId);
  console.log('   values:', interaction.values);
  console.log('   guildId:', interaction.guildId);
  console.log('   userId:', interaction.user.id);
  
  let handler;

  // totusuna関連のハンドラを探す
  console.log('🔍 [totusuna_setti/selects] ハンドラー検索中...');
  handler = totusunaHandlers(customId);
  console.log('   見つかったハンドラー:', handler ? 'あり' : 'なし');

  if (!handler) {
    console.warn('⚠️ [totusuna_setti/selects] 対応するハンドラーが見つかりません:', customId);
    console.log('   利用可能なハンドラー一覧:', Object.keys(totusunaHandlers));
    
    await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    console.log('🔄 [totusuna_setti/selects] ハンドラー実行開始');
    await handler.handle(interaction);
    console.log('✅ [totusuna_setti/selects] ハンドラー実行完了');
  } catch (error) {
    console.error('💥 [totusuna_setti/selects] ハンドラー実行エラー:', error);
    console.error('   エラースタック:', error.stack);
    console.error(`   customId: ${customId}`);

    const errorMessage = {
      content: '⚠️ セレクトメニュー処理中にエラーが発生しました。詳細はコンソールを確認してください。',
      flags: MessageFlags.Ephemeral,
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (replyError) {
      console.error('💥 [totusuna_setti/selects] エラーレスポンス送信失敗:', replyError);
    }
  }
}

module.exports = { handleSelect };
