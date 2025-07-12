@echo off
chcp 65001 >nul
echo 🚀 自動GitHubアップロード処理開始

echo 📋 現在の変更状況...
git status --porcelain

echo.
echo 📂 すべての変更をステージング...
git add .

echo.
echo 💾 自動コミット実行...
set "timestamp=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
set "timestamp=%timestamp: =0%"
git commit -m "🔄 自動更新 - バックアップ管理改善 (%timestamp%)"

if errorlevel 1 (
    echo ⚠️ コミットする変更がありません。
    pause
    exit /b 0
)

echo.
echo 📤 GitHubにプッシュ中...
git push origin master

if errorlevel 1 (
    echo ❌ プッシュに失敗しました。
    echo 🔍 以下を確認してください:
    echo   - インターネット接続
    echo   - GitHub認証情報
    echo   - リポジトリアクセス権限
    pause
    exit /b 1
)

echo.
echo ✅ GitHubへの自動更新完了！
echo 📊 更新内容:
echo   - バックアップ保持数を2つに変更
echo   - 急な停止時の安全性向上
echo   - bash互換性の改善
echo.
echo 🌐 確認URL: https://github.com/star-discord/star_kanri_bot
echo.
pause
