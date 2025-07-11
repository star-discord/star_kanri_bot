// utils/modalsHandler.js
const path = require('path');
const fs = require('fs');

/**
 * モーダルインタラクションを処理する
 * 各モジュールは { customIdStart, handle } をエクスポート
 * ファイル名ではなく customIdStart に基づいてルーティングされる
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  const searchModules = [
    './star_config/modals',
    './totusuna_config/modals',
    './totusuna_setti/modals',
    './totusuna_quick/modals'
  ];

  for (const relativeDir of searchModules) {
    const fullDir = path.join(__dirname, relativeDir);

    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        delete require.cache[require.resolve(filePath)]; // 開発用：再読み込み
        const mod = require(filePath);

        const matchStart = mod.customIdStart && customId.startsWith(mod.customIdStart);
        const matchExact = mod.customId && customId === mod.customId;

        if ((matchStart || matchExact) && typeof mod.handle === 'function') {
          return await mod.handle(interaction);
        }
      } catch (err) {
        console.warn(`⚠️ モーダル処理失敗: ${filePath}`, err);
      }
    }
  }

  // 対応なし
  await interaction.reply({
    content: '❌ モーダルに対応する処理が見つかりませんでした。',
    ephemeral: true
  });
}

module.exports = { handleModal };
