const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// selects ディレクトリの絶対パスを取得
const selectsDir = path.join(__dirname, 'selects');

// 共通ローダーでハンドラ探索関数を生成
const findHandler = loadHandlers(selectsDir);

// そのままエクスポート（他の handler 同様）
module.exports = findHandler;
