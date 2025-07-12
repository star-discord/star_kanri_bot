#!/bin/bash

echo "🚀 GitHub完全同期スクリプト開始"
echo "⚠️  注意: すべてのローカル変更が破棄され、GitHubの最新版に上書きされます"
echo "🔄 自動実行モードで続行します..."

cd ~/star_kanri_bot || {
    echo "❌ star_kanri_botディレクトリが見つかりません"
    exit 1
}

echo "📊 同期前の状態確認..."
echo "現在のブランチ: $(git branch --show-current)"
echo "最新コミット: $(git log --oneline -1)"
echo ""

echo "🔄 GitHub最新版を取得中..."
git fetch origin master

echo "📥 完全同期実行中..."
# 現在のブランチをmasterに切り替え
git checkout master

# GitHubの最新版に完全同期（すべてのローカル変更を破棄）
git reset --hard origin/master

# 追跡されていないファイルと無視されるファイルをすべて削除
echo "🧹 不要ファイルをクリーンアップ中..."
git clean -fdx

echo ""
echo "✅ GitHub完全同期完了！"
echo "📊 同期後の状態:"
echo "現在のブランチ: $(git branch --show-current)"
echo "最新コミット: $(git log --oneline -1)"
echo ""

# 権限修復
echo "🔧 実行権限を修復中..."
chmod +x update.sh
chmod +x sync_from_github.sh

echo "🎉 すべての処理が完了しました！"
echo "💡 次のステップ: ./update.sh を実行してBotを更新してください"
