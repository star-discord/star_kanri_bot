// utils/sendToMultipleChannels.js

/**
 * 複数のテキストチャンネルに同一メッセージを並列で送信するユーティリティ。
 * 成功・失敗した送信に関する詳細な結果を返します。
 * @param {import('discord.js').Client} client - Discordクライアント
 * @param {string[]} channelIds - チャンネルIDの配列
 * @param {string | import('discord.js').MessagePayload | import('discord.js').MessageCreateOptions} message - 送信メッセージ
 * @returns {Promise<{sent: import('discord.js').Message[], failed: {channelId: string, reason: string}[]}>} 送信結果
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds) || channelIds.length === 0) {
    console.warn('[sendToMultipleChannels] channelIds は配列である必要があります');
    return { sent: [], failed: [] };
  }

  if (!client?.channels?.fetch) {
    console.error('[sendToMultipleChannels] ❌ 無効な Discord クライアントが渡されました');
    // すべてのチャンネルIDを失敗として返す
    const failed = channelIds.map(id => ({ channelId: id, reason: '無効な Discord クライアント' }));
    return { sent: [], failed };
  }

  // Promise.allSettled を使用して、すべての送信処理を並列で実行します。
  // これにより、1つのチャンネルへの送信が失敗しても、他のチャンネルへの送信は続行されます。
  const promises = channelIds.map(async (channelId) => {
    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel || !channel.isTextBased?.()) {
      // エラーを投げることで、Promise.allSettled が 'rejected' として扱います。
      throw new Error(`チャンネルが見つからないか、テキストベースではありません: ${channelId}`);
    }
    return channel.send(message);
  });

  const results = await Promise.allSettled(promises);

  const sent = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent.push(result.value);
      console.log(`[sendToMultipleChannels] ✅ メッセージ送信成功（チャンネルID: ${channelIds[index]}）`);
    } else {
      failed.push({ channelId: channelIds[index], reason: result.reason.message });
      console.error(`[sendToMultipleChannels] ❌ メッセージ送信失敗（チャンネルID: ${channelIds[index]}）`, result.reason.message);
    }
  });

  return { sent, failed };
};