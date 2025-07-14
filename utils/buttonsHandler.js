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
 * 2. Map customId prefixes to the correct handler category.
 *    This allows for efficient, direct routing.
 */
const prefixMapping = {
  'star_config:': 'star_config',
  'star_chat_gpt_': 'star_chat_gpt_setti',
  'totsusuna_': 'totusuna_setti', // Handle common typo
  'totusuna_': 'totusuna_setti',
  'totusuna_config:': 'totusuna_config',
  'kpi_': 'kpi_setti',
  'attendance_': 'attendance',
};

/**
 * Finds the correct handler function based on the customId prefix.
 * @param {string} customId The customId from the interaction.
 * @returns {object|null} The handler object or null if not found.
 */
function findButtonHandler(customId) {
  for (const [prefix, category] of Object.entries(prefixMapping)) {
    if (customId.startsWith(prefix)) {
      const find = handlerFinders[category];
      // The finder function itself will find the specific handler (e.g., for 'edit' or 'delete')
      return find ? find(customId) : null;
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
      ephemeral: true,
    });
  }

  const handler = findButtonHandler(customId);

  if (!handler) {
    console.warn(`[buttonsHandler] Unhandled button customId: ${customId}`);
    return interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      ephemeral: true,
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
