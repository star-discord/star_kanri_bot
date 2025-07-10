// utils/interactionHandler.js
const fs = require('fs');
const path = require('path');

const commands = new Map();
const commandsPath = path.join(__dirname, '../commands');

/**
 * .js ファイルだけに限定するフィルタ関数
 */
function isJSFile(fileName) {
  return fileName.endsWith('.js');
}

/**
 * 指定パスからコマンドを読み込む
 */
function loadCommand(filePath, logPrefix = '') {
  try {
    const command = require(filePath);
    if (command?.data?.name && typeof command.execute === 'function') {
      commands.set(command.data.name, command);
      console.log(`✅ ${logPrefix}コマンド読み込み: ${command.data.name}`);
    } else {
      console.warn(`⚠️ ${logPrefix}無効なコマンド形式: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ ${logPrefix}読み込み失敗: ${filePath}`, err);
  }
}

/**
 * コマンドディレクトリを再帰的に読み込む
 */
function loadCommandsFromDir(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommandsFromDir(entryPath, `${prefix}${entry.name}/`);
    } else if (isJSFile(entry.name)) {
      loadCommand(entryPath, prefix);
    }
  }
}

// 🔁 すべてのコマンドを読み込む
loadCommandsFromDir(commandsPath);

// 🌐 インタラクション実行ハンドラ
module.exports = {
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      return await interaction.reply({
        content: '❌ このコマンドは存在しません。',
        ephemeral: true
      });
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`❌ コマンド実行エラー (${interaction.commandName}):`, err);

      const errorReply = {
        content: '⚠️ コマンド実行中にエラーが発生しました。',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  }
};

