const { tempStore } = require('../../modals/本文入力をする');

module.exports = async (interaction) => {
  const selected = interaction.values[0]; // チャンネルID
  const userId = interaction.user.id;

  tempStore.set(userId, {
    ...(tempStore.get(userId) || {}),
    installChannelId: selected
  });

  await interaction.reply({
    content: `📌 設置チャンネルを <#${selected}> に設定しました。`,
    ephemeral: true
  });
};
