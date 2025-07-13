const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'totusuna_quick_button',

  /**
   * 凸スナクイック設置ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // 凸スナテンプレート選択メニュー
      const templates = [
        {
          label: '基本的な報告フォーム',
          value: 'basic_template',
          description: '来店・退店時間、売上などの基本項目'
        },
        {
          label: '詳細報告フォーム',
          value: 'detailed_template', 
          description: '基本項目 + お客様情報、特記事項など'
        },
        {
          label: 'シンプル報告',
          value: 'simple_template',
          description: '最小限の項目での簡単報告'
        },
        {
          label: 'カスタム設定',
          value: 'custom_template',
          description: '自由にフォーマットを設定'
        }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('totusuna_template_select')
        .setPlaceholder('使用するテンプレートを選択してください')
        .addOptions(templates);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = createAdminEmbed(
        '⚡ クイック設置',
        'テンプレートを選択して素早く凸スナを設置できます。\n\nお好みのテンプレートを選択してください。'
      ).addFields(
        {
          name: '📋 基本的な報告フォーム',
          value: '来店・退店時間、売上金額などの必要最小限の項目',
          inline: true
        },
        {
          name: '📝 詳細報告フォーム', 
          value: '基本項目に加えてお客様情報や特記事項も含む',
          inline: true
        },
        {
          name: '✏️ シンプル報告',
          value: '時間と売上のみの簡単フォーム',
          inline: true
        }
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });

    } catch (error) {
      console.error('凸スナクイック設置ボタンエラー:', error);
      await interaction.reply({
        content: '❌ クイック設置処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
};
