// commands/common/selectHandler.js
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 各カテゴリのハンドラローダーを作成
const handlerFinders = [
  loadHandlers(path.join(__dirname, 'star_config/selects')),
  loadHandlers(path.join(__dirname, 'totusuna_setti/selects')),
  // loadHandlers(path.join(__dirname, 'totusuna_config/selects')), // このディレクトリは存在しないため削除
];

/**
 * customId に対応するハンドラを探す
 * @param {string} customId
 * @returns {object|null}
 */
function findSelectHandler(customId) {
  for (const find of handlerFinders) {
    const handler = find(customId);
    if (handler) return handler;
  }
  return null;
}

/**
 * セレクトメニューインタラクション共通ハンドラ
 * @param {import('discord.js').AnySelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isAnySelectMenu()) return;

  const { customId } = interaction;
  console.log(`[selectsHandler] セレクト受信: customId=${customId}, user=${interaction.user?.tag}, guild=${interaction.guildId}`);

  const handler = findSelectHandler(customId);

  if (!handler) {
    console.warn(`[selectsHandler] 未処理の customId: ${customId}`);
    return interaction.reply({
      content: '⚠️ このメニューは現在利用できません。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(`[selectsHandler] セレクトハンドラエラー: ${customId}`, error);
    await logAndReplyError(
      interaction,
      `❌ セレクトメニュー処理エラー: ${customId}\n${error?.stack || error}`,
      '❌ 処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Flags.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
