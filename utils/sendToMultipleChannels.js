// utils/sendToMultipleChannels.js

/**
 * 複数のテキストチャンネルに同一メッセージを送信します
 * @param {Client} client - Discordクライアント
 * @param {string[]} channelIds - チャンネルIDの配列
 * @param {string|MessagePayload|MessageCreateOptions} message - 送信するメッセージ
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds)) {
    console.warn('[sendToMultipleChannels] channelIds が配列ではありません');
    return;
  }

  for (const channelId of channelIds) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.warn(`[sendToMultipleChannels] チャンネル取得失敗: ${channelId}`);
        continue;
      }

      if (!channel.isTextBased()) {
        console.warn(`[sendToMultipleChannels] テキストチャンネルではありません: ${channelId}`);
        continue;
      }

      await channel.send(message);
    } catch (err) {
      console.error(`[sendToMultipleChannels] 送信失敗（チャンネルID: ${channelId}）`, err);
    }
  }
};
