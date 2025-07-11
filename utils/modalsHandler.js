const path = require('path');
const { loadHandlers } = require('./handlerLoader');

// 優先ルート（例：totusuna_setti）
const findTotusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));

// その他の汎用ルート
const fallbackDirs = [
  'star_config/modals',
  'totusuna_config/modals',
  'totusuna_quick/modals'
].map(subdir => loadHandlers(path.join(__dirname, subdir)));

/**
 * モーダルインタラクションを処理する
 * 各モジュールは { customIdStart/customId, handle } をエクスポート
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  // ① 優先：totusuna_setti/
  const handler = findTotusunaHandler(customId);
  if (handler) {
    try {
      return await handler.handle(interaction);
    } catch (err) {
      console.error(`❌ totusuna_setti モーダル処理エラー: ${customId}`, err);
    }
  }

  // ② 汎用サブディレクトリ（fallbackDirs）
  for (const findHandler of fallbackDirs) {
    const fallbackHandler = findHandler(customId);
    if (fallbackHandler) {
      try {
        return await fallbackHandler.handle(interaction);
      } catch (err) {
        console.error(`❌ 汎用モーダル処理エラー: ${customId}`, err);
      }
    }
  }

  // ③ 該当なし
  await interaction.reply({
    content: '❌ モーダルに対応する処理が見つかりませんでした。',
    ephemeral: true,
  });
}

module.exports = { handleModal };
