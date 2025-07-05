const { Events } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '⚠️ コマンド実行中にエラーが発生しました。', ephemeral: true });
    }
  },
};

// 👇 ここからメンション応答のイベントを追加（同ファイル内で）
module.exports.messageCreate = async function (message) {
  if (message.author.bot) return;

  // Botへのメンションをチェック
  if (message.mentions.has(message.client.user)) {
    const prompt = message.content.replace(/<@!?\d+>/, '').trim();
    if (!prompt) return;

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      const reply = response.data.choices[0].message.content;
      await message.reply(reply);
    } catch (error) {
      console.error('OpenAI API 応答エラー:', error);
      await message.reply('⚠️ ChatGPT 応答に失敗しました。');
    }
  }
};
