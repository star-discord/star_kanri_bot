// commands/common/selectHandler.js
const starSelectHandler = require('../utils/star_config/selects');
const totusunaSelectHandler = require('../utils/totusuna_setti/selects');
const totusunaConfigSelectHandler = require('../utils/totusuna_config/selects/totusuna_channel_selected');
const { MessageFlagsBitField } = require('discord.js');
const { logAndReplyError } = require('./errorHelper');

const PREFIX_STAR_CONFIG = 'star_config:';
const PREFIX_TOTSUUNA_SETTI = 'totusuna_setti:';
const PREFIX_TOTSUUNA_CONFIG = 'totusuna_channel_selected_';

const DIRECT_STAR_HANDLERS = new Set(['admin_role_select', 'notify_channel_select']);
const DIRECT_TOTSUUNA_HANDLERS = new Set([
  'totusuna_select_main',
  'totusuna_select_replicate',
  'totusuna_config_select',
  'totusuna_install_channel_select',
]);

function isHandlerObject(handler) {
  return handler && typeof handler.handle === 'function';
}

function isHandlerFunction(handler) {
  return typeof handler === 'function';
}

/**
 * プレフィックス別にハンドラを取得・呼び出し
 * @param {string} customId
 * @returns {object|function|null}
 */
function getHandlerByPrefix(customId) {
  if (customId.startsWith(PREFIX_STAR_CONFIG)) return starSelectHandler(customId);
  if (customId.startsWith(PREFIX_TOTSUUNA_SETTI)) return totusunaSelectHandler(customId);
  if (customId.startsWith(PREFIX_TOTSUUNA_CONFIG)) return totusunaConfigSelectHandler;
  return null;
}

/**
 * セレクトメニューインタラクション共通ハンドラ
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId, guildId, user } = interaction;
  console.log(`[selectHandler] セレクト受信: customId=${customId}, guild=${guildId}, user=${user.id}`);

  try {
    // プレフィックスでハンドラ取得
    let handler = getHandlerByPrefix(customId);

    // プレフィックス無しの直接ハンドラ呼び出し
    if (!handler) {
      if (DIRECT_STAR_HANDLERS.has(customId)) {
        await starSelectHandler(interaction);
        return;
      }
      if (DIRECT_TOTSUUNA_HANDLERS.has(customId)) {
        await totusunaSelectHandler(interaction);
        return;
      }
      console.warn(`[selectHandler] 未対応 customId: ${customId}`);
      await interaction.reply({
        content: '❌ 対応する処理が見つかりませんでした。',
        flags: MessageFlagsBitField.Ephemeral,
      });
      return;
    }

    if (isHandlerObject(handler)) {
      await interaction.deferReply({ ephemeral: true });
      await handler.handle(interaction);
      await interaction.editReply({ content: '✅ 処理が完了しました。' });
    } else if (isHandlerFunction(handler)) {
      await interaction.deferReply({ ephemeral: true });
      await handler(interaction);
      await interaction.editReply({ content: '✅ 処理が完了しました。' });
    } else {
      throw new Error(`ハンドラーの形式が不正です。customId=${customId}`);
    }
  } catch (error) {
    console.error(`[selectHandler] エラー: ${error.stack || error}`);

    await logAndReplyError(
      interaction,
      `❌ セレクトエラー (${customId})\n${error.stack || error}`,
      '❌ エラーが発生しました。詳細はコンソールを確認してください。',
      { flags: MessageFlagsBitField.Ephemeral }
    );
  }
}

module.exports = { handleSelect };
