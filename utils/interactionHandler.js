// utils/interactionHandler.js

const { Collection, MessageFlagsBitField } = require('discord.js');

/**
 * 統合インタラクションハンドラー
 */
class InteractionHandler {
  constructor() {
    /** @type {Collection<string, Function>} */
    this.handlers = new Collection();

    /** @type {Set<string>} 処理中インタラクション追跡用 */
    this.processingInteractions = new Set();
  }

  /**
   * ハンドラー登録
   * @param {'button'|'select'|'modal'} type 
   * @param {string} customId 
   * @param {function} handler 
   */
  registerHandler(type, customId, handler) {
    const key = `${type}:${customId}`;
    this.handlers.set(key, handler);
    console.log(`📝 [InteractionHandler] ハンドラー登録: ${key}`);
  }

  /**
   * インタラクションを処理
   * @param {import('discord.js').Interaction} interaction 
   * @returns {Promise<boolean>} 成功/失敗フラグ
   */
  async handleInteraction(interaction) {
    const startTime = Date.now();
    const interactionKey = `${interaction.id}_${interaction.user.id}`;

    // 重複処理防止
    if (this.processingInteractions.has(interactionKey)) {
      console.warn(`⚠️ [InteractionHandler] 重複処理防止: ${interactionKey}`);
      return false;
    }

    this.processingInteractions.add(interactionKey);

    try {
      /** @type {'button'|'select'|'modal'|'unknown'} */
      let type = 'unknown';
      if (interaction.isButton()) type = 'button';
      else if (interaction.isStringSelectMenu()) type = 'select';
      else if (interaction.isModalSubmit()) type = 'modal';

      if (type === 'unknown') {
        console.warn(`[${new Date().toISOString()}] ⚠️ [InteractionHandler] 未対応インタラクションタイプ: ${interaction.type}`);
        return false;
      }

      const customId = interaction.customId;
      let handlerKey = `${type}:${customId}`;
      let handler = this.handlers.get(handlerKey);

      // 部分一致ハンドラーを探す（カスタムIDパラメータ付与時の対応）
      if (!handler) {
        for (const [key, h] of this.handlers.entries()) {
          const [keyType, keyCustomId] = key.split(':');
          if (keyType === type && customId.startsWith(keyCustomId)) {
            handler = h;
            handlerKey = key;
            console.log(`[${new Date().toISOString()}] 🔍 [InteractionHandler] 部分一致ハンドラー発見: ${customId} → ${keyCustomId}`);
            break;
          }
        }
      }

      if (!handler) {
        console.warn(`[${new Date().toISOString()}] ⚠️ [InteractionHandler] ハンドラー未発見: ${handlerKey}`);
        console.log(`[InteractionHandler] 利用可能なハンドラー (${type}):`, 
          Array.from(this.handlers.keys())
            .filter(k => k.startsWith(`${type}:`))
            .slice(0, 5));

        if (!interaction.deferred && !interaction.replied) {
          try {
            await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
            await interaction.editReply({
              content: `⚠️ この操作 (${customId}) に対応する処理がありません。開発者にお問い合わせください。`,
              flags: MessageFlagsBitField.Flags.Ephemeral,
            });
          } catch (deferError) {
            console.error(`[InteractionHandler] 未発見時デファー失敗: ${deferError.message}`);
          }
        }
        return false;
      }

      // 予防的デファー判定
      if (this.shouldDeferInteraction(customId) && !interaction.deferred && !interaction.replied) {
        try {
          await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
          console.log(`[${new Date().toISOString()}] ✅ [InteractionHandler] 予防的デファー完了: ${customId}`);
        } catch (deferError) {
          console.error(`[InteractionHandler] 予防的デファー失敗: ${deferError.message}`);
        }
      }

      // ハンドラー実行をtry-catchで確実に捕捉
      try {
        await handler(interaction, {
          handlerKey,
          startTime,
          customId,
          originalCustomId: customId
        });
      } catch (handlerError) {
        console.error(`[InteractionHandler] ハンドラー実行中エラー: ${handlerError.stack || handlerError.message}`);
        throw handlerError;  // 上位catchに投げる
      }

      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ✅ [InteractionHandler] 処理完了: ${handlerKey} (${duration}ms)`);
      return true;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${new Date().toISOString()}] ❌ [InteractionHandler] エラー (${duration}ms):`, {
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
        interactionId: interaction.id,
        customId: interaction.customId || 'unknown',
        deferred: interaction.deferred,
        replied: interaction.replied,
        user: interaction.user?.tag
      });

      // エラー時の応答フォールバック
      try {
        const errorMessage = '⚠️ 処理中にエラーが発生しました。しばらく時間をおいて再試行してください。';
        if (interaction.deferred) {
          await interaction.editReply({ content: errorMessage, flags: MessageFlagsBitField.Flags.Ephemeral });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, flags: MessageFlagsBitField.Flags.Ephemeral });
        }
      } catch (replyError) {
        console.error(`[InteractionHandler] エラーレスポンス送信失敗: ${replyError.message}`);
      }

      return false;

    } finally {
      this.processingInteractions.delete(interactionKey);
    }
  }

  /**
   * 予防的デファーが必要なカスタムIDか判定
   * @param {string} customId 
   * @returns {boolean}
   */
  shouldDeferInteraction(customId) {
    const deferPrefixes = [
      'totusuna_',
      'kpi_',
      'star_config_',
      'install_',
      'migration_',
      'attendance_',
      'chatgpt_',
      'openai_'
    ];
    return deferPrefixes.some(prefix => customId.startsWith(prefix));
  }

  /**
   * ハンドラー登録状況を取得
   * @returns {{total:number, buttons:number, selects:number, modals:number, processing:number}}
   */
  getHandlerStats() {
    const stats = {
      total: this.handlers.size,
      buttons: 0,
      selects: 0,
      modals: 0,
      processing: this.processingInteractions.size,
    };
    for (const key of this.handlers.keys()) {
      if (key.startsWith('button:')) stats.buttons++;
      else if (key.startsWith('select:')) stats.selects++;
      else if (key.startsWith('modal:')) stats.modals++;
    }
    return stats;
  }

  /**
   * 登録済みハンドラー一覧取得
   * @param {'button'|'select'|'modal'?} [type]
   * @returns {string[]}
   */
  listHandlers(type) {
    const handlers = Array.from(this.handlers.keys());
    if (type) {
      return handlers.filter(h => h.startsWith(`${type}:`));
    }
    return handlers;
  }
}

module.exports = new InteractionHandler();
