const { MessageFlags } = require('discord.js');
const path = require('path');
const findHandler = require('../handlerLoader');

/**
 * セレクトメニューインタラクション処理のメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId, values, guildId, user } = interaction;

  console.log(new Date().toISOString(), '[totusuna_setti/selects]', `customId=${customId} guildId=${guildId} userId=${user.id}`);

  if (!Array.isArray(values) || values.length === 0) {
    await interaction.reply({
      content: '⚠️ 選択された値がありません。',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // 最新のハンドラを取得（ホットリロードなど対応）
  const selectsHandler = findHandler(path.join(__dirname, 'selects'));
  const handler = selectsHandler(customId);

  if (!handler) {
    console.warn(new Date().toISOString(), `[totusuna_setti/selects] ハンドラ未発見: ${customId}`);
    await interaction.reply({
      content: '❌ このセレクトメニューに対応する処理がありません。',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    console.error(new Date().toISOString(), `[totusuna_setti/selects] 処理中エラー: customId=${customId}`, error);

    const errorMessage = {
      content: '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に連絡してください。',
      flags: MessageFlags.Ephemeral,
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (replyError) {
      console.error(new Date().toISOString(), `[totusuna_setti/selects] エラーレスポンス送信失敗:`, replyError);
    }
  }
}

module.exports = { handleSelect };
