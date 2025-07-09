// utils/sendToMultipleChannels.js
module.exports.sendToMultipleChannels = async (client, channelIds, message) => {
  for (const id of channelIds) {
    const channel = await client.channels.fetch(id).catch(() => null);
    if (channel?.isTextBased()) {
      await channel.send(message);
    }
  }
};
