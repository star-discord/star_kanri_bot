// utils/totusuna_setti/selects/設置チャンネル.js

const tempStore = require('../state/totsusunaTemp'); // 正しいパスで tempStore を読み込む

module.exports = async (interaction) => {
  const selected = interaction.values[0]; // 選択されたチャンネルID
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  // 既存データに追記（なければ空オブジェクト）
  const current = tempStore.get(guildId, userId) || {};
  tempStore.set(guildId, userId, {
    ...current,
    installChannelId: selected
  });

  await interaction.reply({
    content: `📌 設置チャンネルを <#${selected}> に設定しました。`,
    ephemeral: true
  });
};
