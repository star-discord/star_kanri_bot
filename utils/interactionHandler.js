const { Collection } = require('discord.js');

class InteractionHandler {
    constructor() {
        this.handlers = new Collection();
        this.cooldowns = new Collection();
        this.processingInteractions = new Set(); // 処理中インタラクション追跡
    }

    registerHandler(type, customId, handler) {
        const key = `${type}:${customId}`;
        this.handlers.set(key, handler);
        console.log(`📝 [InteractionHandler] ハンドラー登録: ${key}`);
    }

    async handleInteraction(interaction) {
        const startTime = Date.now();
        const interactionKey = `${interaction.id}_${interaction.user.id}`;
        
        // 重複処理防止
        if (this.processingInteractions.has(interactionKey)) {
            console.log(`⚠️ [InteractionHandler] 重複処理防止: ${interactionKey}`);
            return true;
        }

        this.processingInteractions.add(interactionKey);

        try {
            const type = interaction.isButton() ? 'button' : 
                         interaction.isStringSelectMenu() ? 'select' : 
                         interaction.isModalSubmit() ? 'modal' : 'unknown';
            
            if (type === 'unknown') {
                console.log(`⚠️ [InteractionHandler] 未対応インタラクション: ${interaction.type}`);
                return false;
            }

            const customId = interaction.customId;
            const handlerKey = `${type}:${customId}`;

            console.log(`🔄 [InteractionHandler] 処理開始: ${handlerKey}`, {
                user: interaction.user.tag,
                guild: interaction.guild?.name || 'DM',
                interactionId: interaction.id,
                timestamp: new Date().toISOString()
            });

            // ハンドラー検索（完全一致優先）
            let handler = this.handlers.get(handlerKey);
            let matchedKey = handlerKey;
            
            if (!handler) {
                // 部分一致でハンドラー検索（カスタムIDにパラメータが含まれる場合）
                for (const [key, h] of this.handlers) {
                    const [keyType, keyCustomId] = key.split(':');
                    if (keyType === type && customId.startsWith(keyCustomId)) {
                        handler = h;
                        matchedKey = key;
                        console.log(`🔍 [InteractionHandler] 部分一致発見: ${customId} → ${keyCustomId}`);
                        break;
                    }
                }
            }

            if (!handler) {
                console.log(`⚠️ [InteractionHandler] ハンドラー未発見: ${handlerKey}`);
                console.log(`📋 [InteractionHandler] 利用可能ハンドラー (${type}):`, 
                    Array.from(this.handlers.keys())
                        .filter(k => k.startsWith(`${type}:`))
                        .slice(0, 5)); // 最初の5個のみ表示
                
                // 未発見でも適切に応答
                if (!interaction.deferred && !interaction.replied) {
                    try {
                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply({ 
                            content: `⚠️ このボタン/メニュー (${customId}) のハンドラーが見つかりません。\n開発者に報告してください。`,
                            ephemeral: true
                        });
                    } catch (deferError) {
                        console.error('❌ [InteractionHandler] 未発見時デファー失敗:', deferError.message);
                    }
                }
                return false;
            }

            // 3秒ルール対応 - 重要な処理は予防的にデファー
            const shouldDefer = this.shouldDeferInteraction(customId);
            if (shouldDefer && !interaction.deferred && !interaction.replied) {
                try {
                    await interaction.deferReply({ ephemeral: true });
                    console.log(`✅ [InteractionHandler] 予防的デファー完了: ${customId}`);
                } catch (deferError) {
                    console.error('❌ [InteractionHandler] 予防的デファー失敗:', deferError.message);
                    // デファー失敗でも処理継続
                }
            }

            // ハンドラー実行
            await handler(interaction, { 
                handlerKey: matchedKey, 
                startTime, 
                customId: customId,
                originalCustomId: customId 
            });

            const duration = Date.now() - startTime;
            console.log(`✅ [InteractionHandler] 処理完了: ${matchedKey} (${duration}ms)`);
            return true;

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [InteractionHandler] エラー (${duration}ms):`, {
                error: error.message,
                stack: error.stack.split('\n').slice(0, 3).join('\n'), // スタック短縮
                interactionId: interaction.id,
                customId: interaction.customId || 'unknown',
                deferred: interaction.deferred,
                replied: interaction.replied,
                user: interaction.user?.tag
            });
            
            // エラー時のフォールバック応答
            try {
                const errorMessage = '⚠️ 処理中にエラーが発生しました。しばらく時間をおいて再試行してください。';
                
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMessage, ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            } catch (replyError) {
                console.error('❌ [InteractionHandler] エラーレスポンス送信失敗:', replyError.message);
            }
            
            return false;

        } finally {
            // 処理完了後にクリーンアップ
            this.processingInteractions.delete(interactionKey);
        }
    }

    // デファーが必要なインタラクションを判定
    shouldDeferInteraction(customId) {
        const deferPatterns = [
            'totusuna_',
            'kpi_',
            'star_config_',
            'install_',
            'migration_',
            'attendance_',
            'chatgpt_',
            'openai_'
        ];
        
        return deferPatterns.some(pattern => customId.includes(pattern));
    }

    // ハンドラー登録状況確認
    getHandlerStats() {
        const stats = {
            total: this.handlers.size,
            buttons: 0,
            selects: 0,
            modals: 0,
            processing: this.processingInteractions.size
        };

        for (const key of this.handlers.keys()) {
            if (key.startsWith('button:')) stats.buttons++;
            else if (key.startsWith('select:')) stats.selects++;
            else if (key.startsWith('modal:')) stats.modals++;
        }

        return stats;
    }

    // デバッグ用：登録済みハンドラー一覧
    listHandlers(type = null) {
        const handlers = Array.from(this.handlers.keys());
        if (type) {
            return handlers.filter(h => h.startsWith(`${type}:`));
        }
        return handlers;
    }
}

module.exports = new InteractionHandler();
