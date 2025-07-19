const { MessageFlagsBitField } = require('discord.js');
const { loadHandlers } = require('./handlerLoader');
const path = require('path');
const { logAndReplyError } = require('./errorHelper');

/**
 * 統合インタラクションハンドラー
 * ボタン、モーダル、セレクトメニューを一元管理
 */
class UnifiedInteractionHandler {
  constructor() {
    this.handlerCategories = {};
    this.isReady = false;

    this.prefixMapping = {
      // Button/Select prefixes
      'star_config:': 'star_config',
      'star_chat_gpt_setti:': 'star_chat_gpt_setti',
      'star_chat_gpt_config:': 'star_chat_gpt_config',
      'totusuna_setti:': 'totusuna_setti',
      'totusuna_config:': 'totusuna_config',
      'totusuna:report:': 'totusuna_report',
      'kpi_': 'kpi_setti',
      // Modal prefixes
      'star_config_modal_': 'star_config',
      'star_chat_gpt_config_modal': 'star_chat_gpt_config', // Handles with and without action
      'totusuna_modal_': 'totusuna_setti',
      'totusuna_config_edit_modal_': 'totusuna_config',
      'totusuna_report_modal:': 'totusuna_report',
      'kpi_modal_': 'kpi_setti',
    };
  }

  /**
   * ハンドラを非同期で読み込み、初期化する
   */
  async initialize() {
    console.log('🔄 [UnifiedHandler] ハンドラの初期化を開始...');

    const interactionTypes = ['buttons', 'modals', 'selects'];
    // prefixMappingからカテゴリ名を動的に取得
    const categories = [...new Set(Object.values(this.prefixMapping))];

    const allLoadPromises = [];

    // 各インタラクションタイプとカテゴリの組み合わせでハンドラを動的に読み込む
    for (const type of interactionTypes) {
      this.handlerCategories[type] = {};
      for (const category of categories) {
        const handlerPath = path.join(__dirname, category, type);
        const promise = loadHandlers(handlerPath).then(findFunc => {
          this.handlerCategories[type][category] = findFunc;
        });
        allLoadPromises.push(promise);
      }
    }

    // すべてのハンドラの読み込みを並列で実行
    await Promise.all(allLoadPromises);

    this.isReady = true;
    console.log('✅ [UnifiedHandler] ハンドラの初期化が完了しました。');
  }

  getCategoryFromCustomId(customId) {
    for (const [prefix, category] of Object.entries(this.prefixMapping)) {
      if (customId.startsWith(prefix)) return category;
    }
    return null;
  }

  resolveHandler(interactionType, customId) {
    const category = this.getCategoryFromCustomId(customId);
    if (!category) return null;

    const find = this.handlerCategories[interactionType]?.[category];
    return typeof find === 'function' ? find(customId) : null;
  }

  /**
   * 内部ヘルパー：特定のインタラクションタイプのハンドラを解決して実行する
   * @param {import('discord.js').Interaction} interaction
   * @param {'buttons' | 'modals' | 'selects'} interactionType
   * @private
   */
  async _executeHandler(interaction, interactionType) {
    const { customId } = interaction;
    const handler = this.resolveHandler(interactionType, customId);

    if (!handler) {
      const typeName = { buttons: 'ボタン', modals: 'モーダル', selects: 'セレクトメニュー' }[interactionType];
      console.warn(`[UnifiedHandler] ${typeName}ハンドラが見つかりません: ${customId}`);
      await logAndReplyError(interaction, `未対応の${typeName}: ${customId}`, `⚠️ この${typeName}は現在利用できません。`);
      return;
    }

    await handler.handle(interaction);
  }

  async handleInteraction(interaction) {
    if (!this.isReady) {
      console.warn('⚠️ [UnifiedHandler] ハンドラが未準備のため、インタラクションを拒否しました。');
      return await logAndReplyError(interaction, 'ハンドラ未準備', 'ボットがまだ準備中です。少し待ってからもう一度お試しください。');
    }

    try {
      if (interaction.isButton()) {
        await this._executeHandler(interaction, 'buttons');
      } else if (interaction.isModalSubmit()) {
        await this._executeHandler(interaction, 'modals');
      } else if (interaction.isAnySelectMenu()) {
        await this._executeHandler(interaction, 'selects');
      } else {
        // サポート外のインタラクションタイプは無視する
        console.warn(`[UnifiedHandler] 未対応のinteractionタイプ: ${interaction.type}`);
      }
    } catch (err) {
      // 各ハンドラ内で発生したエラーはここで一括キャッチし、ユーザーに応答する
      const customId = interaction.customId || 'unknown';
      console.error(`[UnifiedHandler] Interaction処理中にエラーが発生 (ID: ${customId}):`, err);
      await logAndReplyError(interaction, err, `❌ 処理中にエラーが発生しました (ID: ${customId})`);
    }
  }
}

const unifiedHandler = new UnifiedInteractionHandler();

module.exports = {
  UnifiedInteractionHandler,
  unifiedHandler,
};
