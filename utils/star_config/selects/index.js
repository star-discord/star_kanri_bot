// utils/star_config/selects/index.js

const { loadHandlers } = require('../../../handlerLoader');
const logger = require('../../../utils/logger');

// カテゴリやアクションの定数化（必要に応じて別ファイルに切り出し可能）
const CATEGORY_STAR_CONFIG = 'star_config';
const CATEGORY_TOTUSUNA_CONFIG = 'totusuna_config';

const ACTION_ADMIN_ROLE_SELECT = 'admin_role_select';
const ACTION_NOTIFY_CHANNEL_SELECT = 'notify_channel_select';
const ACTION_TOTUSUNA_SELECT = 'select';

// 動的ハンドラ読み込み（同一ディレクトリ内の全JSファイルから）
const path = require('path');
const findHandler = loadHandlers(path.join(__dirname));

/**
 * interactionCreateイベント用セレクトメニューインタラクションハンドラ
 * @param {import('discord.js').SelectMenuInteraction} interaction
 */
async function handleSelectInteraction(interaction) {
  if (!interaction.isSelectMenu()) return;

  // customIdが文字列であることを確認
  if (typeof interaction.customId !== 'string' || interaction.customId.length === 0) {
    logger.warn('[Interaction] 無効な customId を受け取りました。');
    return;
  }

  const handler = findHandler(interaction.customId);

  if (!handler) {
    logger.warn(`[Interaction] 未知の customId: ${interaction.customId}`);
    return;
  }

  try {
    await handler.handle(interaction);
  } catch (error) {
    logger.error(`[Interaction] ハンドラー処理中にエラーが発生しました:`, error);

    // ユーザーにエラー通知（まだ応答していない場合はreply、応答済みならfollowUp）
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '処理中にエラーが発生しました。管理者に連絡してください。',
          ephemeral: true,
        });
      } else {
        await interaction.followUp({
          content: '処理中にエラーが発生しました。管理者に連絡してください。',
          ephemeral: true,
        });
      }
    } catch (notifyError) {
      logger.error('[Interaction] ユーザーへのエラー通知中に失敗しました。', notifyError);
    }
  }
}

module.exports = {
  handleSelectInteraction,
};
