// utils/interactionHandler.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { sendToMultipleChannels } = require('./sendToMultipleChannels');
const handleButton = require('./buttonsHandler');
const { writeTotusunaReport } = require('./totusuna_setti/spreadSheet');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');

const userTotusunaSetupMap = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // 1. スラッシュコマンド処理
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
          await command.execute(interaction, client, userTotusunaSetupMap);
        } catch (error) {
          console.error(`コマンド実行エラー: ${interaction.commandName}`, error);
          const msg = { content: '❌ コマンド実行中にエラーが発生しました。', ephemeral: true };
          interaction.replied || interaction.deferred ? await interaction.followUp(msg) : await interaction.reply(msg);
        }
        return;
      }

      // 2. ボタン処理（共通ハンドラ）
      if (interaction.isButton()) {
        return handleButton(interaction);
      }

      // 3. セレクトメニュー処理（チャンネル選択）
      if (interaction.isChannelSelectMenu()) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const customId = interaction.customId;

        if (!userTotusunaSetupMap.has(userId)) userTotusunaSetupMap.set(userId, {});
        const current = userTotusunaSetupMap.get(userId);

        if (customId === 'totusuna_setti:select_main_channel') {
          current.mainChannelId = interaction.values[0];
          await interaction.reply({ content: '✅ ボタン設置チャンネルを記録しました。', ephemeral: true });
        } else if (customId === 'totusuna_setti:select_clone_channels') {
          current.cloneChannelIds = interaction.values;
          await interaction.reply({ content: '✅ 複製送信チャンネルを記録しました。', ephemeral: true });
        }
        return;
      }

      // 4. モーダル送信処理
      if (interaction.isModalSubmit()) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        switch (interaction.customId) {
          case 'totusuna_content_modal': {
            const body = interaction.fields.getTextInputValue('main_body');
            const setup = userTotusunaSetupMap.get(userId);
            if (!setup || !setup.mainChannelId) {
              await interaction.reply({ content: '⚠️ チャンネル情報が見つかりません。', ephemeral: true });
              return;
            }

            const mainChannel = await client.channels.fetch(setup.mainChannelId);
            const embed = new EmbedBuilder().setTitle('📢 凸スナ報告はこちら').setDescription(body).setColor(0x0099ff);
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('tousuna_report_button').setLabel('凸スナ報告').setStyle(ButtonStyle.Primary)
            );

            const sent = await mainChannel.send({ embeds: [embed], components: [row] });

            // 保存
            const saveDir = path.join(__dirname, `../data/${guildId}`);
            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
            fs.writeFileSync(path.join(saveDir, `${guildId}.json`), JSON.stringify({
              buttonChannelId: setup.mainChannelId,
              cloneChannelIds: setup.cloneChannelIds || [],
              lastMessageId: sent.id
            }, null, 2));

            await interaction.reply({ content: '✅ 本文メッセージを投稿しました！', ephemeral: true });
            userTotusunaSetupMap.delete(userId);
            break;
          }

          case 'tousuna_modal': {
            const group = interaction.fields.getTextInputValue('group');
            const name = interaction.fields.getTextInputValue('name');
            const detail = interaction.fields.getTextInputValue('detail') || '(なし)';
            const tableInputs = ['table1', 'table2', 'table3', 'table4'].map(id =>
              interaction.fields.getTextInputValue(id) || ''
            );

            const report = `📝 **凸スナ報告**\n組: ${group}組\n名: ${name}名\n卓:\n${tableInputs.map((t, i) => `- 卓${i + 1}: ${t || '未記入'}`).join('\n')}\n詳細: ${detail}`;

            await sendToMultipleChannels(client, config.tousunaReportChannels, report);
            await writeTotusunaReport(guildId, {
              group,
              name,
              detail,
              tables: tableInputs,
              username: interaction.user.username
            });

            await interaction.reply({ content: '✅ 報告を送信しました！', ephemeral: true });
            break;
          }

          default:
            console.warn(`未知のモーダル送信: ${interaction.customId}`);
        }
      }

    } catch (err) {
      console.error('interactionCreate 全体エラー:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 予期せぬエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
