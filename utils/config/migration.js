// utils/config/migration.js
const { CURRENT_SCHEMA_VERSION } = require('./schema');

/**
 * バージョン1から2への移行
 * - 説明: (例) chatgpt設定に新しい 'systemMessage' プロパティを追加
 * @param {object} data - 移行前のデータ
 * @returns {object} 移行後のデータ
 */
function from1to2(data) {
  console.log('  [MIGRATE] v1 -> v2: chatgpt.systemMessage を追加');
  if (!data.chatgpt) {
    data.chatgpt = {};
  }
  if (!data.chatgpt.systemMessage) {
    data.chatgpt.systemMessage = 'You are a helpful assistant.'; // デフォルト値
  }
  return data;
}

// 新しい移行関数はここに追加...
// function from2to3(data) { ... }

/**
 * 移行関数をバージョン順に格納した配列
 * 添字が (移行元バージョン - 1) に対応
 */
const migrations = [
  from1to2,
  // from2to3,
];

/**
 * データが必要なバージョンまで順次移行を実行する
 * @param {object} data - 永続化層から読み込んだデータ
 * @returns {object} 移行が完了したデータ
 */
function migrate(data) {
  let currentVersion = data._version || 1;
  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return data; // 移行不要
  }

  console.log(`[ConfigMigration] データ移行が必要: v${currentVersion} -> v${CURRENT_SCHEMA_VERSION}`);
  for (let i = currentVersion - 1; i < migrations.length; i++) {
    // 移行関数を呼び出し、データを更新する
    console.log(`  [MIGRATE] v${i + 1} -> v${i + 2} を実行します...`);
    data = migrationsi;
  }
  data._version = CURRENT_SCHEMA_VERSION;
  return data;
}

module.exports = { migrate };