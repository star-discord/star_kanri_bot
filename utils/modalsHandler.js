// utils/modalsHandler.js

const { MessageFlagsBitField } = require('discord.js');
const path = require('path');
const { loadHandlers } = require('./handlerLoader');
const { logAndReplyError } = require('./errorHelper');

// totusuna系モーダルハンドラ取得関数
const totusunaHandlerFinder = loadHandlers(path.join(__dirname, 'totusuna_setti/modals'));

// star_chat_gpt_setti/modals.js は単一のハンドラオブジェクトなので、finder形式にラップ
const chatGptModalHandler = require(path.join(__dirname, 'star_chat_gpt_setti', 'modals.js'));
const chatGptFinder = (customId) =>
  chatGptModalHandler.customId === customId ? chatGptModalHandler : null;

// フォールバック用ハンドラ群（順に試す）
const fallbackHandlerFinders = [
  loadHandlers(path.join(__dirname, 'star_config/modals')),
  chatGptFinder,
  loadHandlers(path.join(__dirname, 'totusuna_config/modals')),
];

/**
 * モーダルインタラクション処理のエントリポイント
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModal(interaction) {
  if (!interaction.isModalSubmit()) return;

  const { customId } = interaction;

  console.log(`[handleModal] モーダル受信: customId=${customId}, user=${interaction.user?.tag}, guild=${interaction.guildId}`);

  try {
    let handler = null;

    // totusuna系は専用finderを優先
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandlerFinder(customId);
    } else {
      for (const finder of fallbackHandlerFinders) {
        if (typeof finder !== 'function') continue;
        handler = finder(customId);
        if (handler) break;
      }
    }

    if (!handler) {
      await interaction.reply({
        content: '❌ モーダルに対応する処理が見つかりませんでした。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    // ハンドラ実行
    await handler.handle(interaction);

  } catch (error) {
    console.error(`❌ モーダル処理エラー: customId=${customId}`, error);

    await logAndReplyError(
      interaction,
      `❌ モーダル処理エラー: ${customId}\n${error?.stack || error}`,
      '❌ モーダル処理中にエラーが発生しました。',
      { flags: MessageFlagsBitField.Flags.Ephemeral }
    );
  }
}

module.exports = { handleModal };
