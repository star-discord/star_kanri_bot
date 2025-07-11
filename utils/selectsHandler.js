const path = require('path');
const { loadHandlers } = require('./handlerLoader');

// 「totusuna_setti」配下のセレクトメニュー用ハンドラー群
const totusunaHandler = loadHandlers(path.join(__dirname, 'totusuna_setti/selects'));

// その他のセレクトメニュー用ハンドラー（後方互換など）
const fallbackDirs = [
  'star_config/selects',
  'totusuna_config/selects',
  'totusuna_quick/selects'
].map(sub => loadHandlers(path.join(__dirname, sub)));

/**
 * セレクトメニューインタラクションを処理
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;
  let handler = null;

  // 「totusuna_」系のカスタムIDを優先処理
  if (customId.startsWith('totusuna_')) {
    handler = totusunaHandler(customId);
  } else {
    // フォールバック系のディレクトリで順に検索
    for (const find of fallbackDirs) {
      handler = find(customId);
      if (handler) break;
    }
  }

  // 対応するハンドラがなければエラーを返す
  if (!handler) {
    return await interaction.reply({
      content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
      ephemeral: true
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`❌ セレクトメニュー処理中にエラー発生: ${customId}`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '⚠️ セレクトメニュー処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleSelect };
