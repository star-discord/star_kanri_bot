// utils/sendToMultipleChannels.js
/**
 * 複数のテキストチャンネルに同一メッセージを送信します
 * @param {Client} client Discordクライアント
 * @param {string[]} channelIds チャンネルID配列
 * @param {string|MessagePayload|MessageCreateOptions} message 送信内容
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds)) {
    console.warn('[sendToMultipleChannels] channelIds が配列ではありません');
    return;
  }

  for (const id of channelIds) {
    try {
      const channel = await client.channels.fetch(id);
      if (channel?.isTextBased()) {
        await channel.send(message);
      } else {
        console.warn(`[sendToMultipleChannels] チャンネルがテキスト系でない: ${id}`);
      }
    } catch (err) {
      console.error(`[sendToMultipleChannels] 送信失敗: チャンネルID ${id}`, err.message);
    }
  }
};
