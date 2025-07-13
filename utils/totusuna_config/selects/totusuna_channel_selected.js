// チャンネル選択完了ハンドラー
const { EmbedBuilder } = require('discord.js');
const fileHelper = require('../../fileHelper');

module.exports = {
    customIdStart: 'totusuna_channel_selected_',

    async handle(interaction) {
        console.log('📢 [totusuna_channel_selected] 処理開始', {
            user: interaction.user.tag,
            selectedChannels: interaction.values,
            customId: interaction.customId,
            timestamp: new Date().toISOString()
        });

        try {
            // 即座にデファー
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: true });
                console.log('✅ [totusuna_channel_selected] インタラクションデファー完了');
            }

            const instanceId = interaction.customId.split('_').slice(-1)[0];
            const channelId = interaction.values[0];
            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) {
                throw new Error('選択されたチャンネルが見つかりません');
            }

            const guildId = interaction.guild.id;
            const config = fileHelper.loadGuildConfig(guildId);

            // インスタンス更新
            const instance = config.totusuna?.instances?.find(inst => inst.id === instanceId);
            if (!instance) {
                throw new Error(`インスタンス ${instanceId} が見つかりません`);
            }

            instance.channelId = channelId;
            instance.status = 'ready';
            instance.setupCompletedAt = new Date().toISOString();

            // 設定保存
            fileHelper.saveGuildConfig(guildId, config);
            console.log('💾 [totusuna_channel_selected] インスタンス設定更新完了');

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ TOTUSUNA セットアップ完了')
                .setDescription('チャンネルが正常に設定されました！')
                .addFields(
                    { name: 'インスタンス', value: instance.name, inline: true },
                    { name: '投稿チャンネル', value: `<#${channelId}>`, inline: true },
                    { name: 'ステータス', value: '準備完了', inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();

            const response = {
                embeds: [successEmbed],
                components: [],
                ephemeral: true
            };

            if (interaction.deferred) {
                await interaction.editReply(response);
            } else {
                await interaction.reply(response);
            }

            console.log('✅ [totusuna_channel_selected] セットアップ完了通知送信完了');

        } catch (error) {
            console.error('❌ [totusuna_channel_selected] エラー:', {
                error: error.message,
                stack: error.stack,
                customId: interaction.customId,
                values: interaction.values
            });

            const errorMessage = '⚠️ チャンネル設定中にエラーが発生しました。';

            try {
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMessage, ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            } catch (replyError) {
                console.error('❌ [totusuna_channel_selected] レスポンス送信エラー:', replyError.message);
            }
        }
    }
};
