// utils/sendToMultipleChannels.js

/**
 * 隍・焚縺ｮ繝・く繧ｹ繝医メ繝｣繝ｳ繝阪Ν縺ｫ蜷御ｸ繝｡繝・そ繝ｼ繧ｸ繧帝∽ｿ｡縺励∪縺・ * @param {Client} client - Discord繧ｯ繝ｩ繧､繧｢繝ｳ繝・ * @param {string[]} channelIds - 繝√Ε繝ｳ繝阪ΝID縺ｮ驟榊・
 * @param {string|MessagePayload|MessageCreateOptions} message - 騾∽ｿ｡縺吶ｋ繝｡繝・そ繝ｼ繧ｸ蜀・ｮｹ
 */
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  if (!Array.isArray(channelIds)) {
    console.warn('[sendToMultipleChannels] channelIds 縺碁・蛻励〒縺ｯ縺ゅｊ縺ｾ縺帙ｓ');
    return;
  }

  for (const channelId of channelIds) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.warn(`[sendToMultipleChannels] 繝√Ε繝ｳ繝阪Ν蜿門ｾ怜､ｱ謨・ ${channelId}`);
        continue;
      }

      if (!channel.isTextBased()) {
        console.warn(`[sendToMultipleChannels] 繝・く繧ｹ繝医メ繝｣繝ｳ繝阪Ν縺ｧ縺ｯ縺ゅｊ縺ｾ縺帙ｓ: ${channelId}`);
        continue;
      }

      await channel.send(message);
    } catch (err) {
      console.error(`[sendToMultipleChannels] 騾∽ｿ｡螟ｱ謨暦ｼ医メ繝｣繝ｳ繝阪ΝID: ${channelId}・荏, err);
    }
  }
};
