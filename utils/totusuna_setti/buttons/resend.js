const fs = require('fs').promises;
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:resend:',

  /**
   * 蜃ｸ繧ｹ繝翫・蜀埼∽ｿ｡蜃ｦ逅・ｼ亥・險ｭ鄂ｮ・・   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '笞・・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[蜀埼∽ｿ｡] JSON 隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:', err);
      return await interaction.reply({
        content: '笶・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances ?? [];
    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '笞・・蟇ｾ雎｡縺ｮ險ｭ鄂ｮ諠・ｱ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    let channel;
    try {
      channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (!channel?.isTextBased()) {
        return await interaction.reply({
          content: '笞・・蟇ｾ雎｡繝√Ε繝ｳ繝阪Ν縺後ユ繧ｭ繧ｹ繝医メ繝｣繝ｳ繝阪Ν縺ｧ縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲・,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      console.warn(`[蜀埼∽ｿ｡] 繝√Ε繝ｳ繝阪Ν蜿門ｾ怜､ｱ謨・ ${instance.installChannelId}`, err);
      return await interaction.reply({
        content: '笞・・蟇ｾ雎｡繝√Ε繝ｳ繝阪Ν縺悟ｭ伜惠縺励↑縺・°蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('謄 蜃ｸ繧ｹ繝雁ｱ蜻雁女莉倅ｸｭ')
        .setDescription(instance.body || '(譛ｬ譁・↑縺・')
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totsusuna:report:${uuid}`) // 蜈・・蜻ｽ蜷崎ｦ丞援縺ｫ蜷医ｏ縺帙ｋ
        .setLabel('蜃ｸ繧ｹ繝雁ｱ蜻・)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sentMessage = await channel.send({ embeds: [embed], components: [row] });

      instance.messageId = sentMessage.id;

      await fs.writeFile(dataPath, JSON.stringify(json, null, 2));

      await interaction.reply({
        content: '豆 蜀埼∽ｿ｡縺励∪縺励◆・郁ｨｭ鄂ｮ繝√Ε繝ｳ繝阪Ν縺ｫ謚慕ｨｿ縺輔ｌ縺ｾ縺励◆・峨・,
        flags: MessageFlags.Ephemeral,
      });

    } catch (err) {
      console.error('[蜀埼∽ｿ｡繧ｨ繝ｩ繝ｼ]', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '笶・繝｡繝・そ繝ｼ繧ｸ縺ｮ蜀埼∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
