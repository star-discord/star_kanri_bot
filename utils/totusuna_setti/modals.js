// utils/totusuna_setti/modals.js
const path = require('path');
const fs = require('fs');

/**
 * totusuna_setti モーダルハンドラー
 * /modals/ ディレクトリの各モジュールを customIdStart に応じて中継
 * モジュール側は { customIdStart, handle } をエクスポートする必要あり
 */
module.exports = async function handleTotusunaSettiModal(interaction) {
  const customId = interaction.customId;
  const dirPath = path.join(__dirname, 'modals');

  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));

  // 優先度付きで並び替え（UUID系の ":" を含むものを優先）
  const handlers = files.map(file => {
    const filePath = path.join(dirPath, file);
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
  }).filter(Boolean);

  handlers.sort((a, b) =>
    b.mod.customIdStart.includes(':') - a.mod.customIdStart.includes(':')
  );

  for (const { mod, filePath } of handlers) {
    if (customId.startsWith(mod.customIdStart)) {
      console.log(`✅ [totusuna_setti] モーダル処理: ${customId} → ${filePath}`);
      try {
        return await mod.handle(interaction);
      } catch (err) {
        console.error(`❌ [totusuna_setti] モーダル処理エラー: ${filePath}`, err);
        return await interaction.reply({
          content: '❌ モーダル処理中にエラーが発生しました。',
          ephemeral: true
        });
      }
    }
  }

  // 該当なし
  await interaction.reply({
    content: '❌ このモーダルには対応していません。',
    ephemeral: true
  });
};
