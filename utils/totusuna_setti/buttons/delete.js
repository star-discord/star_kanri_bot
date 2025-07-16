// utils/totusuna_setti/buttons/delete.js

const { configManager } = require('../../configManager');
const {
  createSuccessEmbed,
  createErrorEmbed,
  createAdminRejectEmbed
} = require('../../embedHelper');
const { MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../../permissions/checkAdmin');
const { safeReply, safeDefer } = require('../../safeReply');

module.exports = {
  customIdStart: 'totusuna_setti:delete:',

  /**
   * Deletes a "Totsuna" instance, including its message and data entry.
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    console.log(`[${__filename.split('/').pop()}] 開始: ${interaction.customId} by ${interaction.user.tag}`);
    // safeDeferで3秒ルール回避
    await safeDefer(interaction, { flags: MessageFlagsBitField.Flags.Ephemeral });

    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      return await safeReply(interaction, {
        embeds: [createAdminRejectEmbed()],
      });
    }

    const { guild, customId } = interaction;
    const uuid = customId.substring(module.exports.customIdStart.length);

    try {
      // インスタンス取得（messageId・channelId含む）
      const instance = await configManager.getTotusunaInstance(guild.id, uuid);

      if (instance?.messageId && instance.installChannelId) {
        try {
          const channel = await guild.channels.fetch(instance.installChannelId);
          const message = await channel.messages.fetch(instance.messageId).catch(() => null);

          if (message) {
            await message.delete();
            console.log(`[delete.js] 設置メッセージ削除完了 (guild: ${guild.id}, uuid: ${uuid})`);
          } else {
            console.warn(`[delete.js] メッセージが存在しないため削除できません (guild: ${guild.id}, uuid: ${uuid})`);
          }

        } catch (err) {
          console.warn(
            `[delete.js] メッセージ削除失敗 (guild: ${guild.id}, uuid: ${uuid})`,
            err
          );
          // チャンネルやメッセージ取得エラー → 致命的ではないので続行
        }
      }

      const success = await configManager.removeTotusunaInstance(guild.id, uuid);

      if (success) {
        console.log(`[delete.js] DBからインスタンス削除成功 (guild: ${guild.id}, uuid: ${uuid})`);
        await safeReply(interaction, {
          embeds: [createSuccessEmbed('削除完了', '凸スナの設置データを削除しました。')],
        });
      } else {
        console.warn(`[delete.js] DBからインスタンス削除失敗、または該当なし (guild: ${guild.id}, uuid: ${uuid})`);
        await safeReply(interaction, {
          embeds: [createErrorEmbed('削除失敗', '指定された凸スナが見つかりませんでした。データが既に削除されている可能性があります。')],
        });
      }

    } catch (err) {
      console.error(`[delete.js] インスタンス削除中にエラー (guild: ${guild.id}, uuid: ${uuid})`, err);
      await safeReply(interaction, {
        embeds: [createErrorEmbed('処理エラー', '凸スナの削除中に予期せぬエラーが発生しました。')],
      });
    }
    console.log(`[${__filename.split('/').pop()}] 完了: ${interaction.customId}`);
  },
};
