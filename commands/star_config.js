const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者ロールの設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const dir = path.join(__dirname, `../data/${guildId}`);
    const jsonPath = path.join(dir, `${guildId}.json`);

    // フォルダがなければ作成
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // JSONファイルがなければ作成
    if (!fs.existsSync(jsonPath)) {
      const initialData = {
        adminRoleIds: [], // 管理者ロールID格納用
        tousuna: {}       // 凸スナ関連の設定もここに入れていく
      };
      fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2), 'utf-8');
    }

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('set_admin_roles')
      .setPlaceholder('管理者ロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '✅ 管理者として許可するロールを選択してください：',
      components: [row],
      ephemeral: true
    });
  }
};

