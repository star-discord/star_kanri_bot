// utils/modalsHandler.js
const fs = require('fs');
const path = require('path');

/**
 * モーダル送信後の処理
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  const customId = interaction.customId;

  const dirs = fs.readdirSync(__dirname, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const dir of dirs) {
    const modalsDir = path.join(__dirname, dir.name, 'modals');
    if (!fs.existsSync(modalsDir)) continue;

    const files = fs.readdirSync(modalsDir).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const handlerPath = path.join(modalsDir, file);
      const handler = require(handlerPath);

      if (handler?.customIdStart && customId.startsWith(handler.customIdStart)) {
        try {
          const args = customId.replace(handler.customIdStart, '').split(':');
          await handler.handle(interaction, ...args);
          return;
        } catch (err) {
          console.error(`❌ モーダルエラー: ${customId}`, err);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: '❌ モーダル処理中にエラーが発生しました。',
              ephemeral: true
            });
          }
          return;
        }
      }
    }
  }

  // 対応なし
  console.warn(`⚠️ モーダル未対応: ${customId}`);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: '⚠️ このモーダルは未対応です。',
      ephemeral: true
    });
  }
}

module.exports = { handleModal };

