import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { readShopList } from '../utils/kpiFileUtil.js';

export const data = new SlashCommandBuilder()
  .setName('kpi_設置')
  .setDescription('KPI報告の案内メッセージを送信します');

export async function execute(interaction) {
  const shops = await readShopList();
  if (shops.length === 0) {
    await interaction.reply({
      content: 'まだ店舗が設定されていません。先に `/kpi_設定` で追加してください。',
      ephemeral: true,
    });
    return;
  }

  const shopOptions = shops.map(shop => ({
    label: shop,
    value: shop,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('kpi_shop_select')
    .setPlaceholder('店舗を選択してください')
    .addOptions(shopOptions);

  const row1 = new ActionRowBuilder().addComponents(selectMenu);

  const button = new ButtonBuilder()
    .setCustomId('kpi_input_button')
    .setLabel('KPIを入力する')
    .setStyle(ButtonStyle.Primary);

  const row2 = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    content: 'KPI報告を行うには店舗を選択し、入力ボタンを押してください。',
    components: [row1, row2],
  });
}
