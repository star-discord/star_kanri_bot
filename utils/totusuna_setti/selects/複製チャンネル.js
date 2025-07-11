// utils/totusuna_setti/selects/複製チャンネル.js

const tempStore = require('../state/totsusunaTemp'); // 正しい一時ストアのパスを参照

module.exports = async (interaction) => {
  const selected = interaction.values; // 複製チャンネルのID配列
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  // 既存データに追記（なければ空オブジェクトから）
  const current = tempStore.get(guildId, userId) || {};
  tempStore.set(guildId, userId, {
    ...current,
    replicateChannelIds: selected
  });

  await interaction.reply({
    content: `🌀 複製チャンネルを ${selected.map(id => `<#${id}>`).join(', ')} に設定しました。`,
    ephemeral: true
  });
};
