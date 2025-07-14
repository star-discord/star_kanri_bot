// utils/buttonsHandler.js
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 各ディレクトリのbuttons.jsを読み込み、js付きでパス指定！
const starConfigHandler = require(path.join(__dirname, 'star_config', 'buttons.js'));
const starChatGptSettiHandler = require(path.join(__dirname, 'star_chat_gpt_setti', 'buttons.js'));
const totusunaSettiHandler = loadHandlers(path.join(__dirname, 'totusuna_setti', 'buttons'));
const totusunaConfigHandler = loadHandlers(path.join(__dirname, 'totusuna_config', 'buttons'));
const kpiHandler = require(path.join(__dirname, 'kpi_setti', 'buttons.js'));
const attendanceHandler = require(path.join(__dirname, 'attendance', 'buttons.js'));

const fallbackHandlers = [
  starConfigHandler,
  starChatGptSettiHandler,
  totusunaSettiHandler,
  totusunaConfigHandler,
  kpiHandler,
  attendanceHandler,
];

/**
 * ボタンインタラクションの処理
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  let handler = null;
  for (const find of fallbackHandlers) {
    handler = find(customId);
    if (handler) break;
  }

  if (!handler) {
    console.warn(`⚠️ 未対応のボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠️ このボタンは現在利用できません。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `❌ ボタン処理エラー: ${customId}\n${err?.stack || err}`,
      '❌ ボタン処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Ephemeral }
    );
  }
}

module.exports = { handleButton };
