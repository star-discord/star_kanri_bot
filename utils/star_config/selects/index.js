
const path = require('path');
const { loadHandlers } = require('./handlerLoader');

// 「totusuna_setti」配下のセレクトメニュー用ハンドラー群を読み込み
const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/selects'));

// その他のセレクトメニュー用ハンドラー群（後方互換など）
const fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  // セレクトメニュー以外のインタラクションは無視
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler = null;

  try {
    // 「totusuna_」で始まる customId を優先的に処理
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandler(customId);
    } else {
      // フォールバック用ディレクトリ群から対応するハンドラを順に探索
      for (const find of fallbackDirs) {
        handler = find(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      // 対応ハンドラなし。ユーザーへ通知
      await interaction.reply({
        content: ':x: セレクトメニューに対応する処理が見つかりませんでした。',
        ephemeral: true,
      });
      return;
    }

    // ハンドラの処理を実行
    await handler.handle(interaction);

  } catch (error) {
    // 例外発生時のログ出力
    console.error(`❌ セレクトメニュー処理中にエラー発生 (customId: ${customId}):`, error);

    // すでに返信済み or defer済みなら followUp、それ以外は reply でエラーメッセージ送信
    if (interaction.replied || interaction.deferred) {
      try {
        await interaction.followUp({
          content: ':warning: セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
          ephemeral: true,
        });
      } catch (followUpError) {
        console.error(':x: フォローアップ送信中にエラー:', followUpError);
      }
    } else {
      try {
        await interaction.reply({
          content: ':warning: セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。',
          ephemeral: true,
        });
      } catch (replyError) {
        console.error(':x: リプライ送信中にエラー:', replyError);
      }
    }
  }
}

module.exports = { handleSelect };
