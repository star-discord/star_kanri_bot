// deploy-commands.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 邂｡逅・・ち繧ｰ縺ｮ閾ｪ蜍穂ｻ伜刈蟇ｾ雎｡繧定ｨ倬鹸
const adminCommandsWithoutTag = [];

// 繧ｳ繝槭Φ繝峨・隱ｭ縺ｿ霎ｼ縺ｿ縺ｨ繧ｿ繧ｰ莉伜刈蜃ｦ逅・for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    // 邂｡逅・・さ繝槭Φ繝峨↓ "(邂｡逅・・ｰら畑)" 繧定・蜍穂ｻ伜刈
    if (command.isAdminCommand) {
      const desc = command.data.description;
      if (!desc.includes('・育ｮ｡逅・・ｰら畑・・)) {
        command.data.setDescription(desc + '・育ｮ｡逅・・ｰら畑・・);
        adminCommandsWithoutTag.push(command.data.name);
      }
    }

    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] 繧ｹ繝ｩ繝・す繝･繧ｳ繝槭Φ繝牙ｽ｢蠑丈ｸ肴ｭ｣: ${filePath}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`竢ｳ ${commands.length}蛟九・繧ｹ繝ｩ繝・す繝･繧ｳ繝槭Φ繝峨ｒ逋ｻ骭ｲ荳ｭ...`);

    // 繧ｿ繧ｰ莉伜刈縺輔ｌ縺溘さ繝槭Φ繝峨ｒ陦ｨ遉ｺ
    if (adminCommandsWithoutTag.length > 0) {
      console.log('肌 "(邂｡逅・・ｰら畑)" 繧ｿ繧ｰ繧定・蜍輔〒霑ｽ蜉縺励◆繧ｳ繝槭Φ繝・');
      adminCommandsWithoutTag.forEach(name => console.log(`- /${name}`));
    }

    // 繧ｮ繝ｫ繝峨さ繝槭Φ繝臥匳骭ｲ・亥叉譎ょ渚譏・夐幕逋ｺ逕ｨ・・    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('笨・繧ｮ繝ｫ繝峨さ繝槭Φ繝臥匳骭ｲ螳御ｺ・ｼ亥叉譎ょ渚譏・・);
    } else {
      console.log('笞・・GUILD_ID 縺梧悴險ｭ螳壹・縺溘ａ縲√ぐ繝ｫ繝臥匳骭ｲ縺ｯ繧ｹ繧ｭ繝・・縺輔ｌ縺ｾ縺励◆');
    }

    // 繧ｰ繝ｭ繝ｼ繝舌Ν繧ｳ繝槭Φ繝臥匳骭ｲ・亥渚譏縺ｫ譎る俣縺ゅｊ・壽悽逡ｪ逕ｨ・・    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('笨・繧ｰ繝ｭ繝ｼ繝舌Ν繧ｳ繝槭Φ繝臥匳骭ｲ螳御ｺ・ｼ亥渚譏縺ｾ縺ｧ譛螟ｧ1譎る俣・・);

  } catch (error) {
    console.error('笶・繧ｳ繝槭Φ繝臥匳骭ｲ螟ｱ謨・', error);
  }
})();
