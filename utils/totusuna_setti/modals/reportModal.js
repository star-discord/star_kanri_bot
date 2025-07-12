const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');
const { MessageFlags } = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_modal:',

  /**
   * 凸スナ報告モーダル送信後�E琁E   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const username = interaction.user.username;
    const now = dayjs();
    const timestamp = now.format('YYYY-MM-DD HH:mm:ss');
    const ym = now.format('YYYY-MM');

    // UUIDを抽出
    const uuid = interaction.customId.replace(this.customIdStart, '');

    // 入力値取征E    const group = interaction.fields.getTextInputValue('group');
    const name = interaction.fields.getTextInputValue('name');
    const table1 = interaction.fields.getTextInputValue('table1') || '';
    const table2 = interaction.fields.getTextInputValue('table2') || '';
    const table3 = interaction.fields.getTextInputValue('table3') || '';
    const table4 = interaction.fields.getTextInputValue('table4') || '';
    const detail = interaction.fields.getTextInputValue('detail') || '';

    const tableText = [table1, table2, table3, table4]
      .filter(t => t)
      .map((t, i) => `十E{i + 1}: ${t}`)
      .join('\n');

    const report = `📝 **凸スナ報呁E*\n絁E ${group}組\n吁E ${name}名\n${tableText ? `${tableText}\n` : ''}詳細: ${detail || 'なぁE}`;

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = (json.totusuna?.instances || []).find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 対応する�Eスナ設置惁E��が見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const targetChannel = await interaction.client.channels.fetch(instance.installChannelId);
      if (targetChannel?.isTextBased()) {
        await targetChannel.send({ content: report });
      } else {
        console.warn(`[reportModal] チE��ストチャンネルでなぁE ${instance.installChannelId}`);
      }
    } catch (err) {
      console.error(`[reportModal] チャンネル送信失敁E`, err);
    }

    const csvPath = path.join(__dirname, '../../../data', guildId, `${guildId}-${ym}-凸スナ報呁Ecsv`);
    await writeCsvRow(csvPath, [
      timestamp,
      group,
      name,
      table1,
      table2,
      table3,
      table4,
      detail,
      username,
    ]);

    await interaction.reply({
      content: '✁E報告を送信し、記録しました、E,
      flags: MessageFlags.Ephemeral,
    });
  },
};
