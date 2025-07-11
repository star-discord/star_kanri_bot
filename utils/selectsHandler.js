const path = require('path');
const { loadHandlers } = require('./handlerLoader');

/**
 * セレクトメニューの処理
 * 各 select モジュールは { customIdStart, handle } または { customId, handle } をエクスポートする
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;

  // 検索対象の select モジュールディレクトリ（必要に応じて追加）
  const searchDirs = [
    'star_config/selects',
    'totusuna_config/selects',
    'totusuna_setti/selects',
    'totusuna_quick/selects'
  ];

  for (const dir of searchDirs) {
    const fullPath = path.join(__dirname, dir);
    const findHandler = loadHandlers(fullPath); // 共通ローダーで handler 探索関数を生成
    const handler = findHandler(customId);
    if (handler && typeof handler.handle === 'function') {
      try {
        return await handler.handle(interaction);
      } catch (err) {
        console.error(`❌ セレクト処理中にエラー発生: ${customId}`, err);
        if (!interaction.replied) {
          return await interaction.reply({
            content: '⚠️ セレクトメニューの処理中にエラーが発生しました。',
            ephemeral: true
          });
        }
      }
    }
  }

  // 対応なし
  await interaction.reply({
    content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
    ephemeral: true
  });
}

module.exports = { handleSelect };
