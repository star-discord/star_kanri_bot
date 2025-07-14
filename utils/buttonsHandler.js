// utils/buttonsHandler.js
const path = require('path');
const { MessageFlags } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

/**
 * 1. Load all handler "finder" functions from their respective directories.
 *    Each finder is a function that takes a customId and returns the correct handler.
 */
const handlerFinders = {
  star_config: loadHandlers(path.join(__dirname, 'star_config/buttons')),
  star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
  totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
  totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
  kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
  attendance: loadHandlers(path.join(__dirname, 'attendance/buttons')),
};

/**
 * Finds the correct handler function based on the customId.
 * @param {string} customId The customId from the interaction.
 * @returns {object|null} The handler object or null if not found.
 */
function findButtonHandler(customId) {
  // Iterate through all handler categories and try to find a match.
  for (const category in handlerFinders) {
    const find = handlerFinders[category];
    // The `find` function is the `findHandler` returned by `loadHandlers`.
    // It will return the handler if found, or null otherwise.
    const handler = find(customId);
    if (handler) {
      return handler; // Return the first handler found.
    }
  }
  return null;
}

/**
 * Handles button interactions by routing them to the correct handler.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (!customId || typeof customId !== 'string') {
    console.warn('[buttonsHandler] Invalid customId received:', customId);
    return interaction.reply({
      content: '⚠️ 不正なボタンが押されました。',
      flags: MessageFlags.Ephemeral,
    });
  }

  const handler = findButtonHandler(customId);

  if (!handler) {
    console.warn(`[buttonsHandler] Unhandled button customId: ${customId}`);
    return interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    console.error(`[buttonsHandler] Error executing handler for ${customId}:`, err);
    await logAndReplyError(
      interaction,
      `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ ボタン処理中にエラーが発生しました。',
      { ephemeral: true }
    );
  }
}

module.exports = { handleButton };
