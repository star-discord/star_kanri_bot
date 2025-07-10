// utils/interactionHandler.js
const path = require('path');
const fs = require('fs');

const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));

const commands = new Map();

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands', folder)).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(__dirname, '../commands', folder, file);
    const command = require(filePath);
    if (command && command.data && command.execute) {
      commands.set(command.data.name, command);
    }
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
          ephemeral: true
        });
        return;
      }

      await command.execute(interaction);
    } catch (error) {
      console.error('❌ interactionCreate 全体エラー:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      }
    }
  }
};

