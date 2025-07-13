# STAR管理Bot 開発ドキュメント

## プロジェクト概要

STAR管理Botは、Discord用の多機能管理ボットです。KPI管理、凸スナ（突発スナック報告）システム、ChatGPT連携機能を統合しています。

## 実装コマンド一覧

### 管理系コマンド
- `/star管理bot設定` - 管理者ロールと通知チャンネルの設定
- `/star管理bot_仕様書` - ボットの仕様書表示

### KPI管理系
- `/kpi_設定` - KPI報告の案内メッセージ送信
- `/kpi_setting` - KPI設定用モーダル表示

### 凸スナ管理系
- `/凸スナ設置` - 凸スナ報告UIをチャンネルに設置
- `/凸スナ設定` - 設置済み凸スナの確認・編集
- `/凸スナcsv` - 今月の凸スナ報告CSV保存状況確認

### ChatGPT連携系
- `/star_chat_gpt_config` - ChatGPT設定管理
- `/star_chat_gpt_setti` - ChatGPT案内メッセージとボタン設置

## パッケージ構成

### 主要依存関係（package.json）
```json
{
  "dependencies": {
    "discord.js": "^14.x.x",
    "dotenv": "^16.x.x",
    "uuid": "^9.x.x",
    "exceljs": "^4.x.x",
    "@google-cloud/storage": "^6.x.x",
    "openai": "^3.x.x"
  },
  "devDependencies": {
    "node": "^20.19.3"
  }
}
```

### 外部サービス連携
- **Google Cloud Storage**: ファイルバックアップ・同期
- **OpenAI API**: ChatGPT機能
- **Discord API**: Bot基本機能

## アーキテクチャ

### ディレクトリ構造
```
project/
├── commands/              # スラッシュコマンド
├── events/                # Discord イベントハンドラ
├── utils/                 # ユーティリティ・ハンドラ
│   ├── permissions/       # 権限管理
│   ├── kpi_setti/        # KPI機能
│   ├── star_chat_gpt_setti/ # ChatGPT機能
│   ├── star_config/      # 設定管理
│   ├── totusuna_setti/   # 凸スナ機能
│   └── totusuna_config/  # 凸スナ設定
└── data/                 # データ保存ディレクトリ
```

### コア設計パターン

#### 1. ハンドラーローダーシステム
```javascript
// utils/handlerLoader.js
function loadHandlers(dirPath) {
  // 動的にハンドラを読み込み、customId/customIdStartでルーティング
}
```

#### 2. 権限管理システム
```javascript
// utils/permissions/requireAdmin.js
function requireAdmin(executeFunction) {
  // 管理者権限チェック後に実行関数をラップ
}
```

#### 3. インタラクション統合処理
```javascript
// utils/buttonsHandler.js, modalsHandler.js, selectsHandler.js
// 各インタラクションタイプを統一的に処理
```

## 文字化け問題と対処法

### 発生した問題
PowerShellを使用したファイル操作により、日本語文字が文字化けする問題が発生しました。

### 文字化けパターンの特定
以下のような特徴的な文字化けパターンを発見・修正しました：

#### パターン1: PowerShell由来の文字化け
```
修正前: めE, すE, ！E, 閁E, 冁E, 褁E, ↁE
修正後: め, す, ！, 閁, 冁, 褁, ↁ (正常な日本語文字)
```

#### パターン2: 絵文字の文字化け
```
修正前: �, 老E, 珁E
修正後: 🤖, ⚙️, 📣 (正常な絵文字)
```

