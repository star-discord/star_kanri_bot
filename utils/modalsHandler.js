// utils/modalsHandler.js
const path = require('path');
const fs = require('fs');

// 個別モジュールが { customIdStart, handle } を持つ設計前提
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  // 優先的に特定ルートにハンドオフ（例: totusuna_setti）
  if (customId.startsWith('totusuna_')) {
    const handleTotusunaSettiModal = require('./totusuna_setti/modals');
    return await handleTotusunaSettiModal(interaction);
  }

  // 汎用ルーティング：その他のサブディレクトリ探索（必要なら残す）
  const searchDirs = [
    'star_config/modals',
    'totusuna_config/modals',
    'totusuna_quick/modals'
  ];

  for (const dir of searchDirs) {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        delete require.cache[require.resolve(filePath)];
        const mod = require(filePath);
        if (
          typeof mod?.handle === 'function' &&
          typeof mod?.customIdStart === 'string' &&
          customId.startsWith(mod.customIdStart)
        ) {
          return await mod.handle(interaction);
        }
      } catch (err) {
        console.warn(`⚠️ モーダル処理失敗: ${filePath}`, err);
      }
    }
  }

  // 該当なし
  await interaction.reply({
    content: '❌ モーダルに対応する処理が見つかりませんでした。',
    ephemeral: true
  });
}

module.exports = { handleModal };
