const path = require('path');
const { loadHandlers } = require('./handlerLoader');

/**
 * セレクトメニューインタラクションを処理する
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const customId = interaction.customId;

  // 対象ディレクトリ群
  const searchDirs = [
    'star_config/selects',
    'totusuna_config/selects',
    'totusuna_setti/selects',
    'totusuna_quick/selects'
  ];

  for (const dir of searchDirs) {
    const fullDir = path.join(__dirname, dir);
    const findHandler = loadHandlers(fullDir);

    const handler = findHandler(customId);
    if (handler) {
      try {
        return await handler.handle(interaction);
      } catch (err) {
        console.error(`❌ セレクトメニュー処理エラー (${customId})`, err);
        if (!interaction.replied && !interaction.deferred) {
          return await interaction.reply({
            content: '❌ 処理中にエラーが発生しました。',
            ephemeral: true
          });
        }
        return;
      }
    }
  }

  await interaction.reply({
    content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
    ephemeral: true
  });
}

module.exports = { handleSelect };
