// utils/buttonsHandler.js
const path = require('path');
const { MessageFlags } = require('discord.js');
const { loadHandlers } = require('./handlerLoader.js');
const { logAndReplyError } = require('./errorHelper');

// 吁E��チE��リのbuttons.jsを読み込み�E�Ejs付きでパス持E��！Econst starConfigHandler = require(path.join(__dirname, 'star_config', 'buttons.js'));
const starChatGptSettiHandler = require(path.join(__dirname, 'star_chat_gpt_setti', 'buttons.js'));
const totusunaSettiHandler = loadHandlers(path.join(__dirname, 'totusuna_setti', 'buttons'));
const totusunaConfigHandler = loadHandlers(path.join(__dirname, 'totusuna_config', 'buttons'));
const kpiHandler = require(path.join(__dirname, 'kpi_setti', 'buttons.js'));

const fallbackHandlers = [
  starConfigHandler,
  starChatGptSettiHandler,
  totusunaSettiHandler,
  totusunaConfigHandler,
  kpiHandler,
];

/**
 * ボタンインタラクションの処琁E * @param {import('discord.js').ButtonInteraction} interaction
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
    console.warn(`⚠�E�E未対応�Eボタン: ${customId}`);
    return await interaction.reply({
      content: '⚠�E�Eこ�Eボタンは現在利用できません、E,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await handler.handle(interaction);
  } catch (err) {
    await logAndReplyError(
      interaction,
      `❁Eボタン処琁E��ラー: ${customId}\n${err?.stack || err}`,
      '❁Eボタン処琁E��にエラーが発生しました、E,
      { flags: MessageFlags.Ephemeral }
    );
  }
}

module.exports = { handleButton };
