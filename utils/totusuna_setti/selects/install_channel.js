// utils/totusuna_setti/selects/install_channel.js

const tempStore = require('../state/totsusunaTemp'); // 一時保存用の状態ストア

module.exports = async (interaction) => {
  const selected = interaction.values[0]; // 選択されたチャンネルID
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  // 現在の一時状態を取得（なければ空）
  const current = tempStore.get(guildId, userId) || {};

  // 設置チャンネルIDを一時保存にセット
  tempStore.set(guildId, userId, {
    ...current,
    installChannelId: selected
  });

  // フィードバックを送信
  await interaction.reply({
    content: `📌 設置チャンネルを <#${selected}> に設定しました。`,
    ephemeral: true
  });
};
