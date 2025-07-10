// utils/interactionHandler.js
const fs = require('fs');
const path = require('path');
const { handleButton } = require('./buttonsHandler');
const { handleModal } = require('./modalsHandler'); // 後で実装する場合
// const { handleSelectMenu } = require('./selectHandler'); ←必要になったら追加

const commands = new Map();
const commandsPath = path.join(__dirname, '../commands');

function isJSFile(fileName) {
  return fileName.endsWith('.js');
}

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

// 🔁 コマンド読み込み
loadCommandsFromDir(commandsPath);

// 🌐 インタラクション実行ハンドラー
module.exports = {
  /**
   * Discord.js の interaction イベント用メインエントリ
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) {
          return await interaction.reply({
            content: '❌ このコマンドは存在しません。',
            ephemeral: true
          });
        }

        await command.execute(interaction);
      }

      else if (interaction.isButton()) {
        await handleButton(interaction);
      }

      else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
      }

      // 追加する場合（例: RoleSelectMenu）
      // else if (interaction.isAnySelectMenu()) {
      //   await handleSelectMenu(interaction);
      // }

    } catch (err) {
      console.error('❌ インタラクション処理中にエラー:', err);

      const errorReply = {
        content: '⚠️ 処理中に予期せぬエラーが発生しました。',
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
