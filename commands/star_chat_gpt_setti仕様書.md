# star_chat_gpt_setti.js コマンド仕様書

## 概要
指定チャンネルにChatGPT案内メッセージとボタンを設置するコマンドです。ユーザーがChatGPT機能にアクセスできるUIを提供します。

## コマンド情報
- **コマンド名**: `/star_chat_gpt_setti`
- **説明**: 指定チャンネルにChatGPT案内メッセージとボタンを設置します
- **権限**: 管理者専用（requireAdmin適用）
- **応答形式**: 公開メッセージ（ephemeral: false）

## 機能詳細

### 主な機能
1. ChatGPT案内メッセージの送信
2. 情報取得ボタンの提供
3. 設定ボタンの提供

### メッセージ内容
```javascript
const content = `🤖 **ChatGPT案内**\n以下のボタンを押すと、「天気」「ニュース」「豆知識」などの情報が届きます。`;
```

### ボタン構成
```javascript
const infoButton = new ButtonBuilder()
  .setCustomId('star_chat_gpt_setti_button')
  .setLabel('🤖 今日のChatGPT')
  .setStyle(ButtonStyle.Primary);

const configButton = new ButtonBuilder()
  .setCustomId('chatgpt_config_button')
  .setLabel('⚙️ 設定')
  .setStyle(ButtonStyle.Secondary);
```

## 依存関係
- `discord.js`: SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags
- `../utils/permissions/requireAdmin`: 管理者権限チェック

## 実行フロー
1. 管理者権限チェック
2. ボタンUI作成
3. 案内メッセージ作成
4. 公開メッセージとして送信

## 連携するハンドラ
- `utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js`: ChatGPT情報表示
- `utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js`: 設定画面表示

## 提供される機能（ボタン経由）
| ボタン | 機能 | 説明 |
|--------|------|------|
| 🤖 今日のChatGPT | 情報表示 | 天気・ニュース・豆知識を表示 |
| ⚙️ 設定 | 設定画面 | ChatGPT設定の変更 |

## エラーハンドリング
```javascript
catch (error) {
  console.error('star_chat_gpt_setti コマンド実行エラー:', error);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({ 
      content: 'エラーが発生しました。', 
      flags: MessageFlags.Ephemeral 
    });
  }
}
```

## 文字化け修正履歴
このファイルでは以下の文字化けが修正されました：
- **1行目**: ファイルパスコメントの文字化け
- **26行目**: 絵文字の文字化け（🤖）

## 使用例
```
/star_chat_gpt_setti
→ チャンネルにChatGPT案内とボタンを設置
→ ユーザーが「🤖 今日のChatGPT」ボタンをクリック
→ 天気・ニュース・豆知識を表示
```

## 想定される利用シーン
1. **情報チャンネル**: 日次情報の提供
2. **雑談チャンネル**: ユーザーの情報取得支援
3. **管理チャンネル**: 管理者向け設定アクセス

## 注意事項
- 公開メッセージなので全ユーザーがボタンを操作可能
- ChatGPT API連携の実装状況により機能が制限される可能性
- ボタンの応答処理は各ハンドラファイルに依存
