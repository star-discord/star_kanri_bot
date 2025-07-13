# star_chat_gpt_config.js コマンド仕様書

## 概要
ChatGPTの各種設定を表示・変更するための管理コマンドです。API設定や動作パラメータの管理を行います。

## コマンド情報
- **コマンド名**: `/star_chat_gpt_config`
- **説明**: STAR ChatGPT の設定を表示または変更します
- **権限**: 管理者専用（requireAdmin適用）
- **応答形式**: Ephemeral（プライベートメッセージ）

## 機能詳細

### 主な機能
1. ChatGPT設定状況の表示
2. 設定変更ボタンの提供
3. 現在の設定値確認

### 表示内容
```javascript
embed.addFields(
  {
    name: '🔧 設定項目',
    value: '• APIキー\n• 最大トークン数\n• 温度設定\n• プロンプト設定',
    inline: false
  },
  {
    name: '📋 現在の状態',
    value: 'APIキー: 未設定\n最大トークン: 150\n温度: 0.7',
    inline: false
  }
);
```

### ボタン構成
```javascript
const configButton = new ButtonBuilder()
  .setCustomId('chatgpt_config_button')
  .setLabel('⚙️ 設定変更')
  .setStyle(ButtonStyle.Primary);
```

## 依存関係
- `discord.js`: SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
- `../utils/permissions/requireAdmin`: 管理者権限チェック
- `../utils/embedHelper`: createAdminEmbed

## 実行フロー
1. 管理者権限チェック
2. 設定状況の取得（現在は固定値）
3. Embed作成
4. 設定変更ボタン付きで返信

## 連携するハンドラ
- `utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js`: 設定変更モーダル表示
- `utils/star_chat_gpt_setti/modals/chatgpt_config_modal.js`: 設定保存処理

## 設定項目
| 項目 | 説明 | 形式 | デフォルト値 |
|------|------|------|-------------|
| APIキー | OpenAI APIキー | 文字列 | 未設定 |
| 最大トークン数 | レスポンス最大長 | 数値 | 150 |
| 温度設定 | 創造性パラメータ | 0.0-2.0 | 0.7 |
| プロンプト設定 | システムプロンプト | 文字列 | 未実装 |

## エラーハンドリング
```javascript
catch (error) {
  console.error('ChatGPT設定コマンドエラー:', error);
  await interaction.reply({
    content: '❌ 設定コマンドの実行中にエラーが発生しました。',
    ephemeral: true
  });
}
```

## 使用例
```
/star_chat_gpt_config
→ ChatGPT設定画面表示
→ 「⚙️ 設定変更」ボタンクリック
→ 設定モーダル表示
```

## 今後の実装予定
- 実際の設定値取得・表示機能
- 設定値の永続化
- プロンプト設定機能
- 設定履歴管理

## 注意事項
- 現在は表示のみで実際の設定値取得は未実装
- APIキーの安全な保存方法の検討が必要
- 設定値のバリデーション実装が必要
