#!/bin/bash

# InteractionResponseFlags -> MessageFlags 一括置換スクリプト

echo "🔄 InteractionResponseFlags を MessageFlags に一括置換中..."

# インポート文の置換
find . -name "*.js" -exec sed -i 's/const { InteractionResponseFlags }/const { MessageFlags }/g' {} \;
find . -name "*.js" -exec sed -i 's/InteractionResponseFlags$/MessageFlags/g' {} \;

# 使用箇所の置換
find . -name "*.js" -exec sed -i 's/InteractionResponseFlags\.Ephemeral/MessageFlags.Ephemeral/g' {} \;

echo "✅ 一括置換完了"
