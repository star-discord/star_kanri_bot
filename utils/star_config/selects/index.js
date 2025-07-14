const path = require('path');
const { loadHandlers } = require('../../handlerLoader');

/**
 * 各セレクトメニューのハンドラーマップを読み込む
 * Map<customId, handler>
 */
function loadHandlerMap(...subDirs) {
  const merged = new Map();
  for (const sub of subDirs) {
    const handlerMap = loadHandlers(path.join(__dirname, '../../', sub));
    for (const [key, val] of handlerMap.entries()) {
      merged.set(key, val);
    }
  }
  return merged;
}

// 優先ハンドラ: totusuna_setti/selects
const totusunaHandlerMap = loadHandlers(path.join(__dirname, '../../totusuna_setti/selects'));

// フォールバック: star_config, totusuna_config
const fallbackHandlerMap = loadHandlerMap(
  'star_config/selects',
  'totusuna_config/selects'
);

/**
 * セレクトメニューインタラクションを処理するメイン関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;
  let handler = null;

  try {
    if (customId.startsWith('totusuna_')) {
      handler = totusunaHandlerMap.get(customId);
    }
    if (!handler) {
      handler = fallbackHandlerMap.get(customId);
    }

    if (!handler) {
      await interaction.reply({
        content: '❌ セレクトメニューに対応する処理が見つかりませんでした。',
        ephemeral: true,
      });
      return;
    }

    await handler.handle(interaction);

  } catch (error) {
    console.error(`❌ セレクトメニュー処理中にエラー (customId: ${customId}):`, error);

    const msg = '⚠️ セレクトメニュー処理中にエラーが発生しました。管理者に報告してください。';

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: msg, ephemeral: true });
      } else {
        await interaction.reply({ content: msg, ephemeral: true });
      }
    } catch (nestedError) {
      console.error('⚠️ エラーメッセージ送信に失敗:', nestedError);
    }
  }
}

module.exports = { handleSelect };
