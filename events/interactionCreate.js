// events/interactionCreate.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { sendToMultipleChannels } = require('../utils/sendToMultipleChannels');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // 1. スラッシュコマンド処理
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction, client);
        } catch (error) {
          console.error(`コマンド実行エラー: ${interaction.commandName}`, error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: '❌ コマンド実行中にエラーが発生しました。',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: '❌ コマンド実行中にエラーが発生しました。',
              ephemeral: true,
            });
          }
        }
        return;
      }

      // 2. ボタン押下処理
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'tousuna_report_button': {
            // 凸スナ報告モーダル表示
            const modal = new ModalBuilder()
              .setCustomId('tousuna_modal')
              .setTitle('凸スナ報告');

            const groupInput = new TextInputBuilder()
              .setCustomId('group')
              .setLabel('組（例: 3）')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const nameInput = new TextInputBuilder()
              .setCustomId('name')
              .setLabel('名（例: 15）')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const detailInput = new TextInputBuilder()
              .setCustomId('detail')
              .setLabel('詳細（任意）')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false);

            modal.addComponents(
              new ActionRowBuilder().addComponents(groupInput),
              new ActionRowBuilder().addComponents(nameInput),
              new ActionRowBuilder().addComponents(detailInput),
            );

            await interaction.showModal(modal);
            break;
          }
          case 'chat_gpt_today_button': {
            // ChatGPT 今日の情報ボタン処理
            try {
              // 実際はここで外部APIやChatGPT連携などの非同期処理を実装
              await interaction.reply({
                content: '✨ 今日の情報：晴れ☀、ニュースは○○、豆知識は××です！',
                ephemeral: true,
              });
            } catch (error) {
              console.error('chat_gpt_today_button 処理エラー:', error);
              if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
              }
            }
            break;
          }
          // 他のボタンIDがあればここに追加
          default:
            // 未知のボタンIDは無視かログ出力
            console.warn(`未知のボタン押下: ${interaction.customId}`);
            break;
        }
        return;
      }

      // 3. モーダル送信処理
      if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
          case 'tousuna_modal': {
            // 凸スナ報告モーダル送信後の処理
            const group = interaction.fields.getTextInputValue('group');
            const name = interaction.fields.getTextInputValue('name');
            const detail = interaction.fields.getTextInputValue('detail') || '(なし)';

            const groupCount = parseInt(group, 10);
            if (isNaN(groupCount) || groupCount <= 0) {
              await interaction.reply({ content: '組は正の数字で入力してください。', ephemeral: true });
              return;
            }

            const tableText = Array.from({ length: groupCount }, (_, i) => `- ${i + 1}組目卓：`).join('\n');

            const report = `📝 **凸スナ報告**\n` +
              `組: ${group}組\n名: ${name}名\n詳細: ${detail}\n卓:\n${tableText}`;

            await sendToMultipleChannels(client, config.tousunaReportChannels, report);

            await interaction.reply({ content: '✅ 報告を送信しました！', ephemeral: true });
            break;
          }
          // 他のモーダルIDがあればここに追加
          default:
            console.warn(`未知のモーダル送信: ${interaction.customId}`);
            break;
        }
        return;
      }
    } catch (generalError) {
      console.error('interactionCreate 全体エラー:', generalError);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '予期せぬエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
