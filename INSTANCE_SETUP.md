# 🚀 インスタンス初回セットアップ手順

## 1️⃣ 初回セットアップ（権限衝突解消）

```bash
# 1. 完全同期で Git マスター状態にする
cd ~/star_kanri_bot
chmod +x sync_from_github.sh
./sync_from_github.sh

# 2. 以降は通常更新のみ
chmod +x update.sh
./update.sh
```

## 2️⃣ 通常運用（日々の更新）

```bash
# 通常はこれだけ（1回実行）
cd ~/star_kanri_bot
./update.sh
```

## 🎯 この手順の効果

### ✅ 解決される問題
- ❌ 権限不足エラー → ✅ 自動権限付与
- ❌ Git衝突エラー → ✅ マスター同期済み
- ❌ ローカル変更検出 → ✅ クリーンな状態

### 🔄 更新頻度の目安
- **日常**: `./update.sh` のみ
- **緊急時**: `./sync_from_github.sh` で完全リセット
- **初回**: sync → update の順番

## 💡 よくある質問

**Q: 何回実行すればいい？**
A: 通常は1回。エラーが出たら再実行してください。

**Q: sync と update の違いは？**
A: 
- `sync_from_github.sh`: 完全リセット（緊急時・初回）
- `update.sh`: 安全更新（日常使用）

**Q: 権限エラーが出る場合は？**
A: `chmod +x update.sh` を再実行してから `./update.sh`
