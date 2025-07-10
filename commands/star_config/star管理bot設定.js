// 1. commands/star_config/star管理bot設定.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者ロールの設定を行います'),

  async execute(interaction) {
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('set_admin_roles')
      .setPlaceholder('管理者ロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '管理者として許可するロールを選択してください：',
      components: [row],
      ephemeral: true
    });
  }
};

// 2. utils/star_config/buttons.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    if (customId === 'set_admin_roles') {
      const guildId = interaction.guild.id;
      const selectedRoles = interaction.values; // ロールID配列

      const dir = path.join(__dirname, '../../../data', guildId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filePath = path.join(dir, 'admin_roles.json');
      fs.writeFileSync(filePath, JSON.stringify(selectedRoles, null, 2), 'utf8');

      await interaction.reply({
        content: '✅ 管理者ロールを保存しました。',
        ephemeral: true
      });
    }
  }
};

// 3. utils/buttonsHandler.js
const path = require('path');

async function handleButton(interaction) {
  const customId = interaction.customId;
  const [commandName] = customId.split(':');

  try {
    const handlerPath = path.resolve(__dirname, `./${commandName}/buttons.js`);
    const handlers = require(handlerPath);

    if (typeof handlers.handle === 'function') {
      return await handlers.handle(interaction);
    } else {
      console.warn(`❓ 不明なボタンハンドラ: ${customId}`);
    }
  } catch (err) {
    console.error(`❌ ボタンハンドラー読み込みエラー: ${customId}`, err);
  }
}

module.exports = { handleButton };

// 4. utils/star_config/admin.js
const fs = require('fs');
const path = require('path');

function isAdmin(member) {
  const guildId = member.guild.id;
  const filePath = path.join(__dirname, '../../../data', guildId, 'admin_roles.json');

  if (!fs.existsSync(filePath)) return false;

  const allowedRoles = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

module.exports = { isAdmin };

// 5. interactionHandler.js 内に追加（抜粋）
if (interaction.isRoleSelectMenu()) {
  const customId = interaction.customId;

  if (customId === 'set_admin_roles') {
    const handler = require('./star_config/buttons.js');
    return await handler.handle(interaction);
  }
}
