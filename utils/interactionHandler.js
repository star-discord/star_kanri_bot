// utils/interactionHandler.js
const path = require('path');
const fs = require('fs');

const commands = new Map();

// 📁 /commands 内の .js ファイルをすべて読み込む
const commandFiles = fs
  .readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(__dirname, '../commands', file);
  const command = require(filePath);

  if (command && command.data && command.execute) {
    commands.set(command.data.name, command);
    console.log(`✅ コマンド読み込み: ${command.data.name}`);
  } else {
    console.warn(`⚠️ 不正なコマンドファイル: ${file}`);
  }
}

module.exports = {
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({
          content: 'このコマンドは存在しません。',
          ephemeral: true,
        });
        return;
      }

      await command.execute(interaction);
    } catch (error) {
      console.error('❌ interactionCreate 全体エラー:', error);
      const replyData = {
        content: 'エラーが発生しました。もう一度お試しください。',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyData);
      } else {
        await interaction.reply(replyData);
      }
    }
  },
};


