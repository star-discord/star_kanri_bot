// utils/modalsHandler.js
const path = require('path');
const fs = require('fs');

/**
 * モーダルインタラクションを処理する
 * 各モジュールは { customIdStart, handle } をエクスポート
 * ファイル名は自由だが customIdStart に一致するかで判断
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const customId = interaction.customId;

  // ハンドラ候補のあるディレクトリ一覧（必要に応じて追加）
  const searchDirs = [
    'star_config/modals',
    'totusuna_config/modals',
    'totusuna_setti/modals',
    'totusuna_quick/modals'
  ];

  for (const dir of searchDirs) {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        const mod = require(filePath);
        if (mod && typeof mod.handle === 'function' && typeof mod.customIdStart === 'string') {
          if (customId.startsWith(mod.customIdStart)) {
            return await mod.handle(interaction);
          }
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

module.exports = { handleModal };

