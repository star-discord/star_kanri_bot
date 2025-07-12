// utils/sendToMultipleChannels.js

/**
 * 褁E��のチE��ストチャンネルに同一メチE��ージを送信しまぁE * @param {Client} client - DiscordクライアンチE * @param {string[]} channelIds - チャンネルIDの配�E
 * @param {string|MessagePayload|MessageCreateOptions} message - 送信するメチE��ージ冁E��
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds)) {
    console.warn('[sendToMultipleChannels] channelIds が�E列ではありません');
    return;
  }

  for (const channelId of channelIds) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.warn(`[sendToMultipleChannels] チャンネル取得失敁E ${channelId}`);
        continue;
      }

      if (!channel.isTextBased()) {
        console.warn(`[sendToMultipleChannels] チE��ストチャンネルではありません: ${channelId}`);
        continue;
      }

      await channel.send(message);
    } catch (err) {
      console.error(`[sendToMultipleChannels] 送信失敗（チャンネルID: ${channelId}�E�`, err);
    }
  }
};
