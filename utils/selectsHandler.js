const path = require('path');
const { loadHandlers } = require('./handlerLoader');

// 「totusuna_setti」配下のセレクトメニュー用ハンドラー群を読み込み
const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/selects'));

// その他のセレクトメニュー用ハンドラー群（後方互換など）
const fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects',
  'totusuna_quick/selects'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  // セレクトメニュー以外のインタラクションは無視する
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler = null;

  try {
    // 「totusuna_」で始まる customId を優先的に処理する
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandler(customId);
    } else {
      // フォールバック用ディレクトリ群から対応するハンドラを順に探す
      for (const find of fallbackDirs) {
        handler = find(customId);
        if (handler) break;
      }
    }

    // 対応するハンドラが見つからなかった場合、ユーザーに通知する
    if (!handler) {
      await interaction.reply({
        content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
        ephemeral: true
      });
      return;
    }

    // ハンドラの処理を実行
    await handler.handle(interaction);

  } catch (error) {
    // 処理中に予期せぬ例外が発生した場合はログ出力し、ユーザーに通知
    console.error(`❌ セレクトメニュー処理中にエラー発生 (customId: ${customId}):`, error);

    // すでに応答済みか延期済みなら followUp、そうでなければ reply でエラーメッセージを送信
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
          ephemeral: true
        });
      } catch (followUpError) {
        console.error('❌ フォローアップエラー:', followUpError);
      }
    } else {
      try {
        await interaction.reply({
          content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
          ephemeral: true
        });
      } catch (replyError) {
        console.error('❌ リプライエラー:', replyError);
      }
    }
  }
}

module.exports = { handleSelect };
