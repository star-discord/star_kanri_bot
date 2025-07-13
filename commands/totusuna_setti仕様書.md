# totusuna_setti.js コマンド仕様書

## 概要
指定チャンネルに凸スナ案内メッセージとボタンを設置するメインコマンドです。凸スナシステムの設置・管理の中核機能を提供します。

## コマンド情報
- **コマンド名**: `/凸スナ設置`
- **説明**: 指定チャンネルに凸スナ案内メッセージとボタンを設置します（管理者専用）
- **権限**: 管理者専用（requireAdmin適用）
- **応答形式**: Ephemeral（プライベートメッセージ）

## 機能詳細

### 主な機能
1. 凸スナ設置ボタンの提供
2. 設定管理ボタンの提供
3. クイック設置ボタンの提供
4. 管理者向け案内表示

### ボタン構成
```javascript
const installButton = new ButtonBuilder()
  .setCustomId('totusuna_install_button')
  .setLabel('📝 凸スナ設置')
  .setStyle(ButtonStyle.Primary);

const configButton = new ButtonBuilder()
  .setCustomId('totusuna_config_button')
  .setLabel('⚙️ 設定管理')
  .setStyle(ButtonStyle.Secondary);

const quickButton = new ButtonBuilder()
  .setCustomId('totusuna_quick_button')
  .setLabel('⚡ クイック設置')
  .setStyle(ButtonStyle.Success);
```

### Embed構成
```javascript
const embed = createAdminEmbed(
  '📝 凸スナ設置メニュー',
  '以下のボタンから凸スナの設置・管理を行うことができます。'
).addFields(
  {
    name: '📝 凸スナ設置',
    value: '新しい凸スナを作成してチャンネルに設置します',
    inline: false
  },
  {
    name: '⚙️ 設定管理',
    value: '既存の凸スナの確認・編集・削除を行います',
    inline: false
  },
  {
    name: '⚡ クイック設置',
    value: 'テンプレートを使用して素早く凸スナを設置します',
    inline: false
  }
);
```

## 依存関係
- `discord.js`: SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags
- `../utils/permissions/requireAdmin`: 管理者権限チェック
- `../utils/embedHelper`: createAdminEmbed

## 実行フロー
1. 管理者権限チェック
2. Embed作成（機能説明）
3. ボタンUI作成
4. メッセージ送信

## 連携するハンドラ

### ボタンハンドラ
| ボタン | ハンドラファイル | 機能 |
|--------|------------------|------|
| 📝 凸スナ設置 | `utils/totusuna_setti/buttons/install.js` | 詳細設定での凸スナ作成 |
| ⚙️ 設定管理 | `utils/totusuna_setti/buttons/totusuna_config_button.js` | 既存凸スナの管理 |
| ⚡ クイック設置 | `utils/totusuna_setti/buttons/totusuna_quick_button.js` | 簡易凸スナ作成 |

### 設置フロー（📝 凸スナ設置）
1. ボタンクリック
2. 本文入力モーダル表示
3. 設置チャンネル選択
4. 複製チャンネル選択（オプション）
5. UUID生成と設置実行
6. JSON設定保存

### クイックフロー（⚡ クイック設置）
1. ボタンクリック
2. 本文入力モーダル表示
3. 現在のチャンネルに即座設置
4. 設定保存

## エラーハンドリング
```javascript
catch (error) {
  console.error('凸スナ設置メニューエラー:', error);
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: '❌ 凸スナ設置メニューの表示でエラーが発生しました。',
      flags: MessageFlags.Ephemeral
    });
  }
}
```

## 使用例
```
/凸スナ設置
→ 凸スナ設置メニュー表示
→ 「📝 凸スナ設置」選択
→ 本文入力 → チャンネル選択 → 設置完了

または

→ 「⚡ クイック設置」選択
→ 本文入力 → 即座設置完了
```

## 設置される凸スナの構造
```javascript
// 実際に設置されるメッセージ
const embed = new EmbedBuilder()
  .setTitle('📣 凸スナ報告受付中')
  .setDescription(userInputBody)
  .setColor(0x00bfff);

const button = new ButtonBuilder()
  .setCustomId(`totsuna:report:${uuid}`)
  .setLabel('凸スナ報告')
  .setStyle(ButtonStyle.Primary);
```

## データ永続化
設置後のデータ保存形式：
```javascript
// data/<guildId>/<guildId>.json
{
  "totsuna": {
    "instances": [
      {
        "id": "uuid-v4",
        "userId": "設置者ID",
        "body": "凸スナ本文",
        "installChannelId": "設置チャンネルID",
        "replicateChannelIds": ["複製先ID1", "複製先ID2"],
        "messageId": "DiscordメッセージID"
      }
    ]
  }
}
```

## 機能別詳細

### 📝 凸スナ設置（標準設置）
- **特徴**: 詳細設定可能
- **流れ**: 本文 → 設置先 → 複製先 → 設置
- **利点**: 柔軟な設定
- **用途**: 重要な告知・複数チャンネル配信

### ⚡ クイック設置
- **特徴**: 即座設置
- **流れ**: 本文 → 即座設置
- **利点**: 操作簡単
- **用途**: 緊急告知・単発案内

### ⚙️ 設定管理
- **特徴**: 一覧表示・編集
- **流れ**: 一覧 → 選択 → 編集/削除
- **利点**: 統合管理
- **用途**: メンテナンス・修正

## 想定利用シーン
1. **イベント告知**: 参加者募集の凸スナ設置
2. **緊急連絡**: 重要情報の即座配信
3. **定期案内**: 定期的な情報収集
4. **アンケート**: 意見・感想の収集

## 注意事項
- UUID重複の可能性は極めて低い（uuid v4使用）
- 設置後の本文変更は設定管理から実行
- チャンネル削除時の凸スナ動作に注意
- JSON保存失敗時のロールバック機能なし

## セキュリティ考慮
- 管理者権限必須
- UUID による一意識別
- チャンネル権限の継承
- 設定ファイルアクセス制御
