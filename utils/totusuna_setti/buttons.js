// utils/totusuna_setti/buttons.js
const path = require('path');
const fs = require('fs');

module.exports = async function handleTotusunaButton(interaction) {
  const customId = interaction.customId;
  const baseId = customId.split(':')[0]; // 例: 'tousuna_report_button'

  const buttonsDir = path.join(__dirname, 'buttons');
  const files = fs.readdirSync(buttonsDir);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const buttonId = path.basename(file, '.js');
    if (baseId === buttonId) {
      const handler = require(path.join(buttonsDir, file));
      return handler(interaction);
    }
  }

  console.warn(`[buttons.js] 未知のボタン: ${customId}`);
  await interaction.reply({ content: '⚠️ 未知のボタンです。', ephemeral: true });
};
