// utils/sendToMultipleChannels.js

/**
 * 複数のテキストチャンネルに同一メッセージを送信するユーティリティ
 * @param {import('discord.js').Client} client - Discordクライアント
 * @param {string[]} channelIds - チャンネルIDの配列
 * @param {string | import('discord.js').MessagePayload | import('discord.js').MessageCreateOptions} message - 送信メッセージ
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds)) {
    console.warn('[sendToMultipleChannels] channelIds は配列である必要があります');
    return;
  }

  if (!client?.channels?.fetch) {
    console.error('[sendToMultipleChannels] 無効な Discord クライアントが渡されました');
    return;
  }

  for (const channelId of channelIds) {
    try {
      const channel = await client.channels.fetch(channelId);

      if (!channel) {
        console.warn(`[sendToMultipleChannels] チャンネル取得失敗: ${channelId}`);
        continue;
      }

      if (!channel.isTextBased?.()) {
        console.warn(`[sendToMultipleChannels] テキストベースのチャンネルではありません: ${channelId}`);
        continue;
      }

      await channel.send(message);
      console.log(`[sendToMultipleChannels] メッセージ送信成功: ${channelId}`);
    } catch (err) {
      console.error(`[sendToMultipleChannels] メッセージ送信失敗（チャンネルID: ${channelId}）`, {
        message: err.message,
        stack: err.stack,
      });
    }
  }
};
