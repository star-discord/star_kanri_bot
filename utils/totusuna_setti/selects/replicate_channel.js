// utils/totusuna_setti/selects/replicate_channel.js

const tempStore = require('../state/totsusunaTemp'); // 一時保存用の状態ストア

module.exports = async (interaction) => {
  const selected = interaction.values; // 選択された複製チャンネルのID配列
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  // 一時状態を取得（なければ空オブジェクト）
  const current = tempStore.get(guildId, userId) || {};

  // 複製チャンネルIDを一時保存にセット
  tempStore.set(guildId, userId, {
    ...current,
    replicateChannelIds: selected
  });

  // フィードバックを送信
  await interaction.reply({
    content: `🌀 複製チャンネルを ${selected.map(id => `<#${id}>`).join(', ')} に設定しました。`,
    ephemeral: true
  });
};
