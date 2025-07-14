const { MessageFlags } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { logAndReplyError } = require('./errorHelper');

// totusuna系モーダルハンドラ取得関数
const totusunaHandlerFinder = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));

// フォールバック用ハンドラ群（順に試す）
const fallbackHandlerFinders = [
  loadHandlers(path.join(__dirname, 'star_config/modals')),
  require(path.join(__dirname, 'star_chat_gpt_setti', 'modals.js')),
  loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
];

/**
 * モーダルインタラクション処理のエントリポイント
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const { customId } = interaction;

  try {
    let handler = null;

    // customIdでハンドラを探す
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandlerFinder(customId);
    } else {
      for (const finder of fallbackHandlerFinders) {
        handler = finder(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      return await interaction.reply({
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        flags: MessageFlags.Ephemeral,
      });
    }

    // ハンドラ実行
    await handler.handle(interaction);

  } catch (error) {
    console.error(`❌ モーダル処理エラー: customId=${customId}`, error);

    await logAndReplyError(
      interaction,
      `❌ モーダル処理エラー: ${customId}\n${error?.stack || error}`,
      '❌ モーダル処理中にエラーが発生しました。',
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleModal };
