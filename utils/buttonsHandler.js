const path = require('path');
const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 各カテゴリのハンドラローダーを作成
const handlerFinders = {
  star_config: loadHandlers(path.join(__dirname, 'star_config/buttons')),
  star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
  totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
  totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
  kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
  attendance: loadHandlers(path.join(__dirname, 'attendance/buttons')),
};

/**
 * customId に対応するハンドラを探す
 * @param {string} customId
 * @returns {object|null}
 */
function findButtonHandler(customId) {
  for (const category in handlerFinders) {
    const find = handlerFinders[category];
    if (typeof find !== 'function') continue;
    
    const handler = find(customId);
    if (handler) return handler;
  }
  return null;
}

/**
 * ボタンインタラクションを処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const { customId } = interaction;
  console.log(`[buttonsHandler] ボタン受信: customId=${customId}, user=${interaction.user?.tag}, guild=${interaction.guildId}`);

  if (!customId || typeof customId !== 'string') {
    console.warn('[buttonsHandler] 無効な customId:', customId);
    return interaction.reply({
      content: '⚠️ 不正なボタンが押されました。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }

  const handler = findButtonHandler(customId);

  if (!handler) {
    console.warn(`[buttonsHandler] 未処理の customId: ${customId}`);
    return interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`[buttonsHandler] ボタンハンドラエラー: ${customId}`, err);
    await logAndReplyError(
      interaction,
      `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ ボタン処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Flags.Ephemeral }
    );
  }
}

module.exports = { handleButton };
