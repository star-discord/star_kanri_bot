// utils/modalsHandler.js
const fs = require('fs');
const path = require('path');

/**
 * 安全なファイル名かどうかを判定
 * @param {string} str
 * @returns {boolean}
 */
function isSafeName(str) {
  return typeof str === 'string' && /^[a-zA-Z0-9_\-:]+$/.test(str);
}

/**
 * モーダル送信後の処理
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  const customId = interaction.customId;

  // 固定のパターン: "コマンド名:アクション" or "コマンド名:アクション:uuid" など
  const [commandName, action, ...args] = customId.split(':');

  if (!isSafeName(commandName) || !isSafeName(action)) {
    console.warn(`⚠️ 不正な customId: ${customId}`);
    return await interaction.reply({
      content: '⚠️ 無効なモーダル操作です。',
      ephemeral: true
    });
  }

  // モーダルの処理ファイル（例: utils/<commandName>/modals/<action>.js）
  const handlerPath = path.join(__dirname, commandName, 'modals', `${action}.js`);

  if (!fs.existsSync(handlerPath)) {
    console.warn(`⚠️ モーダル処理ファイルが存在しません: ${handlerPath}`);
    return await interaction.reply({
      content: '⚠️ このモーダルは現在利用できません。',
      ephemeral: true
    });
  }

  try {
    const handler = require(handlerPath);
    if (typeof handler.handle !== 'function') {
      throw new Error('handler.handle が存在しません');
    }

    await handler.handle(interaction, ...args);

  } catch (err) {
    console.error(`❌ モーダル処理エラー: ${customId}`, err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ モーダル処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
}

module.exports = { handleModal };
