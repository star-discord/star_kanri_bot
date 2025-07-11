const { tempStore } = require('../../modals/本文入力をする');

module.exports = async (interaction) => {
  const selected = interaction.values; // 配列
  const userId = interaction.user.id;

  tempStore.set(userId, {
    ...(tempStore.get(userId) || {}),
    replicateChannelIds: selected
  });

  await interaction.reply({
    content: `🌀 複製チャンネルを ${selected.map(id => `<#${id}>`).join(', ')} に設定しました。`,
    ephemeral: true
  });
};
