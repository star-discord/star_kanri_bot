const path = require('path');
const fs = require('fs');

/**
 * ボタンインタラクションを処理する
 * 各モジュールは { customIdStart, handle } をエクスポート
 * ファイル名ではなく customIdStart に基づいてルーティングされる
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  const searchModules = [
    './star_config/buttons',
    './totusuna_config/buttons',
    './totusuna_setti/buttons',
    './totusuna_quick/buttons'
  ];

  for (const relativeDir of searchModules) {
    const fullDir = path.join(__dirname, relativeDir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(fullDir, file);
      try {
        delete require.cache[require.resolve(filePath)];
        const mod = require(filePath);

        const matchStart = mod.customIdStart && customId.startsWith(mod.customIdStart);
        const matchExact = mod.customId && customId === mod.customId;

        if ((matchStart || matchExact) && typeof mod.handle === 'function') {
          return await mod.handle(interaction);
        }
      } catch (err) {
        console.warn(`⚠️ ボタン処理失敗: ${filePath}`, err);
      }
    }
  }

  await interaction.reply({
    content: '❌ ボタンに対応する処理が見つかりませんでした。',
    ephemeral: true
  });
}

module.exports = { handleButton };
