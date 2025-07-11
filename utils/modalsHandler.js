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

    // ファイルごとにモジュール読み込み + customIdStart を抽出
    const handlers = files
      .map(file => {
        const filePath = path.join(fullDir, file);
        try {
          delete require.cache[require.resolve(filePath)];
          const mod = require(filePath);
          if (
            typeof mod?.handle === 'function' &&
            typeof mod?.customIdStart === 'string'
          ) {
            return { mod, filePath };
          }
        } catch (err) {
          console.warn(`⚠️ モジュール読み込み失敗: ${filePath}`, err);
        }
        return null;
      })
      .filter(Boolean);

    // 「:」を含むIDほど優先的に評価
    handlers.sort((a, b) =>
      b.mod.customIdStart.includes(':') - a.mod.customIdStart.includes(':')
    );

    for (const { mod, filePath } of handlers) {
      if (customId.startsWith(mod.customIdStart)) {
        console.log(`✅ モーダル処理: ${customId} → ${filePath}`);
        try {
          return await mod.handle(interaction);
        } catch (err) {
          console.error(`❌ モーダル処理エラー: ${filePath}`, err);
          return await interaction.reply({
            content: '❌ モーダル処理中にエラーが発生しました。',
            ephemeral: true
          });
        }
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
