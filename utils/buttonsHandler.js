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
 * 2. Map customId prefixes and exact IDs to the correct handler category.
 *    This allows for efficient, direct routing.
 */
const customIdMapping = {
  'totusuna_install_button': 'totusuna_setti',
  'totusuna_config_button': 'totusuna_setti',
  'chatgpt_config_button': 'star_chat_gpt_setti',
  'star_chat_gpt_setti_button': 'star_chat_gpt_setti',
};

const prefixMapping = {
  'star_config:': 'star_config',
  'totusuna_': 'totusuna_setti',
  'totsusuna_report_button_': 'totusuna_setti',
  'totusuna_config:': 'totusuna_config',
  'kpi_': 'kpi_setti',
  'attendance_': 'attendance',
};

/**
 * Finds the correct handler function based on the customId.
 * @param {string} customId The customId from the interaction.
 * @returns {object|null} The handler object or null if not found.
 */
function findButtonHandler(customId) {
  // 1. Check for an exact match in the customIdMapping
  const exactCategory = customIdMapping[customId];
  if (exactCategory) {
    const find = handlerFinders[exactCategory];
    return find ? find(customId) : null;
  }

  // 2. Check for a prefix match
  for (const [prefix, category] of Object.entries(prefixMapping)) {
    if (customId.startsWith(prefix)) {
      const find = handlerFinders[category];
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
