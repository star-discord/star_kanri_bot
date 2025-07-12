// deploy-commands.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 管琁E��E��グの自動付加対象を記録
const adminCommandsWithoutTag = [];

// コマンド�E読み込みとタグ付加処琁Efor (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    // 管琁E��E��マンドに "(管琁E��E��用)" を�E動付加
    if (command.isAdminCommand) {
      const desc = command.data.description;
      if (!desc.includes('�E�管琁E��E��用�E�E)) {
        command.data.setDescription(desc + '�E�管琁E��E��用�E�E);
        adminCommandsWithoutTag.push(command.data.name);
      }
    }

    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] スラチE��ュコマンド形式不正: ${filePath}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`⏳ ${commands.length}個�EスラチE��ュコマンドを登録中...`);

    // タグ付加されたコマンドを表示
    if (adminCommandsWithoutTag.length > 0) {
      console.log('🔧 "(管琁E��E��用)" タグを�E動で追加したコマンチE');
      adminCommandsWithoutTag.forEach(name => console.log(`- /${name}`));
    }

    // ギルドコマンド登録�E�即時反映�E�開発用�E�E    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('✁Eギルドコマンド登録完亁E��即時反映�E�E);
    } else {
      console.log('⚠�E�EGUILD_ID が未設定�Eため、ギルド登録はスキチE�Eされました');
    }

    // グローバルコマンド登録�E�反映に時間あり�E�本番用�E�E    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✁Eグローバルコマンド登録完亁E��反映まで最大1時間�E�E);

  } catch (error) {
    console.error('❁Eコマンド登録失敁E', error);
  }
})();
