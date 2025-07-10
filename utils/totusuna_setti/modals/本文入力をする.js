// utils/totusuna_setti/modals/本文入力をする.js
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handleContentModal(interaction) {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const content = interaction.fields.getTextInputValue('content');

  const dataPath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);
  if (!fs.existsSync(dataPath)) {
    return await interaction.reply({ content: '❌ 保存先が存在しません。先に /凸スナ設置 をしてください。', ephemeral: true });
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const userInstance = data?.tousuna?.instances?.find(i => i.userId === userId && !i.id);
  const targetInstance = userInstance || data?.tousuna?.instances?.find(i => i.userId === userId);

  if (!targetInstance) {
    return await interaction.reply({ content: '❌ あなたの設置情報が見つかりません。', ephemeral: true });
  }

  // UUIDを生成しインスタンスに割り当て
  const instanceId = targetInstance.id || uuidv4();
  targetInstance.id = instanceId;
  targetInstance.content = content;

  // 保存
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

  await interaction.reply({ content: '✅ 本文を保存しました。', ephemeral: true });
};
