# OpenAI API エラー対処ガイド

## 概要
OpenAI APIの利用時に発生する各種エラーへの対処方法と、ボット内での適切なエラーハンドリング実装について説明します。

## 主要エラーコードと対処法

### 1. insufficient_quota (HTTP 429)
```json
{
  "error": {
    "message": "You exceeded your current quota, please check your plan and billing details.",
    "type": "insufficient_quota",
    "param": null,
    "code": "insufficient_quota"
  }
}
```

**原因**: 月次利用限度額に達した
**対処法**:
1. [OpenAI Platform](https://platform.openai.com/account/billing)で課金状況確認
2. プランのアップグレード検討
3. 使用量の監視・制限実装

### 2. rate_limit_exceeded (HTTP 429)
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit reached for requests"
  }
}
```

**原因**: リクエスト頻度制限に達した
**対処法**:
1. リクエスト間隔の調整
2. リトライロジックの実装
3. 同時リクエスト数の制限

### 3. invalid_api_key (HTTP 401)
```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "Invalid API key provided"
  }
}
```

**原因**: APIキーが無効または期限切れ
**対処法**:
1. `.env`ファイルのAPIキー確認
2. [OpenAI Platform](https://platform.openai.com/api-keys)でキー再生成
3. 環境変数の再設定

## ボット内実装

### エラーハンドリング実装 (utils/openai.js)
```javascript
/**
 * OpenAI APIエラーハンドリング付きラッパー関数
 */
async function safeOpenAICall(apiCall, fallbackResponse = null) {
  try {
    return await apiCall();
  } catch (error) {
    const apiError = error.response?.data?.error;
    
    switch (apiError?.code) {
      case 'insufficient_quota':
        return {
          error: true,
          message: '🚫 OpenAI APIのクォータを超過しました。',
          type: 'quota_exceeded'
        };
        
      case 'rate_limit_exceeded':
        return {
          error: true,
          message: '⏳ APIリクエストが多すぎます。',
          type: 'rate_limit'
        };
        
      case 'invalid_api_key':
        return {
          error: true,
          message: '🔑 OpenAI APIキーが無効です。',
          type: 'authentication_error'
        };
        
      default:
        return fallbackResponse || {
          error: true,
          message: '❌ ChatGPT機能は現在利用できません。',
          type: 'service_unavailable'
        };
    }
  }
}
```

### フォールバック機能
エラー時にはデフォルトの応答を返すよう実装：

```javascript
// ChatGPTボタンでの実装例
const weatherResponse = await getChatCompletion('今日の天気情報を教えてください。');

if (weatherResponse.error) {
  console.warn('天気情報取得エラー:', weatherResponse.message);
  weatherInfo = 'デフォルトの天気情報'; // フォールバック
} else {
  weatherInfo = weatherResponse.data?.choices?.[0]?.message?.content;
}
```

## 監視・運用

### 1. エラー監視
```javascript
// エラーログの記録
console.error('OpenAI APIエラー:', {
  errorCode: apiError.code,
  errorType: apiError.type,
  message: apiError.message,
  timestamp: new Date().toISOString()
});
```

### 2. 使用量監視
- [OpenAI Platform Dashboard](https://platform.openai.com/account/usage)で日次使用量確認
- 月次限度額の80%到達時に通知設定推奨

### 3. コスト最適化
```javascript
// APIリクエスト最適化
const defaultOptions = {
  model: 'gpt-3.5-turbo',        // 安価なモデル使用
  max_tokens: 150,               // トークン数制限
  temperature: 0.7,              // 適切な創造性設定
};
```

## 環境設定

### .env ファイル設定
```bash
# OpenAI API設定
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150
OPENAI_TEMPERATURE=0.7
```

### 環境変数チェック
```javascript
// 起動時チェック
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY が設定されていません。OpenAI連携は無効になります。');
}
```

## トラブルシューティング

### よくある問題と解決法

#### 1. クォータ超過エラー
- **症状**: `insufficient_quota` エラー
- **確認**: OpenAI Platformの請求設定
- **解決**: プランアップグレードまたは使用量削減

#### 2. レート制限エラー
- **症状**: `rate_limit_exceeded` エラー  
- **確認**: リクエスト頻度
- **解決**: リクエスト間隔調整、リトライ実装

#### 3. 認証エラー
- **症状**: `invalid_api_key` エラー
- **確認**: APIキーの有効性
- **解決**: 新しいAPIキー生成・設定

#### 4. ネットワークエラー
- **症状**: 接続タイムアウト
- **確認**: インターネット接続
- **解決**: DNS設定確認、プロキシ設定

## 予防策

### 1. 事前監視
- 使用量ダッシュボードの定期確認
- 月次予算の設定
- アラート設定の実装

### 2. フォールバック実装
- 静的コンテンツの準備
- エラー時の適切なユーザー通知
- 機能の段階的縮退

### 3. 最適化
- 不要なAPIリクエストの削減
- キャッシュ機能の実装
- バッチ処理の検討

## 参考リンク
- [OpenAI Platform](https://platform.openai.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Error Codes Documentation](https://platform.openai.com/docs/guides/error-codes)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

---

**最終更新**: 2025年7月13日  
**対応状況**: エラーハンドリング実装完了
