@echo off
chcp 65001 >nul
setlocal

echo 🚀 自動GitHubアップロード処理開始
echo.

:: --- 現在のブランチ名を取得 ---
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do (
    set "CURRENT_BRANCH=%%a"
)
if not defined CURRENT_BRANCH (
    echo ❌ Gitブランチの取得に失敗しました。Gitリポジトリ内で実行していますか？
    pause
    exit /b 1
)
echo 🌿 現在のブランチ: %CURRENT_BRANCH%
echo.

:: --- 変更状況の確認 ---
echo 📋 現在の変更状況:
git status --porcelain

:: --- ステージング ---
echo 📂 すべての変更をステージングします...
git add .
echo.

:: --- コミットする変更があるか確認 ---
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo ✅ コミットする変更はありません。
    pause
    exit /b 0
)

:: --- コミットメッセージの取得 ---
set "COMMIT_MESSAGE=%~1"
if "%COMMIT_MESSAGE%"=="" (
    echo [?] コミットメッセージを入力してください (例: 機能追加、バグ修正など):
    set /p "COMMIT_MESSAGE="
)

if "%COMMIT_MESSAGE%"=="" (
    echo ⚠️ コミットメッセージが入力されなかったため、処理を中止します。
    pause
    exit /b 1
)

:: --- コミット実行 ---
echo 💾 コミットを実行中...
git commit -m "%COMMIT_MESSAGE%"
if %errorlevel% neq 0 (
    echo ⚠️ コミットに失敗しました。コミットする変更がないか、他のエラーが発生した可能性があります。
    pause
    exit /b 1
)
echo.

:: --- プッシュ実行 ---
echo 📤 GitHub (%CURRENT_BRANCH% ブランチ) にプッシュ中...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo ❌ プッシュに失敗しました。
    echo 🔍 以下を確認してください:
    echo   - インターネット接続
    echo   - GitHub認証情報 (SSHキー、PATなど)
    echo   - リポジトリアクセス権限
    pause
    exit /b 1
)
echo.

:: --- 完了メッセージ ---
echo ✅ GitHubへのアップロードが正常に完了しました！
echo 🌐 リポジトリURL: https://github.com/star-discord/star_kanri_bot
echo.
pause