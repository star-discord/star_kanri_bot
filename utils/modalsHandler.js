const path = require('path');
const { loadHandlers } = require('./handlerLoader');

const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));
const fallbackHandlers = [
  'star_config/modals',
  'totusuna_config/modals',
  'totusuna_quick/modals'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * モーダルインタラクションを処理する
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  let handler = null;

  try {
    // customIdがtotusuna_で始まる場合、専用ハンドラから検索
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandler(customId);
    } else {
      // それ以外はフォールバック用ハンドラから順番に検索
      for (const find of fallbackHandlers) {
        handler = find(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      return await interaction.reply({
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        ephemeral: true,
      });
    }

    // ハンドラを実行
    await handler.handle(interaction);

  } catch (err) {
    console.error(`❌ モーダル処理エラー: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ モーダル処理中にエラーが発生しました。',
        ephemeral: true,
      });
    }
  }
}

module.exports = { handleModal };
