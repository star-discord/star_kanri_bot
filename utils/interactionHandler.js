// utils/interactionHandler.js
const fs = require('fs');
const path = require('path');

const commands = new Map();

const commandsPath = path.join(__dirname, '../commands');
const entries = fs.readdirSync(commandsPath);

for (const entry of entries) {
  const entryPath = path.join(commandsPath, entry);
  const stat = fs.statSync(entryPath);

  if (stat.isDirectory()) {
    // 📁 サブフォルダ内の .js を読み込む
    const commandFiles = fs.readdirSync(entryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(entryPath, file));
      if (command?.data && command?.execute) {
        commands.set(command.data.name, command);
        console.log(`✅ コマンド読み込み: ${command.data.name}`);
      }
    }
  } else if (entry.endsWith('.js')) {
    // 📄 単独ファイルとしての .js コマンド
    const command = require(entryPath);
    if (command?.data && command?.execute) {
      commands.set(command.data.name, command);
      console.log(`✅ コマンド読み込み: ${command.data.name}`);
    }
  }
}

module.exports = {
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;
      const command = commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({ content: 'このコマンドは存在しません。', ephemeral: true });
        return;
      }
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ interactionCreate 全体エラー:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'エラーが発生しました。', ephemeral: true });
      } else {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  }
};