#### パターン3: コメント行の破損
```
修正前: const { SlashCommand[破損]const content = `🤖 **ChatGPT案内**\n[...]
修正後: const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
```

### 対処法

#### 1. 検索パターンによる一括検出
```bash
grep -r "めE|すE|！E|閁E|冁E|褁E|ↁE|�E" --include="*.js" ./
```

#### 2. 段階的修正プロセス
1. **文字化けパターンの特定**: 正規表現で文字化け箇所を検索
2. **文脈の確認**: 前後のコードから正しい文字を推定
3. **置換修正**: 正確な文字列置換で修正
4. **構文チェック**: Node.js構文チェックで検証

#### 3. PowerShell使用禁止
```javascript
// 文字化け防止のため、PowerShell関連のコマンド実行を禁止
// 代替案: Node.js標準APIまたはUnix系コマンドを使用
```

### 修正されたファイル一覧
- `commands/star_chat_gpt_setti.js`: インポート文と絵文字の修正
- `utils/kpiFileUtil.js`: エラーメッセージ内の日本語修正
- `utils/star_chat_gpt_setti/buttons/chatgpt_config_button.js`: モーダルタイトル絵文字修正
- `utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js`: ファイルパスコメントと絵文字修正

## データ管理

### JSON設定ファイル構造
```javascript
// data/<guildId>/<guildId>.json
{
  "star_config": {
    "adminRoleIds": ["role_id_1", "role_id_2"],
    "notifyChannelId": "channel_id"
  },
  "totsuna": {
    "instances": [
      {
        "id": "uuid",
        "userId": "user_id",
        "body": "報告内容",
        "installChannelId": "channel_id",
        "replicateChannelIds": ["channel_id_1"],
        "messageId": "message_id"
      }
    ]
  }
}
```

### CSV/Excel出力
- **凸スナ報告**: `data/<guildId>/<年月>-凸スナ報告.csv`
- **KPIデータ**: ExcelJS + Google Cloud Storage連携

## セキュリティ

### 環境変数管理
```bash
# .env
DISCORD_TOKEN=your_discord_bot_token
OPENAI_API_KEY=your_openai_api_key
GCS_BUCKET_NAME=your_gcs_bucket
GCP_PROJECT_ID=your_gcp_project
GCP_CREDENTIALS_JSON=path/to/service-account.json
```

### 権限制御
- 管理者コマンドは`requireAdmin`ミドルウェアで保護
- ロールベースのアクセス制御
- Ephemeralメッセージによるプライバシー保護

## デプロイメント

### PM2設定（ecosystem.config.js）
```javascript
module.exports = {
  apps: [{
    name: 'star_kanri_bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### Git管理
```bash
# リモートリポジトリ
git remote add origin https://github.com/star-discord/star_kanri_bot.git

# デプロイ
git add .
git commit -m "文字化け修正: 最終段階完了"
git push origin master
```

## トラブルシューティング

### 1. 文字化け発生時
1. `grep -r "めE|すE|！E" --include="*.js" ./` で検索
2. エディタでUTF-8エンコーディング確認
3. PowerShellではなくNode.jsやUnixコマンド使用

### 2. デプロイエラー
1. `node -c deploy-commands.js` で構文チェック
2. 環境変数の設定確認
3. Discord Bot Tokenの有効性確認

### 3. 権限エラー
1. `star_config.adminRoleIds`の設定確認
2. ボットの権限設定確認
3. チャンネル権限の確認

## 開発者向けガイド

### 新機能追加手順
1. `commands/`にスラッシュコマンド追加
2. `utils/`に対応するハンドラ作成
3. `handlerLoader.js`でルーティング設定
4. 権限が必要な場合は`requireAdmin`適用

### コード品質
- ESLint設定による一貫したコーディングスタイル
- JSDocによるドキュメント化
- エラーハンドリングの統一（`errorHelper.js`）

### テスト環境
- 開発用Discordサーバーでのテスト推奨
- ログレベルによるデバッグ情報出力
- PM2による本番環境監視

---

**最終更新**: 2025年7月13日  
**文字化け対応**: 完了（PowerShell由来の文字化けパターン修正）  
**機能状態**: 全機能正常動作確認済み

## エラー解析・対処履歴

### 2025年7月13日: star_configコマンド インタラクション失敗エラー

#### 🚨 発生したエラー
**症状**: `star_config`コマンド実行後、管理者ロール選択時に「インタラクションに失敗しました」エラー

**エラーメッセージ**: 
```
インタラクションに失敗しました
```

#### 🔍 根本原因分析

1. **Discord.js MessageComponentCollector の設定エラー**
   ```javascript
   // ❌ 間違った設定（論理OR演算子使用）
   componentType: ComponentType.RoleSelect || ComponentType.ChannelSelect
   
   // ✅ 正しい設定（配列形式）
   componentType: [ComponentType.RoleSelect, ComponentType.ChannelSelect]
   ```

2. **ユーザーフィルタリングの不備**
   - 他のユーザーのインタラクションも処理してしまう問題
   - コレクターに適切なフィルター未設定

3. **エラーハンドリングの不足**
   - try-catch構文の構造的問題
   - インタラクション状態チェックの不備

#### 🛠️ 実施した対処法

##### 1. コレクター設定の修正
```javascript
// 修正前
const collector = interaction.channel?.createMessageComponentCollector({
  componentType: ComponentType.RoleSelect || ComponentType.ChannelSelect,
  time: 60_000
});

// 修正後
const collector = interaction.channel?.createMessageComponentCollector({
  componentType: [ComponentType.RoleSelect, ComponentType.ChannelSelect],
  filter: i => i.user.id === interaction.user.id,
  time: 60_000
});
```

**重要**: Discord.jsでは複数のコンポーネントタイプを指定する場合、配列を使用する必要がある

##### 2. ユーザーフィルターの追加
```javascript
filter: i => i.user.id === interaction.user.id
```
- コマンド実行者以外のインタラクションを除外
- セキュリティとユーザビリティの向上

##### 3. エラーハンドリングの強化
```javascript
collector.on('collect', async selectInteraction => {
  try {
    // コレクター処理ロジック
    const customId = selectInteraction.customId;
    
    if (customId === 'admin_role_select') {
      // ロール処理
    } else if (customId === 'notify_channel_select') {
      // チャンネル処理
    }
  } catch (error) {
    console.error('❌ セレクト処理エラー:', error);
    if (!selectInteraction.replied && !selectInteraction.deferred) {
      await selectInteraction.reply({
        content: '❌ 処理中にエラーが発生しました。もう一度お試しください。',
        flags: 1 << 6,
        ephemeral: true
      });
    }
  }
});
```

##### 4. 構文エラーの解決
- 重複した閉じ括弧を削除
- try-catch構文の正しい構造に修正

#### 📋 修正手順のチェックリスト

- [x] **Discord.js APIリファレンス確認**
  - MessageComponentCollectorの正しい使用法
  - componentTypeパラメータの仕様確認

- [x] **コレクター設定の修正**
  - 論理演算子から配列形式に変更
  - フィルター機能の追加

- [x] **エラーハンドリング追加**
  - try-catch構文での処理保護
  - インタラクション状態の適切なチェック

- [x] **構文チェック**
  - `get_errors`ツールでの構文確認
  - Node.js構文解析での検証

- [x] **Git管理とデプロイ**
  - 変更のコミットとプッシュ
  - 本番環境での動作確認

#### 💡 学習ポイント・今後の対策

1. **Discord.js v14の仕様理解**
   - コンポーネントタイプは配列で指定
   - 論理演算子での複数指定は無効

2. **MessageComponentCollectorのベストプラクティス**
   - 必ずフィルター機能を使用
   - ユーザー認証を確実に行う
   - タイムアウト処理の実装

3. **エラーハンドリングパターン**
   ```javascript
   // 推奨パターン
   try {
     await interaction処理();
   } catch (error) {
     console.error('エラー詳細:', error);
     if (!interaction.replied && !interaction.deferred) {
       await interaction.reply({ content: 'エラーメッセージ', ephemeral: true });
     }
   }
   ```

4. **デバッグ手法**
   - コンソールログでの状態確認
   - Discord Developer Portalでのエラー監視
   - 段階的なコード検証

#### 🔄 今後の類似エラー対処法

1. **インタラクション失敗エラーが発生した場合**
   ```bash
   # 1. 構文エラーチェック
   node -c commands/[コマンド名].js
   
   # 2. Discord.js APIの確認
   # - 公式ドキュメントでの仕様確認
   # - 使用しているバージョンとの互換性
   
   # 3. コレクター設定の見直し
   # - componentTypeの配列形式確認
   # - フィルター機能の実装確認
   ```

2. **予防的対策**
   - 新機能実装時のテンプレート使用
   - エラーハンドリングの標準化
   - 定期的なDiscord.js更新チェック

#### 📊 対処結果

- ✅ **問題解決**: インタラクション失敗エラー完全解決
- ✅ **機能改善**: ユーザーフィルタリング追加
- ✅ **安定性向上**: 包括的エラーハンドリング実装
- ✅ **コード品質**: 構文エラー0件達成

**検証済み環境**: Discord.js v14.x, Node.js v20.x  
**修正コミット**: `3fb8454` - Fix star_config interaction failures

### Discord.js v14 共通エラーパターンと対処法

#### 🎯 よくあるエラーパターン

##### 1. インタラクション関連エラー
```javascript
// ❌ よくある間違い
componentType: Type1 || Type2  // 論理演算子
componentType: Type1          // 単一タイプのみ

// ✅ 正しい書き方
componentType: [Type1, Type2] // 配列形式
```

##### 2. 権限エラー
```javascript
// ❌ 権限チェック不足
if (member.roles.cache.has(roleId)) // null可能性

// ✅ 安全な権限チェック
if (member?.permissions?.has('Administrator') || 
    member?.roles?.cache?.some(role => adminRoleIds.includes(role.id)))
```

##### 3. ファイル操作エラー
```javascript
// ❌ エラーハンドリングなし
const data = await readJSON(filePath);

// ✅ 適切なエラーハンドリング
try {
  const data = await readJSON(filePath);
} catch (error) {
  console.error('ファイル読み込みエラー:', error);
  return await interaction.reply({ content: 'エラーが発生しました', ephemeral: true });
}
```

#### 🛠️ エラー対処テンプレート

##### コマンド実装テンプレート
```javascript
module.exports = {
  data: new SlashCommandBuilder()
    .setName('コマンド名')
    .setDescription('説明'),

  async execute(interaction) {
    try {
      // 権限チェック
      if (!hasPermission(interaction.member)) {
        return await interaction.reply({
          content: '❌ 権限がありません',
          ephemeral: true
        });
      }

      // メイン処理
      await interaction.reply({ content: '処理完了' });

    } catch (error) {
      console.error('コマンドエラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ エラーが発生しました',
          ephemeral: true
        });
      }
    }
  }
};
```

##### コレクター実装テンプレート
```javascript
const collector = interaction.channel?.createMessageComponentCollector({
  componentType: [ComponentType.Button, ComponentType.StringSelect], // 配列形式
  filter: i => i.user.id === interaction.user.id, // ユーザーフィルター必須
  time: 60_000 // タイムアウト設定
});

collector.on('collect', async (componentInteraction) => {
  try {
    // 処理ロジック
    await componentInteraction.update({ content: '更新完了' });
  } catch (error) {
    console.error('コレクターエラー:', error);
    if (!componentInteraction.replied && !componentInteraction.deferred) {
      await componentInteraction.reply({
        content: '❌ 処理エラー',
        ephemeral: true
      });
    }
  }
});

collector.on('end', (collected) => {
  if (collected.size === 0) {
    // タイムアウト処理
  }
});
```

#### 📋 エラー診断チェックリスト

##### インタラクション失敗時
- [ ] componentTypeが配列形式か確認
- [ ] filterが設定されているか確認  
- [ ] try-catch構文が正しいか確認
- [ ] interaction.replied/deferredチェックがあるか確認

##### 権限エラー時
- [ ] Discord標準権限とBot独自権限の区別
- [ ] null/undefinedチェックの実装
- [ ] エラーメッセージの適切性

##### ファイル操作エラー時
- [ ] ファイルパスの存在確認
- [ ] JSON構造の妥当性
- [ ] 非同期処理の適切なawait使用

#### 🚀 予防的開発手法

1. **段階的実装**
   - 基本機能→エラーハンドリング→UI改善の順序
   - 各段階での動作確認

2. **ログ戦略**
   ```javascript
   console.log('🔍 デバッグ:', { userId, guildId, action });
   console.error('❌ エラー:', error.message, error.stack);
   ```

3. **テスト環境活用**
   - 開発用Discordサーバーでの検証
   - PM2による本番監視

**エラー対策更新**: 2025年7月13日  
**対応Discord.jsバージョン**: v14.x  
**実証済みパターン**: star_config, kpi_setting, totusuna_setti
