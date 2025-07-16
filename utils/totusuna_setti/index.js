// utils/totusuna_setti/buttons/index.js
const fs = require('fs');
const path = require('path');

// ...（現状の読み込みコード）...

module.exports = {
  findHandler,  // カスタムIDからハンドラーを返す関数
  listHandlers: () => Object.keys(handlers),  // 任意で登録済みハンドラ一覧を返すなど
};
