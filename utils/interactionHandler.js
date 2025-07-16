// utils/interactionHandler.js

const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { logAndReplyError } = require('./errorHelper');
const { MessageFlagsBitField } = require('discord.js');

/**
 * 統合インタラクションハンドラー（完全一致のみ対応）
 * 部分一致(customIdStart)は廃止
 */
const handlerFinders = {
  button: {
    star_config: loadHandlers(path.join(__dirname, 'star_config/buttons')),
    star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/buttons')),
    totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/buttons')),
    totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/buttons')),
    kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/buttons')),
    attendance: loadHandlers(path.join(__dirname, 'attendance/buttons')),
  },
  select: {
    star_config: loadHandlers(path.join(__dirname, 'star_config/selects')),
    star_chat_gpt_setti: loadHandlers(path.join(__dirname, 'star_chat_gpt_setti/selects')),
    totusuna_setti: loadHandlers(path.join(__dirname, 'totusuna_setti/selects')),
    totusuna_config: loadHandlers(path.join(__dirname, 'totusuna_config/selects')),
    kpi_setti: loadHandlers(path.join(__dirname, 'kpi_setti/selects')),
    attendance: loadHandlers(path.join(__dirname, 'attendance/selects')),
  }
};

const handlerCache = new Map();

/**
 * customId に完全一致するハンドラを探す（type: button/select）
 * @param {string} customId
 * @param {'button'|'select'} type
 * @returns {object|null}
 */
function findHandler(customId, type) {
  const cacheKey = `${type}:${customId}`;
  if (handlerCache.has(cacheKey)) return handlerCache.get(cacheKey);

  const finders = handlerFinders[type];
  for (const category in finders) {
    const find = finders[category];
    if (typeof find !== 'function') continue;
    const handler = find(customId); // 完全一致のみ
    if (handler) {
      handlerCache.set(cacheKey, handler);
      return handler;
    }
  }
  handlerCache.set(cacheKey, null);
  return null;
}

/**
 * ボタン・セレクトインタラクションを処理（完全一致のみ）
 * @param {import('discord.js').Interaction} interaction
 */
async function handleInteraction(interaction) {
  let type = null;
  if (typeof interaction.isButton === 'function' && interaction.isButton()) type = 'button';
  else if (typeof interaction.isStringSelectMenu === 'function' && interaction.isStringSelectMenu()) type = 'select';
  if (!type) return;

  const { customId } = interaction;
  console.log('[interactionHandler] 受信:', { type, customId, user: interaction.user?.tag, guild: interaction.guildId });

  if (!customId || typeof customId !== 'string') {
    return interaction.reply({
      content: '⚠️ 不正なインタラクションです。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }

  const handler = findHandler(customId, type);

  if (!handler) {
    return interaction.reply({
      content: '⚠️ この操作は現在利用できません。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `❌ インタラクション処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ インタラクション処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Flags.Ephemeral }
    );
  }
}

module.exports = { handleInteraction, findHandler };
