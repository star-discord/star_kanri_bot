
const path = require('path');
const { loadHandlers } = require('../../handlerLoader');

// 「totusuna_setti」�E下�Eセレクトメニュー用ハンドラー群を読み込み
const totusunaHandler = loadHandlers(path.join(__dirname, '../../totusuna_setti/selects'));

// そ�E他�Eセレクトメニュー用ハンドラー群�E�後方互換など�E�Econst fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects'
].map(sub => loadHandlers(path.join(__dirname, '../../', sub)));

/**
 * セレクトメニューインタラクションを�E琁E��るメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  // セレクトメニュー以外�Eインタラクションは無要E  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler = null;

  try {
    // 「totusuna_」で始まめEcustomId を優先的に処琁E    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandler(customId);
    } else {
      // フォールバック用チE��レクトリ群から対応するハンドラを頁E��探索
      for (const find of fallbackDirs) {
        handler = find(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      // 対応ハンドラなし。ユーザーへ通知
      await interaction.reply({
        content: ':x: セレクトメニューに対応する�E琁E��見つかりませんでした、E,
        ephemeral: true,
      });
      return;
    }

    // ハンドラの処琁E��実衁E    await handler.handle(interaction);

  } catch (error) {
    // 例外発生時のログ出劁E    console.error(`❁Eセレクトメニュー処琁E��にエラー発甁E(customId: ${customId}):`, error);

    // すでに返信済み or defer済みなめEfollowUp、それ以外�E reply でエラーメチE��ージ送信
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: ':warning: セレクトメニュー処琁E��にエラーが発生しました。管琁E��E��報告してください、E,
          ephemeral: true,
        });
      } catch (followUpError) {
        console.error(':x: フォローアチE�E送信中にエラー:', followUpError);
      }
    } else {
      try {
        await interaction.reply({
          content: ':warning: セレクトメニュー処琁E��にエラーが発生しました。管琁E��E��報告してください、E,
          ephemeral: true,
        });
      } catch (replyError) {
        console.error(':x: リプライ送信中にエラー:', replyError);
      }
    }
  }
}

module.exports = { handleSelect };
