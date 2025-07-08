# KPI申請Bot 仕様書

## 概要
KPI申請Botは、Discord上でスタッフが店舗別の目標人数（KPI）を設定・報告できるBotです。Renderでホスティングされ、ファイルベースでデータ永続化されます。

## 機能一覧

| 機能              | 説明                                                                 |
|-------------------|----------------------------------------------------------------------|
| /kpi_設定         | 店舗名の追加、目標日・人数の登録を行うモーダルを表示                      |
| /kpi_設置         | KPI報告を行う案内メッセージを送信。店舗選択とKPI入力UIを表示               |
| モーダル送信処理   | モーダルで入力されたデータをファイルに保存。達成率計算のベースになる         |
| データ永続化       | Renderの /data ディレクトリに kpi_shops.json, kpi_ninzuu.json を保存      |
| HTTPサーバ        | Renderのヘルスチェック対応のため、ポートバインド付きのHTTPサーバを常駐       |

## 使用コマンド詳細

### /kpi_設定
- 追加する店舗名（カンマ区切り対応）
- 目標日（例: 2025-07-01）
- 目標人数（例: 20）

### /kpi_設置
- kpi_shops.json を読み取り、選択肢を表示
- 「KPIを入力する」ボタンを押すと報告用モーダルを出す（今後実装予定）

## データ構造

### data/kpi_shops.json
```json
[
  "新宿店",
  "池袋店"
]
```

### data/kpi_ninzuu.json
```json
{
  "新宿店": [
    {
      "date": "2025-07-01",
      "target": "20",
      "setBy": "User#1234",
      "setAt": "2025-06-28T00:00:00.000Z"
    }
  ]
}
```

## デプロイ・運用（Render）

### 永続ディスク設定
- Renderダッシュボード → Disks → Persistent Disk を追加
- /mnt/data などにマウント
- Node.js内の data ディレクトリをこのパスに変更

### HTTPサーバ（Render対応）
```js
import http from 'http';
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);
```

## .env 設定例

```
DISCORD_TOKEN=（Botのトークン）
CLIENT_ID=（アプリケーションID）
GUILD_ID=（サーバーID）
```

## コマンド登録方法（手動）

```bash
node register-commands.js
```

## 今後の拡張案（ToDo）

- KPI入力モーダルの実装
- SlackやWebhook連携
- KPI達成率の自動計算・表示
- 日報として過去データを出力する機能

